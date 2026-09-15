import express from 'express';
import {appConfig} from "./app-config";
import * as mongoose from "mongoose";
import {userController} from "./user-controller";
import {errorMiddleware} from "@jb/rest";

class App {

    public async start(): Promise<void> {
        const server = express();

        //server.use(cors());

        await mongoose.connect(appConfig.mongodbConnectionString);

        server.use(express.json());
        server.use(userController.router);
        server.use(errorMiddleware.catchAll);

        const httpServer = server.listen(appConfig.port, () =>
            console.log(`Listening on port ${appConfig.port}`)
        );

        httpServer.on('error', (err) => {
            console.error('Server failed to start:', err);
            process.exit(1);
        });
    }

}

process.on('uncaughtException', (err) => console.error('Uncaught exception:', err));
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));

const app = new App();
app.start().catch((err) => {
    console.error('Failed to start app:', err);
    process.exit(1);
});
