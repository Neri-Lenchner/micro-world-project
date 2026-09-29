import express, {Request, Response, Router} from "express";
import {UserModel} from "./user";
import {userService} from "./user-service";
import { StatusCode, requireAuth } from "@nltech/rest"
import {appConfig} from "./app-config";

class UserController {

    router: Router = express.Router();

    constructor() {
       this.router.post("/api/auth/register/", this.register);
       this.router.post("/api/auth/login/", this.login);
       this.router.get("/api/auth/:id", requireAuth(appConfig.secretKey), this.getSingleUser);
    }

    public async register(request: Request, response: Response) {
        const user = new UserModel({ email: request.body.email, password: request.body.password });
        const userFromDB = await userService.register(user);
        response.status(StatusCode.Created).json(userFromDB);
    }

    public async login(request: Request, response: Response) {
        const user = new UserModel(request.body);
        const token = await userService.login(user);
        response.json({token});
    }

    public async getSingleUser(request: Request, response: Response) {
        const id = request.params.id as string;
        const user = await userService.getSingleUser(id);
        response.status(StatusCode.OK).json(user);
    }

}

export const userController = new UserController();
