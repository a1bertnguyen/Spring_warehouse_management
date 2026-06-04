// Learning note: Authentication API calls live here. loginUser saves the auth
// session so route guards and API interceptors can use it later.
import { apiClient, clearAuth, saveAuthSession } from "./apiClient";

export async function registerUser(registerData) {
  const response = await apiClient.post("/auth/register", registerData);
  return response.data;
}

export async function loginUser(loginData) {
  const response = await apiClient.post("/auth/login", loginData);
  const payload = response.data;

  if (payload?.token) {
    saveAuthSession(payload);
  }

  return payload;
}

export async function logoutUser() {
  try {
    const response = await apiClient.post("/auth/logout", {});
    return response.data;
  } finally {
    clearAuth();
  }
}

export async function forgotPassword(email) {
  const response = await apiClient.post("/auth/forgot-password", { email });
  return response.data;
}

export async function resetPassword(payload) {
  const response = await apiClient.post("/auth/reset-password", payload);
  return response.data;
}
