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
        await this.publishStatusChanged(orderId);
    }

    public async markCancelled(orderId: number): Promise<void> {
        await dal.pool.query("UPDATE orders SET status = 'CANCELLED' WHERE id = ? AND status = 'PENDING'", [orderId]);
        await this.publishStatusChanged(orderId);
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

    // The only transitions a person can trigger directly - PENDING/PAID/CANCELLED are all
    // driven by the Catalog/Payment saga, not by a direct request.
    public async updateStatus(id: string, user: CurrentUser, newStatus: string): Promise<Order> {
        const row = await this.findRow(this.parseId(id));
        if (!row) throw new ResourceNotFound(id);

        if (newStatus === "SHIPPED") {
            if (row.seller_id !== user.id) throw new ForbiddenError("Only the seller can mark an order as shipped");
            if (row.status !== "PAID") throw new ValidationError("Only a paid order can be marked as shipped");
        } else if (newStatus === "DELIVERED") {
            if (row.buyer_id !== user.id) throw new ForbiddenError("Only the buyer can mark an order as delivered");
            if (row.status !== "SHIPPED") throw new ValidationError("Only a shipped order can be marked as delivered");
        } else {
            throw new ValidationError("status must be SHIPPED or DELIVERED");
        }

        await dal.pool.query("UPDATE orders SET status = ? WHERE id = ? AND status = ?", [newStatus, row.id, row.status]);
        await this.publishStatusChanged(row.id);
        return this.getById(id, user);
    }

    public async getById(id: string, user: CurrentUser): Promise<Order> {
        const row = await this.findRow(this.parseId(id));
        if (!row) throw new ResourceNotFound(id);
        if (row.buyer_id !== user.id && row.seller_id !== user.id) throw new ForbiddenError("You can only view your own orders");
        return toOrder(row);
    }

    // Fires for every transition Notification might care about (not PENDING - that's just the
    // buyer's own "Buy now" click, nothing for anyone to be told about yet).
    private async publishStatusChanged(orderId: number): Promise<void> {
        const row = await this.findRow(orderId);
        if (!row) return;
        await messaging.publish("order.status-changed", {
            orderId: row.id,
            buyerId: row.buyer_id,
            buyerEmail: row.buyer_email,
            sellerId: row.seller_id,
            sellerEmail: row.seller_email,
            productTitle: row.product_title,
            status: row.status,
        });
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
