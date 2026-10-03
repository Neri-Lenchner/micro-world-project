import {RowDataPacket} from "mysql2";
import {dal} from "./dal";

export interface AnalyticsSummary {
    ordersPlaced: number;
    paidCount: number;
    shippedCount: number;
    deliveredCount: number;
    cancelledCount: number;
    totalRevenue: number;
    averageOrderValue: number;
}

interface CountRow extends RowDataPacket {
    count: number;
}

interface StatusAggregateRow extends RowDataPacket {
    status: string;
    count: number;
    total: number;
}

class AnalyticsService {

    public async recordOrderCreated(orderId: number): Promise<void> {
        await dal.pool.query("INSERT INTO events (event_type, order_id) VALUES ('order.created', ?)", [orderId]);
    }

    public async recordStatusChanged(orderId: number, status: string, amount: number | null): Promise<void> {
        await dal.pool.query(
            "INSERT INTO events (event_type, order_id, status, amount) VALUES ('order.status-changed', ?, ?, ?)",
            [orderId, status, amount]
        );
    }

    // Aggregated on read from the raw event log, rather than maintained as incremental
    // counters - simpler, and there's no way for a counter to drift out of sync with reality.
    public async summary(): Promise<AnalyticsSummary> {
        const [[placedRow]] = await dal.pool.query<CountRow[]>(
            "SELECT COUNT(*) AS count FROM events WHERE event_type = 'order.created'"
        );
        const [statusRows] = await dal.pool.query<StatusAggregateRow[]>(
            `SELECT status, COUNT(*) AS count, COALESCE(SUM(amount), 0) AS total
             FROM events WHERE event_type = 'order.status-changed' GROUP BY status`
        );

        const counts: Record<string, number> = {};
        let totalRevenue = 0;
        for (const row of statusRows) {
            counts[row.status] = Number(row.count);
            if (row.status === "PAID") totalRevenue = Number(row.total);
        }

        const paidCount = counts.PAID ?? 0;
        return {
            ordersPlaced: Number(placedRow.count),
            paidCount,
            shippedCount: counts.SHIPPED ?? 0,
            deliveredCount: counts.DELIVERED ?? 0,
            cancelledCount: counts.CANCELLED ?? 0,
            totalRevenue,
            averageOrderValue: paidCount > 0 ? Math.round((totalRevenue / paidCount) * 100) / 100 : 0,
        };
    }
}

export const analyticsService = new AnalyticsService();
