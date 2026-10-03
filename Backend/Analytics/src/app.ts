import express from 'express';
import {errorMiddleware} from "@nltech/rest";
import {messaging} from "@nltech/messaging";
import {appConfig} from "./app-config";
import {dal} from "./dal";
import {analyticsController} from "./analytics-controller";
import {startOrderEventsConsumer} from "./order-events-consumer";

class App {

    public async start(): Promise<void> {
        const server = express();

        await dal.init();
        await messaging.connect(appConfig.rabbitmqUrl);
        await startOrderEventsConsumer();

        server.use(express.json());
        server.use(analyticsController.router);
        server.use(errorMiddleware.routeNotFound);
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
