import express from 'express';
import * as mongoose from "mongoose";
import {errorMiddleware} from "@jb/rest";
import {appConfig} from "./app_config";

class App {

    public async start(): Promise<void> {
        const server = express();

        //server.use(cors());

        await mongoose.connect(appConfig.mongodbConnectionString);

        server.use(express.json());

        // TODO: wire up your controllers here, e.g. server.use(myController.router);

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
