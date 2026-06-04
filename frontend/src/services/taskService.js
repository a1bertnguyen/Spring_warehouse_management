// Learning note: Task API calls live here. This appears to support staff task
// assignment workflows alongside the core warehouse features.
import { apiClient, withCollectionAlias, withItemAlias } from "./apiClient";

export async function getAllTasks() {
  const response = await apiClient.get("/tasks/all");
  return withCollectionAlias(response.data, "tasks");
}

export async function getTaskById(taskId) {
  const response = await apiClient.get(`/tasks/${taskId}`);
  return withItemAlias(response.data, "task");
}

export async function createTask(taskData) {
  const response = await apiClient.post("/tasks/add", taskData);
  return response.data;
}

export async function updateTask(taskId, taskData) {
  const response = await apiClient.put(`/tasks/${taskId}`, taskData);
  return response.data;
}

export async function updateTaskStatus(taskId, status) {
  const response = await apiClient.patch(`/tasks/${taskId}/status`, null, {
    params: { status },
  });
  return response.data;
}

export async function deleteTask(taskId) {
  const response = await apiClient.delete(`/tasks/delete/${taskId}`);
  return response.data;
}

export async function searchTask(input) {
  const response = await apiClient.get("/tasks/search", {
    params: { input },
  });
  return withCollectionAlias(response.data, "tasks");
}

export async function getTasksByUser(userId) {
  const response = await apiClient.get(`/tasks/user/${userId}`);
  return withCollectionAlias(response.data, "tasks");
}

export async function assignRandomTask() {
  const response = await apiClient.post("/tasks/assign-random", {});
  return response.data;
}
