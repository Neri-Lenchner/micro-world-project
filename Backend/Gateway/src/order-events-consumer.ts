import {Server} from "socket.io";
import {messaging} from "@nltech/messaging";

interface OrderStatusChangedMessage {
    productTitle: string | null;
    price: number | null;
    status: string;
}

// A public, marketplace-wide feed (shown on the Analytics page) - deliberately sanitized to
// just what/how-much/what-happened. buyerId/buyerEmail/sellerId/sellerEmail/orderId never
// leave Order's own event; nothing here identifies who was involved.
export async function startOrderEventsConsumer(io: Server): Promise<void> {
    await messaging.consume("order.status-changed", async (message: OrderStatusChangedMessage) => {
        io.emit("order-event", {
            status: message.status,
            productTitle: message.productTitle ?? "an item",
            price: message.price,
            at: new Date().toISOString(),
        });
    });
}
