import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

// Replit Auth login redirect
router.get("/auth/login", (_req, res): void => {
  // Replit Auth: redirect to Replit's OAuth flow
  res.redirect("https://replit.com/auth_with_repl_site?domain=" + (process.env.REPLIT_DOMAINS?.split(",")[0] || "localhost"));
});

// Replit Auth logout
router.get("/auth/logout", (_req, res): void => {
  res.redirect("/");
});

// Get current authenticated user
router.get("/auth/me", async (req, res): Promise<void> => {
  const replUser = (req as any).replUser;

  if (!replUser) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  // Upsert user in our database
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, replUser.id))
    .limit(1);

  let user;
  if (existing.length === 0) {
    const [inserted] = await db
      .insert(usersTable)
      .values({
        id: replUser.id,
        name: replUser.name || null,
        profileImage: replUser.profileImage || null,
        role: "worker",
      })
      .returning();
    user = inserted;
  } else {
    user = existing[0];
  }

  res.json({
    id: user.id,
    name: user.name,
    profileImage: user.profileImage,
    roles: [user.role],
  });
});

export default router;
