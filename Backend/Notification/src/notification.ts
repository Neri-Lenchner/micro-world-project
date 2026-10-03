import {RowDataPacket} from "mysql2";

export interface NotificationRow extends RowDataPacket {
    id: number;
    user_id: number;
    type: string;
    message: string;
    read_at: Date | null;
    created_at: Date;
}

// What the API returns (camelCase, like the rest of the JSON the frontend sees).
export interface Notification {
    id: number;
    type: string;
    message: string;
    read: boolean;
    createdAt: Date;
}

export function toNotification(row: NotificationRow): Notification {
    return {
        id: row.id,
        type: row.type,
        message: row.message,
        read: row.read_at !== null,
        createdAt: row.created_at,
    };
}
