// Learning note: Activity log API calls live here. Admin dashboards use this data
// to show login activity and audit-style history.
import { apiClient, withCollectionAlias } from "./apiClient";

export async function getAllActivityLogs() {
  const response = await apiClient.get("/activity-logs/all");
  return withCollectionAlias(response.data, "activityLogs");
}

export async function getActivityLogs(params = {}) {
  const response = await apiClient.get("/activity-logs", { params });
  return withCollectionAlias(response.data, "activityLogs");
}
