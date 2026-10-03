import { http } from "./http";
import { AnalyticsSummary } from "../types/analytics";

class AnalyticsApi {
  summary(): Promise<AnalyticsSummary> {
    return http<AnalyticsSummary>("/api/analytics/summary");
  }
}

export const analyticsApi = new AnalyticsApi();
