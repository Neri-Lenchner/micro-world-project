import dotenv from "dotenv";

dotenv.config();

class AppConfig {

    public readonly mysqlHost: string = process.env.MYSQL_HOST as string;
    public readonly mysqlUser: string = process.env.MYSQL_USER as string;
    public readonly mysqlPassword: string = process.env.MYSQL_PASSWORD as string;
    public readonly mysqlDatabase: string = process.env.MYSQL_DATABASE as string;
    public readonly dbTimezone: string = process.env.DB_TIMEZONE as string;
    public readonly rabbitmqUrl: string = process.env.RABBITMQ_URL as string;
}

export const appConfig = new AppConfig();
