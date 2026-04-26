import { Router, type IRouter, type Request, type Response } from "express";
import {
  GetCurrentAuthUserResponse,
  LogoutMobileSessionResponse,
} from "@workspace/api-zod";
import bcrypt from "bcryptjs";
import { db, usersTable, emailCredentialsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import {
  clearSession,
  getSessionId,
  createSession,
  deleteSession,
  SESSION_COOKIE,
  SESSION_TTL,
  type SessionData,
} from "../lib/auth";

const router: IRouter = Router();

function setSessionCookie(req: Request, res: Response, sid: string) {
  // If we have a FRONTEND_URL, we are in a cross-domain setup (Vercel -> Railway)
  // This requires SameSite=None and Secure=true
  const isCrossDomain = !!process.env.FRONTEND_URL;

  res.cookie(SESSION_COOKIE, sid, {
    httpOnly: true,
    secure: isCrossDomain, // Must be secure for SameSite=None
    sameSite: isCrossDomain ? "none" : "lax",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

router.get("/auth/user", (req: Request, res: Response) => {
  res.json(
    GetCurrentAuthUserResponse.parse({
      user: req.isAuthenticated() ? req.user : null,
    }),
  );
});

router.post("/auth/register", async (req: Request, res: Response) => {
  const { email, password, firstName, lastName } = req.body as {
    email?: string; password?: string; firstName?: string; lastName?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existing = await db
    .select()
    .from(emailCredentialsTable)
    .where(eq(emailCredentialsTable.email, normalizedEmail))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "An account with this email already exists" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(usersTable)
    .values({
      email: normalizedEmail,
      firstName: firstName?.trim() || null,
      lastName: lastName?.trim() || null,
    })
    .returning();

  await db.insert(emailCredentialsTable).values({
    email: normalizedEmail,
    passwordHash,
    userId: user.id,
  });

  const sessionData: SessionData = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: null,
    },
    access_token: "email-auth",
  };

  const sid = await createSession(sessionData);
  setSessionCookie(req, res, sid);
  res.json({ success: true });
});

router.post("/auth/login/email", async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  const normalizedEmail = email.trim().toLowerCase();

  const [cred] = await db
    .select()
    .from(emailCredentialsTable)
    .where(eq(emailCredentialsTable.email, normalizedEmail))
    .limit(1);

  if (!cred) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const valid = await bcrypt.compare(password, cred.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Invalid email or password" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, cred.userId))
    .limit(1);

  if (!user) {
    res.status(500).json({ error: "User not found" });
    return;
  }

  const sessionData: SessionData = {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
    },
    access_token: "email-auth",
  };

  const sid = await createSession(sessionData);
  setSessionCookie(req, res, sid);
  res.json({ success: true });
});



router.get("/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  await clearSession(res, sid);

  res.redirect("/");
});



router.post("/mobile-auth/logout", async (req: Request, res: Response) => {
  const sid = getSessionId(req);
  if (sid) {
    await deleteSession(sid);
  }
  res.json(LogoutMobileSessionResponse.parse({ success: true }));
});

export default router;
