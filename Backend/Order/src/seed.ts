import {dal} from "./dal";
import {DEMO_ORDERS, daysAgo} from "@nltech/demo-data";

// Inserted directly into the resolved final state - bypasses the real create->reserve->pay
// saga entirely. Replaying the full RabbitMQ flow at boot for synthetic history isn't worth
// the complexity here.
export async function seed(): Promise<void> {
    const [[{count}]] = await dal.pool.query<any[]>("SELECT COUNT(*) AS count FROM orders");
    if (count > 0) {
        console.log("Orders table already has data - skipping demo seed.");
        return;
    }

    // Inserted in DEMO_ORDERS array order, so AUTO_INCREMENT hands out ids 1..7 matching
    // each DemoOrderSeed.id - Payment/Notification/Analytics seeds rely on this.
    for (const o of DEMO_ORDERS) {
        const updatedAtDaysAgo = o.deliveredAtDaysAgo ?? o.shippedAtDaysAgo ?? o.paidAtDaysAgo ?? o.cancelledAtDaysAgo ?? o.createdAtDaysAgo;
        await dal.pool.query(
            `INSERT INTO orders (product_id, product_title, price, buyer_id, buyer_email, seller_id, seller_email, status, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [o.productId, o.productTitle, o.price, o.buyer.id, o.buyer.email, o.seller.id, o.seller.email,
             o.status, daysAgo(o.createdAtDaysAgo), daysAgo(updatedAtDaysAgo)]
        );
    }
    console.log(`Seeded ${DEMO_ORDERS.length} demo orders.`);
}
