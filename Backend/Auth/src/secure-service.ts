import {IUserModel} from "./user";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt"
import {appConfig} from "./app-config";

class SecureService {

    public async hash(text: string): Promise<string> {
        // return crypto.createHash("sha512").update(text).digest("hex");
        return await bcrypt.hash(text, 10);
    }

    public generateToken(user: IUserModel): string  {
        const slimUser = user.toObject();
        delete (slimUser as any).password;
        const container = { slimUser };
        const options: SignOptions = {expiresIn: "30m"};
        return jwt.sign(container, appConfig.secretKey, options);
    }

    // public validateToken(token: string): boolean {
    //     if (!token) return false;
    //     try {
    //         jwt.verify(token, appConfig.secretKey);
    //         return true;
    //     }
    //     catch (error) {
    //         return false;
    //     }
    // }
    //
    // public validateAdmin(token: string): boolean {
    //     if (!token) return false;
    //     try {
    //         jwt.verify(token, appConfig.secretKey);
    //         const container = jwt.decode(token) as { user: User }
    //         const user = container.user;
    //         return user.roleId === RoleId.Admin;
    //     }
    //     catch (error) {
    //         return false;
    //     }
    // }
}

export const secureService = new SecureService();
