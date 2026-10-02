import express, {Request, Response, Router} from "express";
import {StatusCode, getCurrentUser, requireUser} from "@nltech/rest";
import {watchlistService} from "./watchlist-service";

class WatchlistController {

    router: Router = express.Router();

    constructor() {
        this.router.post("/api/watchlist/:productId", requireUser, this.add);
        this.router.delete("/api/watchlist/:productId", requireUser, this.remove);
        this.router.get("/api/watchlist", requireUser, this.list);
    }

    public async add(request: Request, response: Response) {
        await watchlistService.add(request.params.productId as string, getCurrentUser(request)!);
        response.sendStatus(StatusCode.NoContent);
    }

    public async remove(request: Request, response: Response) {
        await watchlistService.remove(request.params.productId as string, getCurrentUser(request)!);
        response.sendStatus(StatusCode.NoContent);
    }

    public async list(request: Request, response: Response) {
        response.json(await watchlistService.list(getCurrentUser(request)!));
    }
}

export const watchlistController = new WatchlistController();
