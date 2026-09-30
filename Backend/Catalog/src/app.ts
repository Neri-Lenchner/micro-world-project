import express from 'express';
import {errorMiddleware} from "@nltech/rest";
import {appConfig} from "./app-config";
import {dal} from "./dal";
import {productController} from "./product-controller";
import {IMAGES_URL_PREFIX, UPLOADS_DIR} from "./upload-image-service";

class App {

    public async start(): Promise<void> {
        const server = express();

        //server.use(cors());

        await dal.init();

        server.use(express.json());
        // Uploaded product photos. Registered before the router so /images/... isn't treated as a product id.
        // A missing image gets a plain 404 (without fallthrough: false, which would leak the server's folder path).
        server.use(IMAGES_URL_PREFIX, express.static(UPLOADS_DIR), errorMiddleware.routeNotFound);
        server.use(productController.router);
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
