import {ResultSetHeader, RowDataPacket} from "mysql2";
import {ForbiddenError, ResourceNotFound, ValidationError} from "@nltech/rest";
import {dal} from "./dal";
import {CATEGORIES, CONDITIONS, Category, Condition, Product, ProductInput, ProductRow, toProduct} from "./product";
import {CurrentUser} from "./middleware/current-user";
import {uploadImageService} from "./upload-image-service";

export interface ProductFilters {
    search?: string;
    category?: string;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    page?: number;
    limit?: number;
}

export interface Paged<T> {
    items: T[];
    total: number;
    page: number;
    pages: number;
}

const SORTS: Record<string, string> = {
    newest: "created_at DESC, id DESC",
    price_asc: "price ASC, id DESC",
    price_desc: "price DESC, id DESC",
};

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 50;
const MAX_PRICE = 99_999_999.99;

class ProductService {

    public async list(filters: ProductFilters): Promise<Paged<Product>> {
        const where: string[] = [];
        const params: any[] = [];

        if (filters.search) {
            // Escape LIKE wildcards so a search for "100%" doesn't match everything.
            const escaped = filters.search.replace(/[\\%_]/g, char => "\\" + char);
            where.push("title LIKE ?");
            params.push(`%${escaped}%`);
        }
        if (filters.category) {
            where.push("category = ?");
            params.push(filters.category);
        }
        if (filters.condition) {
            where.push("`condition` = ?");
            params.push(filters.condition);
        }
        if (filters.minPrice !== undefined) {
            where.push("price >= ?");
            params.push(filters.minPrice);
        }
        if (filters.maxPrice !== undefined) {
            where.push("price <= ?");
            params.push(filters.maxPrice);
        }

        const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
        const orderSql = SORTS[filters.sort ?? ""] ?? SORTS.newest;
        const limit = Math.min(Math.max(filters.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);
        const page = Math.max(filters.page ?? 1, 1);
        const offset = (page - 1) * limit;

        const [countRows] = await dal.pool.query<RowDataPacket[]>(
            `SELECT COUNT(*) AS total FROM products ${whereSql}`, params
        );
        const total = Number(countRows[0].total);

        const [rows] = await dal.pool.query<ProductRow[]>(
            `SELECT * FROM products ${whereSql} ORDER BY ${orderSql} LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        return {items: rows.map(toProduct), total, page, pages: Math.ceil(total / limit)};
    }

    public async getById(id: string): Promise<Product> {
        const row = await this.findRow(this.parseId(id));
        if (!row) throw new ResourceNotFound(id);
        return toProduct(row);
    }

    public async getBySeller(sellerId: number): Promise<Product[]> {
        const [rows] = await dal.pool.query<ProductRow[]>(
            "SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC, id DESC", [sellerId]
        );
        return rows.map(toProduct);
    }

    // `file` is the uploaded photo (if any). It replaces body.imageUrl.
    public async create(body: any, user: CurrentUser, file?: Express.Multer.File): Promise<Product> {
        try {
            const input = this.validate(body, file);
            const [result] = await dal.pool.query<ResultSetHeader>(
                `INSERT INTO products (title, description, price, category, \`condition\`, image_url, seller_id, seller_email)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [input.title, input.description, input.price, input.category, input.condition, input.imageUrl, user.id, user.email]
            );
            return toProduct((await this.findRow(result.insertId))!);
        } catch (err) {
            if (file) await uploadImageService.deleteImage(uploadImageService.toImageUrl(file));
            throw err;
        }
    }

    // body.imageUrl is the image to keep (the current one), or empty to remove it; a new `file` replaces it.
    public async update(id: string, body: any, user: CurrentUser, file?: Express.Multer.File): Promise<Product> {
        let input: ProductInput;
        let oldImageUrl: string | null;
        try {
            const numericId = this.parseId(id);
            oldImageUrl = (await this.getOwnedRow(numericId, id, user)).image_url;
            input = this.validate(body, file);
            await dal.pool.query(
                `UPDATE products SET title = ?, description = ?, price = ?, category = ?, \`condition\` = ?, image_url = ?
                 WHERE id = ?`,
                [input.title, input.description, input.price, input.category, input.condition, input.imageUrl, numericId]
            );
        } catch (err) {
            if (file) await uploadImageService.deleteImage(uploadImageService.toImageUrl(file));
            throw err;
        }
        if (oldImageUrl !== input.imageUrl) await uploadImageService.deleteImage(oldImageUrl);
        return this.getById(id);
    }

    public async remove(id: string, user: CurrentUser): Promise<void> {
        const numericId = this.parseId(id);
        const row = await this.getOwnedRow(numericId, id, user);
        await dal.pool.query("DELETE FROM products WHERE id = ?", [numericId]);
        await uploadImageService.deleteImage(row.image_url);
    }

    private validate(body: any, file?: Express.Multer.File): ProductInput {
        const title = typeof body?.title === "string" ? body.title.trim() : "";
        if (!title) throw new ValidationError("Title is required");
        if (title.length > 100) throw new ValidationError("Title must be at most 100 characters");

        const description = typeof body?.description === "string" ? body.description.trim() : "";
        if (!description) throw new ValidationError("Description is required");
        if (description.length > 2000) throw new ValidationError("Description must be at most 2000 characters");

        const price = Number(body?.price);
        if (body?.price === undefined || body?.price === "" || !Number.isFinite(price)) throw new ValidationError("Price must be a number");
        if (price < 0 || price > MAX_PRICE) throw new ValidationError("Price is out of range");

        if (!CATEGORIES.includes(body?.category)) throw new ValidationError("Category must be one of: " + CATEGORIES.join(", "));
        if (!CONDITIONS.includes(body?.condition)) throw new ValidationError("Condition must be one of: " + CONDITIONS.join(", "));

        let imageUrl: string | null = null;
        if (file) {
            imageUrl = uploadImageService.toImageUrl(file);
        } else if (typeof body?.imageUrl === "string" && body.imageUrl.trim()) {
            imageUrl = body.imageUrl.trim();
            const isLink = /^https?:\/\//i.test(imageUrl!);
            const isOurUpload = /^\/api\/products\/images\/[\w-]+\.(jpg|png|webp|gif)$/.test(imageUrl!);
            if (!isLink && !isOurUpload) throw new ValidationError("Image URL must start with http:// or https://");
            if (imageUrl!.length > 500) throw new ValidationError("Image URL is too long");
        }

        return {
            title,
            description,
            price: Math.round(price * 100) / 100,
            category: body.category as Category,
            condition: body.condition as Condition,
            imageUrl,
        };
    }

    private async getOwnedRow(numericId: number, rawId: string, user: CurrentUser): Promise<ProductRow> {
        const row = await this.findRow(numericId);
        if (!row) throw new ResourceNotFound(rawId);
        if (row.seller_id !== user.id) throw new ForbiddenError("You can only change your own products");
        return row;
    }

    private async findRow(id: number): Promise<ProductRow | undefined> {
        const [rows] = await dal.pool.query<ProductRow[]>("SELECT * FROM products WHERE id = ?", [id]);
        return rows[0];
    }

    private parseId(id: string): number {
        const numericId = Number(id);
        if (!Number.isInteger(numericId) || numericId <= 0) throw new ResourceNotFound(id);
        return numericId;
    }
}

export const productService = new ProductService();
