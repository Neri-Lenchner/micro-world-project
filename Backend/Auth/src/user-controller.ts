import express, {Request, Response, Router} from "express";
import {userService} from "./user-service";
import { StatusCode } from "@nltech/rest"
import {verifyToken} from "./middleware/verify-token";

class UserController {

    router: Router = express.Router();

    constructor() {
       this.router.post("/api/auth/register/", this.register);
       this.router.post("/api/auth/login/", this.login);
       this.router.get("/api/auth/:id", verifyToken, this.getSingleUser);
    }

    public async register(request: Request, response: Response) {
        const token = await userService.register(request.body.email, request.body.password);
        response.status(StatusCode.Created).json(token);
    }

    public async login(request: Request, response: Response) {
        const token = await userService.login(request.body.email, request.body.password);
        response.json({token});
    }

    public async getSingleUser(request: Request, response: Response) {
        const id = request.params.id as string;
        const user = await userService.getSingleUser(id);
        response.status(StatusCode.OK).json(user);
    }

}

export const userController = new UserController();
