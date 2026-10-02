import {messaging} from "@nltech/messaging";
import {orderService} from "./order-service";

interface ProductReservedMessage {
    orderId: number;
    productId: number;
    title: string;
    price: number;
    sellerId: number;
    sellerEmail: string;
}

interface ProductReserveFailedMessage {
    orderId: number;
    productId: number;
    reason: string;
}

export async function startOrderEventsConsumer(): Promise<void> {
    await messaging.consume("product.reserved", async (message: ProductReservedMessage) => {
        await orderService.markPaid(message.orderId, {
            title: message.title,
            price: message.price,
            sellerId: message.sellerId,
            sellerEmail: message.sellerEmail,
        });
    });

    await messaging.consume("product.reserve-failed", async (message: ProductReserveFailedMessage) => {
        await orderService.markCancelled(message.orderId);
    });
}
