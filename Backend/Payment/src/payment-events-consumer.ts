import {ResultSetHeader} from "mysql2";
import {messaging} from "@nltech/messaging";
import {dal} from "./dal";

interface PaymentRequestedMessage {
    orderId: number;
    productId: number;
    price: number;
}

// The goal here isn't to process real money, only to model a distributed payment
// workflow (including the failure path) - so this is a simulated, mostly-approving gateway.
const DECLINE_RATE = 0.15;

function simulateApproval(): boolean {
    return Math.random() >= DECLINE_RATE;
}

export async function startPaymentEventsConsumer(): Promise<void> {
    await messaging.consume("payment.requested", async (message: PaymentRequestedMessage) => {
        const approved = simulateApproval();

        await dal.pool.query<ResultSetHeader>(
            "INSERT INTO payments (order_id, amount, status) VALUES (?, ?, ?)",
            [message.orderId, message.price, approved ? "approved" : "declined"]
        );

        if (approved) {
            await messaging.publish("payment.approved", {orderId: message.orderId});
        } else {
            await messaging.publish("payment.declined", {orderId: message.orderId, productId: message.productId});
        }
    });
}
