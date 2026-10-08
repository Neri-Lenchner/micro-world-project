import {dal} from "./dal";
import {DEMO_ORDERS, daysAgo} from "@nltech/demo-data";

// Mirrors exactly what order-events-consumer.ts would have inserted for each status transition
// in DEMO_ORDERS - same message templates, same asymmetric fan-out rules.
export async function seed(): Promise<void> {
    const [[{count}]] = await dal.pool.query<any[]>("SELECT COUNT(*) AS count FROM notifications");
    if (count > 0) {
        console.log("Notifications table already has data - skipping demo seed.");
        return;
    }

    async function insert(userId: number, type: string, message: string, whenDaysAgo: number) {
        await dal.pool.query(
            "INSERT INTO notifications (user_id, type, message, created_at) VALUES (?, ?, ?, ?)",
            [userId, type, message, daysAgo(whenDaysAgo)]
        );
    }

    for (const o of DEMO_ORDERS) {
        const title = o.productTitle;
        if (o.paidAtDaysAgo !== undefined) {
            await insert(o.buyer.id, "ORDER_PAID", `Your order for "${title}" is confirmed.`, o.paidAtDaysAgo);
            await insert(o.seller.id, "ORDER_SOLD", `You sold "${title}".`, o.paidAtDaysAgo);
        }
        if (o.shippedAtDaysAgo !== undefined) {
            await insert(o.buyer.id, "ORDER_SHIPPED", `Your order for "${title}" has shipped.`, o.shippedAtDaysAgo);
        }
        if (o.deliveredAtDaysAgo !== undefined) {
            await insert(o.seller.id, "ORDER_DELIVERED", `"${title}" was marked as delivered.`, o.deliveredAtDaysAgo);
        }
        if (o.cancelledAtDaysAgo !== undefined) {
            await insert(o.buyer.id, "ORDER_CANCELLED", `Your order for "${title}" was cancelled.`, o.cancelledAtDaysAgo);
        }
    }
    console.log("Seeded demo notifications.");
}
