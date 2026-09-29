import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError, ForbiddenError } from "../client-error";
import { RoleId } from "../enums";

class AuthMiddleware {

    public verifyToken(secretKey: string) {
        return (req: Request, res: Response, next: NextFunction) => {
            (req as any).user = this.decode(req, secretKey);
            next();
        };
    }

    // For routes that are public but behave differently for logged-in users:
    // no token -> continue as a guest, valid token -> set req.user, invalid/expired token -> 401.
    public optionalToken(secretKey: string) {
        return (req: Request, res: Response, next: NextFunction) => {
            if (req.headers.authorization) (req as any).user = this.decode(req, secretKey);
            next();
        };
    }

    public verifyAdmin(secretKey: string) {
        return (req: Request, res: Response, next: NextFunction) => {
            const payload = this.decode(req, secretKey);
            (req as any).user = payload;
            const roleId = (payload as any)?.slimUser?.roleId;
            if (roleId !== RoleId.Admin) throw new ForbiddenError("Admin access required");
            next();
        };
    }

    private decode(req: Request, secretKey: string) {
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new UnauthorizedError("Missing token");

        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

        try {
            return jwt.verify(token, secretKey);
        } catch {
            throw new UnauthorizedError("Invalid token");
        }
    }

}

export const authMiddleware = new AuthMiddleware();
