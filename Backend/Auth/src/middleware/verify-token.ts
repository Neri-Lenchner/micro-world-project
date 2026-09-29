import { authMiddleware } from "@nltech/rest";
import { appConfig } from "../app-config";

export const verifyToken = authMiddleware.verifyToken(appConfig.secretKey);
