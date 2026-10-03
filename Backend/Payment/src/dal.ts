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

    public async init(): Promise<void> {
        // No FOREIGN KEY to Order's table — each service owns only its own database.
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS payments (
                id INT AUTO_INCREMENT PRIMARY KEY,
                order_id INT NOT NULL,
                amount DECIMAL(10, 2) NOT NULL,
                status VARCHAR(10) NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_payments_order (order_id)
            )
        `);
    }
}

export const dal = new Dal();
