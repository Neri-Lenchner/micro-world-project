import {IUserModel, UserModel} from "./user";
import {secureService} from "./secure-service";
import {ResourceNotFound, UnauthorizedError, ValidationError} from "@nltech/rest";
import bcrypt from "bcrypt";

class UserService {

    async register(user: IUserModel): Promise<string> {
        const error = user.validateSync();
        user.password = await secureService.hash(user.password!);
        if (error) throw new ValidationError(error.message);
        const userFromDB = await user.save();
        return secureService.generateToken(userFromDB);
    }

    public async login(user: IUserModel): Promise<string> {
        user.validateSync();
        const filter = {email: user.email};
        const userFromDB = await UserModel.findOne(filter).exec();
        if (!userFromDB) throw new UnauthorizedError("Incorrect email or password");
        const isCorrect = await bcrypt.compare(user.password, userFromDB.password);
        if (!isCorrect) throw new UnauthorizedError("Incorrect email or password");
        return secureService.generateToken(userFromDB);
    }

    public async getSingleUser(id: string): Promise<IUserModel> {
        const user = await UserModel.findById(id).select("-password").exec();
        if (!user) {
            throw new ResourceNotFound(id);
        }
        return user;
    }
}

export const userService = new UserService();
