import { http } from "./http";
import { Notification } from "../types/notification";

const BASE_URL = "/api/notifications";

class NotificationsApi {
  list(): Promise<Notification[]> {
    return http<Notification[]>(BASE_URL);
  }

  markRead(id: number): Promise<void> {
    return http<void>(`${BASE_URL}/${id}/read`, { method: "PUT" });
  }

  markAllRead(): Promise<void> {
    return http<void>(`${BASE_URL}/read-all`, { method: "PUT" });
  }
}

export const notificationsApi = new NotificationsApi();
