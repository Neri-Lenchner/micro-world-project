import {NextFunction, Request, Response} from "express";
import {UnauthorizedError} from "../client-error";

export interface CurrentUser {
    id: number;
    email: string;
}

// The Gateway verifies the JWT and forwards who the user is in these headers.
// A service trusting these must only be reachable through the Gateway.
export function getCurrentUser(req: Request): CurrentUser | undefined {
    const id = Number(req.headers["x-user-id"]);
    const email = req.headers["x-user-email"];
    if (!Number.isInteger(id) || id <= 0 || typeof email !== "string" || !email) return undefined;
    return {id, email};
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
    if (!getCurrentUser(req)) throw new UnauthorizedError("You must be logged in");
    next();
}
