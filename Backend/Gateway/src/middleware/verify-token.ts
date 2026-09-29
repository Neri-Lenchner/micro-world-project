import { requireAuth } from "@nltech/rest";
import { appConfig } from "../app-config";

export const verifyToken = requireAuth(appConfig.secretKey);
