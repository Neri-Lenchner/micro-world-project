import {dal} from "./dal";
import {DEMO_ORDERS, daysAgo} from "@nltech/demo-data";

// Analytics never reads Order's database - it only has this append-only events log, populated
// by consuming RabbitMQ messages. So this seed must insert the events the real consumer would
// have produced for each order's *entire* history, not just its final status - e.g. a
// DELIVERED order contributes separate order.created + PAID + SHIPPED + DELIVERED rows.
export async function seed(): Promise<void> {
    const [[{count}]] = await dal.pool.query<any[]>("SELECT COUNT(*) AS count FROM events");
    if (count > 0) {
        console.log("Events table already has data - skipping demo seed.");
        return;
    }

    async function insert(type: string, orderId: number, whenDaysAgo: number, status?: string, amount?: number) {
        await dal.pool.query(
            "INSERT INTO events (event_type, order_id, status, amount, created_at) VALUES (?, ?, ?, ?, ?)",
            [type, orderId, status ?? null, amount ?? null, daysAgo(whenDaysAgo)]
        );
    }

    for (const o of DEMO_ORDERS) {
        await insert("order.created", o.id, o.createdAtDaysAgo);
        if (o.paidAtDaysAgo !== undefined) await insert("order.status-changed", o.id, o.paidAtDaysAgo, "PAID", o.price);
        if (o.shippedAtDaysAgo !== undefined) await insert("order.status-changed", o.id, o.shippedAtDaysAgo, "SHIPPED", o.price);
        if (o.deliveredAtDaysAgo !== undefined) await insert("order.status-changed", o.id, o.deliveredAtDaysAgo, "DELIVERED", o.price);
        if (o.cancelledAtDaysAgo !== undefined) await insert("order.status-changed", o.id, o.cancelledAtDaysAgo, "CANCELLED", o.price);
    }
    console.log("Seeded demo analytics events.");
}
