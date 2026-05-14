import {
  apiClient,
  normalizeUser,
  withCollectionAlias,
  withItemAlias,
} from "./apiClient";

export async function getAllUsers() {
  const response = await apiClient.get("/users/all");
  return withCollectionAlias(response.data, "users", normalizeUser);
}

export async function getLoggedInUserInfo() {
  const response = await apiClient.get("/users/current");
  const payload = response.data;

  if (payload?.data) {
    return withItemAlias(payload, "user", normalizeUser);
  }

  const user = normalizeUser(payload);
  return { ...payload, data: user, user };
}

export async function getUserById(userId) {
  const response = await apiClient.get(`/users/id/${userId}`);
  return withItemAlias(response.data, "user", normalizeUser);
}

export async function updateUser(userId, userData) {
  const response = await apiClient.put(`/users/update/${userId}`, userData);
  return response.data;
}

export async function changeCurrentUserPassword(payload) {
  const response = await apiClient.put("/users/current/password", payload);
  return response.data;
}

export async function deleteUser(userId) {
  const response = await apiClient.delete(`/users/delete/${userId}`);
  return response.data;
}
