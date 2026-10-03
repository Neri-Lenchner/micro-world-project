import mysql from "mysql2/promise";
import {appConfig} from "./app-config";

class Dal {
    public readonly pool = mysql.createPool({
        host: appConfig.mysqlHost,
        user: appConfig.mysqlUser,
        password: appConfig.mysqlPassword,
        database: appConfig.mysqlDatabase,
        timezone: appConfig.dbTimezone,
        decimalNumbers: true,
    });

    // An append-only log of the raw events this service consumes. Dashboards are computed
    // on read via aggregation queries, rather than maintaining incremental counters - simpler
    // and avoids any risk of counters drifting out of sync with reality.
    public async init(): Promise<void> {
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS events (
                id INT AUTO_INCREMENT PRIMARY KEY,
                event_type VARCHAR(30) NOT NULL,
                order_id INT NOT NULL,
                status VARCHAR(10) NULL,
                amount DECIMAL(10, 2) NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_events_type (event_type)
            )
        `);
    }
}

export const dal = new Dal();
