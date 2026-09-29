import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../client-error";

export function requireAuth(secretKey: string) {
    return function (req: Request, res: Response, next: NextFunction) {
        const authHeader = req.headers.authorization;
        if (!authHeader) throw new UnauthorizedError("Missing token");

        const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

        try {
            (req as any).user = jwt.verify(token, secretKey);
            next();
        } catch {
            throw new UnauthorizedError("Invalid token");
        }
    };
}
