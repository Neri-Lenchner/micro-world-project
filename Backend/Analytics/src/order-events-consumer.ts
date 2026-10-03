import {messaging} from "@nltech/messaging";
import {analyticsService} from "./analytics-service";

interface OrderCreatedMessage {
    orderId: number;
}

interface OrderStatusChangedMessage {
    orderId: number;
    status: string;
    price: number | null;
}

export async function startOrderEventsConsumer(): Promise<void> {
    await messaging.consume("order.created", async (message: OrderCreatedMessage) => {
        await analyticsService.recordOrderCreated(message.orderId);
    });

    await messaging.consume("order.status-changed", async (message: OrderStatusChangedMessage) => {
        await analyticsService.recordStatusChanged(message.orderId, message.status, message.price);
    });
}
