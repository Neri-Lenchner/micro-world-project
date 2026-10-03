import express, {Request, Response, Router} from "express";
import {analyticsService} from "./analytics-service";

class AnalyticsController {

    // Public - a marketplace-wide dashboard, not tied to any one user. Matches Catalog's
    // own public GET /api/products.
    router: Router = express.Router();

    constructor() {
        this.router.get("/api/analytics/summary", this.summary);
    }

    public async summary(request: Request, response: Response) {
        response.json(await analyticsService.summary());
    }
}

export const analyticsController = new AnalyticsController();
