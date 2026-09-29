import {ResultSetHeader} from "mysql2";
import {dal} from "./dal";
import {UserRow} from "./user";
import {secureService} from "./secure-service";
import {ResourceNotFound, UnauthorizedError, ValidationError} from "@nltech/rest";
import bcrypt from "bcrypt";

class UserService {

    async register(email: string, password: string): Promise<string> {
        if (!email) throw new ValidationError("Email is required");
        if (!password) throw new ValidationError("Password is required");

        const [existingRows] = await dal.pool.query<UserRow[]>("SELECT id FROM users WHERE email = ?", [email]);
        if (existingRows.length > 0) throw new ValidationError("Email already registered");

        const passwordHash = await secureService.hash(password);

        try {
            const [result] = await dal.pool.query<ResultSetHeader>(
                "INSERT INTO users (email, password_hash) VALUES (?, ?)",
                [email, passwordHash]
            );
            const userFromDB = await this.getById(result.insertId);
            return secureService.generateToken(userFromDB!);
        } catch (err: any) {
            if (err.code === "ER_DUP_ENTRY") throw new ValidationError("Email already registered");
            throw err;
        }
    }

    public async login(email: string, password: string): Promise<string> {
        if (!email) throw new ValidationError("Email is required");
        if (!password) throw new ValidationError("Password is required");

        const [rows] = await dal.pool.query<UserRow[]>("SELECT * FROM users WHERE email = ?", [email]);
        const userFromDB = rows[0];
        if (!userFromDB) throw new UnauthorizedError("Incorrect email or password");

        const isCorrect = await bcrypt.compare(password, userFromDB.password_hash);
        if (!isCorrect) throw new UnauthorizedError("Incorrect email or password");

        return secureService.generateToken(userFromDB);
    }

    public async getSingleUser(id: string): Promise<Omit<UserRow, "password_hash">> {
        const numericId = Number(id);
        if (!Number.isInteger(numericId)) throw new ResourceNotFound(id);

        const user = await this.getById(numericId);
        if (!user) throw new ResourceNotFound(id);
        const {password_hash, ...safeUser} = user;
        return safeUser;
    }

    private async getById(id: number): Promise<UserRow | undefined> {
        const [rows] = await dal.pool.query<UserRow[]>("SELECT * FROM users WHERE id = ?", [id]);
        return rows[0];
    }

}

export const userService = new UserService();
