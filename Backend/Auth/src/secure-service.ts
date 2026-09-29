import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt"
import {appConfig} from "./app-config";

class SecureService {

    public async hash(text: string): Promise<string> {
        return await bcrypt.hash(text, 10);
    }

    public generateToken(user: { id: number; email: string }): string {
        const slimUser = { id: user.id, email: user.email };
        const container = { slimUser };
        const options: SignOptions = {expiresIn: "30m"};
        return jwt.sign(container, appConfig.secretKey, options);
    }

}

export const secureService = new SecureService();
