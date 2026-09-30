import express, {Request, Response, Router} from "express";
import {StatusCode} from "@nltech/rest";
import {productService, ProductFilters} from "./product-service";
import {CATEGORIES} from "./product";
import {getCurrentUser, requireUser} from "./middleware/current-user";
import {uploadImageService} from "./upload-image-service";

function queryString(value: unknown): string | undefined {
    return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function queryNumber(value: unknown): number | undefined {
    const text = queryString(value);
    if (text === undefined) return undefined;
    const number = Number(text);
    return Number.isFinite(number) ? number : undefined;
}

class ProductController {

    router: Router = express.Router();

    constructor() {
        // /categories and /mine must come before /:id, otherwise they'd be treated as ids.
        this.router.get("/api/products", this.list);
        this.router.get("/api/products/categories", this.categories);
        this.router.get("/api/products/mine", requireUser, this.mine);
        this.router.get("/api/products/:id", this.getOne);
        // Create/update accept multipart/form-data with an optional "image" file (or plain JSON without one).
        this.router.post("/api/products", requireUser, uploadImageService.single("image"), this.create);
        this.router.put("/api/products/:id", requireUser, uploadImageService.single("image"), this.update);
        this.router.delete("/api/products/:id", requireUser, this.remove);
    }

    public async list(request: Request, response: Response) {
        const filters: ProductFilters = {
            search: queryString(request.query.search),
            category: queryString(request.query.category),
            condition: queryString(request.query.condition),
            minPrice: queryNumber(request.query.minPrice),
            maxPrice: queryNumber(request.query.maxPrice),
            sort: queryString(request.query.sort),
            page: queryNumber(request.query.page),
            limit: queryNumber(request.query.limit),
        };
        response.json(await productService.list(filters));
    }

    public async categories(request: Request, response: Response) {
        response.json(CATEGORIES);
    }

    public async mine(request: Request, response: Response) {
        const user = getCurrentUser(request)!;
        response.json(await productService.getBySeller(user.id));
    }

    public async getOne(request: Request, response: Response) {
        response.json(await productService.getById(request.params.id as string));
    }

    public async create(request: Request, response: Response) {
        const product = await productService.create(request.body, getCurrentUser(request)!, request.file);
        response.status(StatusCode.Created).json(product);
    }

    public async update(request: Request, response: Response) {
        const product = await productService.update(request.params.id as string, request.body, getCurrentUser(request)!, request.file);
        response.json(product);
    }

    public async remove(request: Request, response: Response) {
        await productService.remove(request.params.id as string, getCurrentUser(request)!);
        response.sendStatus(StatusCode.NoContent);
    }
}

export const productController = new ProductController();
