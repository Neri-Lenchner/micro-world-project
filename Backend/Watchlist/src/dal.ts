import mysql from "mysql2/promise";
import {appConfig} from "./app-config";

class Dal {
    public readonly pool = mysql.createPool({
        host: appConfig.mysqlHost,
        user: appConfig.mysqlUser,
        password: appConfig.mysqlPassword,
        database: appConfig.mysqlDatabase,
        timezone: appConfig.dbTimezone,
    });

    public async init(): Promise<void> {
        // No FOREIGN KEY to Catalog's products table — each service owns only its own database.
        // The primary key doubles as the spec's UNIQUE(user_id, product_id) constraint.
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS watchlist_items (
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (user_id, product_id)
            )
        `);
    }
}

export const dal = new Dal();
