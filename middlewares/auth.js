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
}
