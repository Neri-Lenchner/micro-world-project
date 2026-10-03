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

interface PaymentApprovedMessage {
    orderId: number;
}

interface PaymentDeclinedMessage {
    orderId: number;
    productId: number;
}

export async function startOrderEventsConsumer(): Promise<void> {
    // Reserved, not yet paid - stage the snapshot and hand off to Payment.
    await messaging.consume("product.reserved", async (message: ProductReservedMessage) => {
        await orderService.stageReserved(message.orderId, {
            title: message.title,
            price: message.price,
            sellerId: message.sellerId,
            sellerEmail: message.sellerEmail,
        });
        await messaging.publish("payment.requested", {
            orderId: message.orderId,
            productId: message.productId,
            price: message.price,
        });
    });

    await messaging.consume("product.reserve-failed", async (message: ProductReserveFailedMessage) => {
        await orderService.markCancelled(message.orderId);
    });

    await messaging.consume("payment.approved", async (message: PaymentApprovedMessage) => {
        await orderService.confirmPaid(message.orderId);
    });

    // Payment declined after the product was already reserved - cancel the order and tell
    // Catalog to release the reservation so the listing becomes available again.
    await messaging.consume("payment.declined", async (message: PaymentDeclinedMessage) => {
        await orderService.markCancelled(message.orderId);
        await messaging.publish("product.release", {productId: message.productId});
    });
}
