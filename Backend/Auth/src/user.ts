import {RowDataPacket} from "mysql2";

export interface UserRow extends RowDataPacket {
    id: number;
    email: string;
    password_hash: string;
    created_at: Date;
    updated_at: Date;
}
