import { Response, NextFunction } from 'express';

// Middleware to check if user has required role(s)
export const requireRole = (allowedRoles: string[]) => {
    return (req: any, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userRole = req.user.role;

        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                message: `Access denied. Required role: ${allowedRoles.join(' or ')}`
            });
        }

        next();
    };
};

// Specific role checkers
export const requireSPOC = requireRole(['spoc']);
export const requireAdmin = requireRole(['admin']);
export const requireStudent = requireRole(['student']);
export const requireSPOCorAdmin = requireRole(['spoc', 'admin']);
