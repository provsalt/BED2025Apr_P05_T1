import { ErrorFactory } from "../utils/AppError.js";

export const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(ErrorFactory.unauthorized("User authentication required"));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(ErrorFactory.forbidden(
                `Access denied. Required role: ${allowedRoles.join(" or ")}. Current role: ${req.user.role}`
            ));
        }

        next();
    };
};