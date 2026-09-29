import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "@nltech/rest";
import {appConfig} from "../app-config";

export function verifyToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader) throw new UnauthorizedError("Missing token");

    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

    try {
        const payload = jwt.verify(token, appConfig.secretKey);
        (req as any).user = payload;
        next();
    } catch {
        throw new UnauthorizedError("Invalid token");
    }
}
