import jwt from "jsonwebtoken";
import User from "../models/User.js";


export const protect = async (req, res, next) => {

  try {

    const token = req.headers.authorization?.split(" ")[1];


    if (!token) {

      return res.status(401).json({
        message: "No token provided"
      });

    }


    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );


    const user = await User.findById(decoded.id);


    if (!user) {

      return res.status(404).json({
        message: "User not found"
      });

    }


    req.user = user;


    next();


  } catch (error) {

    res.status(401).json({
      message: "Invalid token"
    });

  }

};




export const adminOnly = (req, res, next) => {


  // Super admin is always allowed; legacy "admin" role keeps existing access.
  const allowed = ["admin", "super_admin"];
  if (!allowed.includes(req.user.role)) {

    return res.status(403).json({
      message: "Admin access required"
    });

  }


  next();

};


/**
 * authorize(...roles) — role-based access control helper.
 * Prepares the backend for future roles (admin, content_editor, etc.).
 * Keeps backward compatibility: super_admin can always pass.
 */
export const authorize = (...roles) => (req, res, next) => {
  const allowedRoles = new Set([...roles, "super_admin"]);
  if (!allowedRoles.has(req.user.role)) {
    return res.status(403).json({ message: "You do not have permission for this action." });
  }
  next();
};
