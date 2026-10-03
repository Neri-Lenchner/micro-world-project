import {ResultSetHeader} from "mysql2";
import {messaging} from "@nltech/messaging";
import {dal} from "./dal";
import {ProductRow} from "./product";

interface OrderCreatedMessage {
    orderId: number;
    productId: number;
}

interface ProductReleaseMessage {
    productId: number;
}

// Reserving a product for an order is the one operation that must never let two buyers both win:
// the atomic conditional UPDATE is what actually prevents that, not anything RabbitMQ does.
async function reserveProduct(productId: number): Promise<ProductRow | undefined> {
    const [result] = await dal.pool.query<ResultSetHeader>(
        "UPDATE products SET status = 'sold' WHERE id = ? AND status = 'available'", [productId]
    );
    if (result.affectedRows === 0) return undefined;
    const [rows] = await dal.pool.query<ProductRow[]>("SELECT * FROM products WHERE id = ?", [productId]);
    return rows[0];
}

export async function startOrderEventsConsumer(): Promise<void> {
    await messaging.consume("order.created", async (message: OrderCreatedMessage) => {
        const product = await reserveProduct(message.productId);
        if (product) {
            await messaging.publish("product.reserved", {
                orderId: message.orderId,
                productId: product.id,
                title: product.title,
                price: product.price,
                sellerId: product.seller_id,
                sellerEmail: product.seller_email,
            });
        } else {
            await messaging.publish("product.reserve-failed", {
                orderId: message.orderId,
                productId: message.productId,
                reason: "This item is no longer available",
            });
        }
    });

    // Payment was declined after this product was reserved - release it back to the marketplace.
    await messaging.consume("product.release", async (message: ProductReleaseMessage) => {
        await dal.pool.query(
            "UPDATE products SET status = 'available' WHERE id = ? AND status = 'sold'", [message.productId]
        );
    });
}
