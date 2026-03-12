import { Request, Response, NextFunction } from "express";

// Replit injects X-Replit-User-* headers for authenticated users
export function replitAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.headers["x-replit-user-id"] as string | undefined;
  const userName = req.headers["x-replit-user-name"] as string | undefined;
  const userImage = req.headers["x-replit-user-profile-image"] as string | undefined;
  const userRoles = req.headers["x-replit-user-roles"] as string | undefined;

  if (userId) {
    (req as any).replUser = {
      id: userId,
      name: userName || null,
      profileImage: userImage || null,
      roles: userRoles ? userRoles.split(",") : [],
    };
  } else {
    (req as any).replUser = null;
  }

  next();
}
