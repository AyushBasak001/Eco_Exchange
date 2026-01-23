import { verifyToken } from "../utils/jwt.js";

export function authRequired(allowedRoles = []) {
    return (req, res, next) => {
        const token = req.cookies?.auth_token;
        if (!token) {
            return res.redirect('/auth');
        }

        try {
            const decoded = verifyToken(token);

            if (
                allowedRoles.length &&
                !allowedRoles.includes(decoded.role)
            ) {
                return res.status(403).json({ message: "Forbidden" });
            }

            req.user = decoded;
            next();
        } catch {
            return res.redirect('/auth');
        }
    };
};

export const attachUser = (req, res, next) => {
    const token = req.cookies?.auth_token; // name of your JWT cookie

    if (!token) {
        res.locals.user = null;
        return next();
    }

    try {
        const decoded = verifyToken(token);
        res.locals.user = decoded;
        // { id, username, role }
    } catch (err) {
        res.locals.user = null;
    }

    next();
};
