import express, {Request, Response, Router} from "express";
import {StatusCode, getCurrentUser, requireUser} from "@nltech/rest";
import {orderService} from "./order-service";

function role(request: Request): "buying" | "selling" {
    return request.query.role === "selling" ? "selling" : "buying";
}

class OrderController {

    router: Router = express.Router();

    constructor() {
        this.router.post("/api/orders", requireUser, this.create);
        this.router.get("/api/orders", requireUser, this.list);
        this.router.get("/api/orders/:id", requireUser, this.getOne);
    }

    public async create(request: Request, response: Response) {
        const order = await orderService.create(request.body, getCurrentUser(request)!);
        response.status(StatusCode.Created).json(order);
    }

    public async list(request: Request, response: Response) {
        response.json(await orderService.list(getCurrentUser(request)!, role(request)));
    }

    public async getOne(request: Request, response: Response) {
        response.json(await orderService.getById(request.params.id as string, getCurrentUser(request)!));
    }
}

export const orderController = new OrderController();
