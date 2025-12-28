import createError from "http-errors";
import { verifyToken } from "../utils/jwt.js";
import { User } from "../models/User.js";

export async function requireAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) return next(createError(401, "Missing authorization token"));

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub).select("-passwordHash");
    if (!user) return next(createError(401, "Invalid token"));
    req.user = user;
    next();
  } catch (e) {
    next(createError(401, "Invalid or expired token"));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    const role = req.user?.role;
    if (!role || !roles.includes(role)) return next(createError(403, "Forbidden"));
    next();
  };
}
