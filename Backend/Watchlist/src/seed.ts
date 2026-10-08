import {dal} from "./dal";
import {DEMO_WATCHLIST, daysAgo} from "@nltech/demo-data";

export async function seed(): Promise<void> {
    const [[{count}]] = await dal.pool.query<any[]>("SELECT COUNT(*) AS count FROM watchlist_items");
    if (count > 0) {
        console.log("Watchlist already has data - skipping demo seed.");
        return;
    }

    for (const item of DEMO_WATCHLIST) {
        await dal.pool.query(
            "INSERT INTO watchlist_items (user_id, product_id, created_at) VALUES (?, ?, ?)",
            [item.user.id, item.productId, daysAgo(item.addedDaysAgo)]
        );
    }
    console.log(`Seeded ${DEMO_WATCHLIST.length} demo watchlist items.`);
}
