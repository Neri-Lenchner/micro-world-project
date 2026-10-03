import express, {Request, Response, Router} from "express";
import {StatusCode, getCurrentUser, requireUser} from "@nltech/rest";
import {notificationService} from "./notification-service";

class NotificationController {

    router: Router = express.Router();

    constructor() {
        this.router.get("/api/notifications", requireUser, this.list);
        this.router.put("/api/notifications/read-all", requireUser, this.markAllRead);
        this.router.put("/api/notifications/:id/read", requireUser, this.markRead);
    }

    public async list(request: Request, response: Response) {
        response.json(await notificationService.list(getCurrentUser(request)!));
    }

    public async markRead(request: Request, response: Response) {
        await notificationService.markRead(request.params.id as string, getCurrentUser(request)!);
        response.sendStatus(StatusCode.NoContent);
    }

    public async markAllRead(request: Request, response: Response) {
        await notificationService.markAllRead(getCurrentUser(request)!);
        response.sendStatus(StatusCode.NoContent);
    }
}

export const notificationController = new NotificationController();
