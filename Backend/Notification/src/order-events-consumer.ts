import {messaging} from "@nltech/messaging";
import {notificationService} from "./notification-service";

interface OrderStatusChangedMessage {
    orderId: number;
    buyerId: number;
    buyerEmail: string;
    sellerId: number | null;
    sellerEmail: string | null;
    productTitle: string | null;
    status: "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED";
}

export async function startOrderEventsConsumer(): Promise<void> {
    await messaging.consume("order.status-changed", async (message: OrderStatusChangedMessage) => {
        const title = message.productTitle ?? "your item";

        switch (message.status) {
            case "PAID":
                await notificationService.create(message.buyerId, "ORDER_PAID", `Your order for "${title}" is confirmed.`);
                if (message.sellerId) {
                    await notificationService.create(message.sellerId, "ORDER_SOLD", `You sold "${title}".`);
                }
                break;
            case "SHIPPED":
                await notificationService.create(message.buyerId, "ORDER_SHIPPED", `Your order for "${title}" has shipped.`);
                break;
            case "DELIVERED":
                if (message.sellerId) {
                    await notificationService.create(message.sellerId, "ORDER_DELIVERED", `"${title}" was marked as delivered.`);
                }
                break;
            case "CANCELLED":
                await notificationService.create(message.buyerId, "ORDER_CANCELLED", `Your order for "${title}" was cancelled.`);
                break;
        }
    });
}
