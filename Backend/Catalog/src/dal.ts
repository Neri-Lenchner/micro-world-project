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
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_products_seller (seller_id),
                INDEX idx_products_category (category)
            )
        `);
    }
}

export const dal = new Dal();
