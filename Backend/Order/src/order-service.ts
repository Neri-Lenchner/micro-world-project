import {ResultSetHeader} from "mysql2";
import {ForbiddenError, ResourceNotFound, ValidationError, CurrentUser} from "@nltech/rest";
import {messaging} from "@nltech/messaging";
import {dal} from "./dal";
import {Order, OrderRow, toOrder} from "./order";

export interface ProductSnapshot {
    title: string;
    price: number;
    sellerId: number;
    sellerEmail: string;
}

class OrderService {

    // Only product_id/buyer are known yet; title/price/seller are filled in once Catalog's
    // reservation reply arrives, so the buy click can return immediately instead of waiting on it.
    public async create(body: any, buyer: CurrentUser): Promise<Order> {
        const productId = Number(body?.productId);
        if (!Number.isInteger(productId) || productId <= 0) throw new ValidationError("productId is required");

        const [result] = await dal.pool.query<ResultSetHeader>(
            "INSERT INTO orders (product_id, buyer_id, buyer_email, status) VALUES (?, ?, ?, 'PENDING')",
            [productId, buyer.id, buyer.email]
        );
        const order = toOrder((await this.findRow(result.insertId))!);

        await messaging.publish("order.created", {orderId: order.id, productId});
        return order;
    }

    // The product is reserved but payment hasn't happened yet - fill in the snapshot while
    // staying PENDING, so the order already shows real details even if payment then gets declined.
    public async stageReserved(orderId: number, snapshot: ProductSnapshot): Promise<void> {
        await dal.pool.query(
            `UPDATE orders SET product_title = ?, price = ?, seller_id = ?, seller_email = ?
             WHERE id = ? AND status = 'PENDING'`,
            [snapshot.title, snapshot.price, snapshot.sellerId, snapshot.sellerEmail, orderId]
        );
    }

    public async confirmPaid(orderId: number): Promise<void> {
        await dal.pool.query("UPDATE orders SET status = 'PAID' WHERE id = ? AND status = 'PENDING'", [orderId]);
    }

    public async markCancelled(orderId: number): Promise<void> {
        await dal.pool.query("UPDATE orders SET status = 'CANCELLED' WHERE id = ? AND status = 'PENDING'", [orderId]);
    }

    // role "selling" only ever surfaces orders that have resolved to a known seller (see note in dal.ts/order.ts) —
    // a still-PENDING order hasn't been matched to a seller yet.
    public async list(user: CurrentUser, role: "buying" | "selling"): Promise<Order[]> {
        const column = role === "selling" ? "seller_id" : "buyer_id";
        const [rows] = await dal.pool.query<OrderRow[]>(
            `SELECT * FROM orders WHERE ${column} = ? ORDER BY created_at DESC, id DESC`, [user.id]
        );
        return rows.map(toOrder);
    }

    public async getById(id: string, user: CurrentUser): Promise<Order> {
        const row = await this.findRow(this.parseId(id));
        if (!row) throw new ResourceNotFound(id);
        if (row.buyer_id !== user.id && row.seller_id !== user.id) throw new ForbiddenError("You can only view your own orders");
        return toOrder(row);
    }

    private async findRow(id: number): Promise<OrderRow | undefined> {
        const [rows] = await dal.pool.query<OrderRow[]>("SELECT * FROM orders WHERE id = ?", [id]);
        return rows[0];
    }

    private parseId(id: string): number {
        const numericId = Number(id);
        if (!Number.isInteger(numericId) || numericId <= 0) throw new ResourceNotFound(id);
        return numericId;
    }
}

export const orderService = new OrderService();
