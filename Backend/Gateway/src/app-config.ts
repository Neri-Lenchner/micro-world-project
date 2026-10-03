import dotenv from "dotenv";

dotenv.config();

class AppConfig {
    public readonly port: number = Number(process.env.PORT);
    public readonly authServiceUrl: string = process.env.AUTH_SERVICE_URL as string;
    public readonly catalogServiceUrl: string = process.env.CATALOG_SERVICE_URL as string;
    public readonly orderServiceUrl: string = process.env.ORDER_SERVICE_URL as string;
    public readonly watchlistServiceUrl: string = process.env.WATCHLIST_SERVICE_URL as string;
    public readonly notificationServiceUrl: string = process.env.NOTIFICATION_SERVICE_URL as string;
    public readonly analyticsServiceUrl: string = process.env.ANALYTICS_SERVICE_URL as string;
    public readonly secretKey: string = process.env.SECRET_KEY as string;
}

export const appConfig = new AppConfig();
