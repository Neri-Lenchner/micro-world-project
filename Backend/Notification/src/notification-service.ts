import {CurrentUser} from "@nltech/rest";
import {dal} from "./dal";
import {Notification, NotificationRow, toNotification} from "./notification";

class NotificationService {

    public async create(userId: number, type: string, message: string): Promise<void> {
        await dal.pool.query(
            "INSERT INTO notifications (user_id, type, message) VALUES (?, ?, ?)", [userId, type, message]
        );
    }

    public async list(user: CurrentUser): Promise<Notification[]> {
        const [rows] = await dal.pool.query<NotificationRow[]>(
            "SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC, id DESC", [user.id]
        );
        return rows.map(toNotification);
    }

    public async markRead(id: string, user: CurrentUser): Promise<void> {
        await dal.pool.query(
            "UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ? AND read_at IS NULL",
            [id, user.id]
        );
    }

    public async markAllRead(user: CurrentUser): Promise<void> {
        await dal.pool.query(
            "UPDATE notifications SET read_at = CURRENT_TIMESTAMP WHERE user_id = ? AND read_at IS NULL", [user.id]
        );
    }
}

export const notificationService = new NotificationService();
