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
        // product_title/price/seller_* start out unknown and are filled in once Catalog's
        // reservation reply arrives (see order-events-consumer.ts) — there is no FOREIGN KEY
        // to Catalog's or Auth's tables since each service owns only its own database.
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                product_title VARCHAR(100) NULL,
                price DECIMAL(10, 2) NULL,
                buyer_id INT NOT NULL,
                buyer_email VARCHAR(255) NOT NULL,
                seller_id INT NULL,
                seller_email VARCHAR(255) NULL,
                status VARCHAR(10) NOT NULL DEFAULT 'PENDING',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_orders_buyer (buyer_id),
                INDEX idx_orders_seller (seller_id),
                INDEX idx_orders_product (product_id)
            )
        `);
    }
}

export const dal = new Dal();
