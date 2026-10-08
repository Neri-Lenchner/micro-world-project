import {dal} from "./dal";
import {DEMO_ORDERS, daysAgo, OrderStatus} from "@nltech/demo-data";

const APPROVED_STATUSES: OrderStatus[] = ["PAID", "SHIPPED", "DELIVERED"];

// One row per order that actually reached a payment decision - the still-PENDING order gets
// no row, mirroring the real flow where payment.requested only fires once a reservation resolves.
export async function seed(): Promise<void> {
    const [[{count}]] = await dal.pool.query<any[]>("SELECT COUNT(*) AS count FROM payments");
    if (count > 0) {
        console.log("Payments table already has data - skipping demo seed.");
        return;
    }

    for (const o of DEMO_ORDERS) {
        if (o.status === "PENDING") continue;
        const approved = APPROVED_STATUSES.includes(o.status);
        const whenDaysAgo = o.paidAtDaysAgo ?? o.cancelledAtDaysAgo!;
        await dal.pool.query(
            "INSERT INTO payments (order_id, amount, status, created_at) VALUES (?, ?, ?, ?)",
            [o.id, o.price, approved ? "approved" : "declined", daysAgo(whenDaysAgo)]
        );
    }
    console.log("Seeded demo payments.");
}
