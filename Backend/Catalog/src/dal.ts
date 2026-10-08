import mysql, {QueryError} from "mysql2/promise";
import {appConfig} from "./app-config";

const ER_DUP_FIELDNAME = 1060;

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
        // seller_id points at a user in the Auth service's database, so there is no FOREIGN KEY here.
        await this.pool.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                title VARCHAR(100) NOT NULL,
                description TEXT NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                category VARCHAR(30) NOT NULL,
                \`condition\` VARCHAR(10) NOT NULL,
                image_url VARCHAR(500) NULL,
                seller_id INT NOT NULL,
                seller_email VARCHAR(255) NOT NULL,
                status VARCHAR(10) NOT NULL DEFAULT 'available',
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_products_seller (seller_id),
                INDEX idx_products_category (category)
            )
        `);
        // Migration for deployments whose table predates the status column; MySQL has no portable
        // "ADD COLUMN IF NOT EXISTS" (that's MariaDB), so the duplicate-column error is swallowed instead.
        try {
            await this.pool.query(`
                ALTER TABLE products
                ADD COLUMN status VARCHAR(10) NOT NULL DEFAULT 'available'
            `);
        } catch (err) {
            if ((err as QueryError).errno !== ER_DUP_FIELDNAME) throw err;
        }
    }
}

export const dal = new Dal();
