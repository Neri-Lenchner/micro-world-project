import express from "express";
import dotenv from "dotenv";

dotenv.config();

class AppConfig {

    public readonly port: number = Number(process.env.PORT);
    public readonly mongodbConnectionString: string = process.env.MONGODB_CONNECTION_STRING as string;
    public readonly secretKey: string = process.env.SECRET_KEY as string;
}

export const appConfig = new AppConfig();