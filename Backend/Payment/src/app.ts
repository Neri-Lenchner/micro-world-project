import {messaging} from "@nltech/messaging";
import {appConfig} from "./app-config";
import {dal} from "./dal";
import {startPaymentEventsConsumer} from "./payment-events-consumer";

class App {

    // No HTTP server - Payment is a pure background worker, reachable only through RabbitMQ.
    public async start(): Promise<void> {
        await dal.init();
        await messaging.connect(appConfig.rabbitmqUrl);
        await startPaymentEventsConsumer();
        console.log("Payment worker ready, consuming payment.requested");
    }

}

process.on('uncaughtException', (err) => console.error('Uncaught exception:', err));
process.on('unhandledRejection', (err) => console.error('Unhandled rejection:', err));

const app = new App();
app.start().catch((err) => {
    console.error('Failed to start app:', err);
    process.exit(1);
});
