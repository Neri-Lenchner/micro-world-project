import express from "express";
import proxy from "express-http-proxy";
import { appConfig } from "./app-config";
import { errorMiddleware } from "@nltech/rest";
import {verifyToken} from "./middleware/verify-token";

function forwardUserHeaders(proxyReqOpts: any, srcReq: any) {
    const user = (srcReq as any).user;
    if (user?.slimUser) {
        proxyReqOpts.headers["x-user-id"] = user.slimUser._id;
        proxyReqOpts.headers["x-user-email"] = user.slimUser.email;
    }
    return proxyReqOpts;
}

class App {
    public async start(): Promise<void> {
        const server = express();
        server.use(express.json());

        server.use("/api/auth/register", proxy(appConfig.authServiceUrl, {
            proxyReqPathResolver: request => "/api/auth/register" + request.url
        }));

        server.use("/api/auth/login", proxy(appConfig.authServiceUrl, {
            proxyReqPathResolver: request => "/api/auth/login" + request.url
        }));

        server.use("/api/auth", verifyToken, proxy(appConfig.authServiceUrl, {
            proxyReqPathResolver: request => "/api/auth" + request.url,
            proxyReqOptDecorator: forwardUserHeaders
        }));

        server.use("/api/business", verifyToken, proxy(appConfig.businessServiceUrl, {
            proxyReqPathResolver: request => "/api/business" + request.url,
            proxyReqOptDecorator: forwardUserHeaders
        }));

        server.use(errorMiddleware.catchAll);

        server.listen(appConfig.port, () =>
            console.log(`Gateway listening on port ${appConfig.port}`)
        );
    }
}

const app = new App();
app.start();
