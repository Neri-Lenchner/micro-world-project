import { authMiddleware } from "@nltech/rest";
import { appConfig } from "../app-config";

export const verifyToken = authMiddleware.verifyToken(appConfig.secretKey);
export const optionalToken = authMiddleware.optionalToken(appConfig.secretKey);
