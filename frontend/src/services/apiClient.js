import axios from "axios";
import CryptoJS from "crypto-js";

export const BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8081/api";
export const DEFAULT_EXPIRY_DATE = "2099-12-31T00:00:00";
export const PLACEHOLDER_IMAGE_BASE64 =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WnSUs0AAAAASUVORK5CYII=";
export const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

const ENCRYPTION_KEY = "phegon-dev-inventory";
const TOKEN_STORAGE_KEY = "token";
const ROLE_STORAGE_KEY = "role";
const USER_ID_STORAGE_KEY = "userId";
const EXPIRATION_TIME_STORAGE_KEY = "expirationTime";
const PUBLIC_AUTH_PATHS = ["/login"];

export const apiClient = axios.create({
  baseURL: BASE_URL,
});

export function encrypt(value) {
  return CryptoJS.AES.encrypt(value, ENCRYPTION_KEY).toString();
}

export function decrypt(value) {
  const bytes = CryptoJS.AES.decrypt(value, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

function setEncryptedStorageItem(key, value) {
  if (value === null || value === undefined || value === "") {
    localStorage.removeItem(key);
    return;
  }

  localStorage.setItem(key, encrypt(String(value)));
}

function getDecryptedStorageItem(key) {
  const encryptedValue = localStorage.getItem(key);

  if (!encryptedValue) {
    return null;
  }

  try {
    const decryptedValue = decrypt(encryptedValue);
    return decryptedValue || null;
  } catch (error) {
    clearAuth();
    return null;
  }
}

export function saveToken(token) {
  setEncryptedStorageItem(TOKEN_STORAGE_KEY, token);
}

export function getToken() {
  return getDecryptedStorageItem(TOKEN_STORAGE_KEY);
}

export function saveRole(role) {
  setEncryptedStorageItem(ROLE_STORAGE_KEY, role);
}

export function getRole() {
  return getDecryptedStorageItem(ROLE_STORAGE_KEY);
}

export function saveUserId(userId) {
  setEncryptedStorageItem(USER_ID_STORAGE_KEY, userId);
}

export function getUserId() {
  return getDecryptedStorageItem(USER_ID_STORAGE_KEY);
}

export function saveExpirationTime(expirationTime) {
  setEncryptedStorageItem(EXPIRATION_TIME_STORAGE_KEY, expirationTime);
}

export function getExpirationTime() {
  return getDecryptedStorageItem(EXPIRATION_TIME_STORAGE_KEY);
}

export function saveAuthSession({
  token,
  role,
  userId,
  expirationTime,
} = {}) {
  saveToken(token);
  saveRole(role);
  saveUserId(userId);
  saveExpirationTime(expirationTime);
}

export function getAuthSession() {
  return {
    token: getToken(),
    role: getRole(),
    userId: getUserId(),
    expirationTime: getExpirationTime(),
  };
}

export function isSessionExpired(expirationTime = getExpirationTime()) {
  if (!expirationTime) {
    return false;
  }

  const expiresAt = Date.parse(expirationTime);

  if (Number.isNaN(expiresAt)) {
    return false;
  }

  return expiresAt <= Date.now();
}

export function clearAuth() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(ROLE_STORAGE_KEY);
  localStorage.removeItem(USER_ID_STORAGE_KEY);
  localStorage.removeItem(EXPIRATION_TIME_STORAGE_KEY);
}

export function isAuthenticated() {
  const token = getToken();

  if (!token) {
    return false;
  }

  if (isSessionExpired()) {
    clearAuth();
    return false;
  }

  return true;
}

export function isAdmin() {
  return isAuthenticated() && getRole() === "ADMIN";
}

apiClient.interceptors.request.use((config) => {
  const token = isAuthenticated() ? getToken() : null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (!isFormData && config.data && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuth();

      if (typeof window !== "undefined") {
        const { pathname } = window.location;

        if (!PUBLIC_AUTH_PATHS.includes(pathname)) {
          window.location.replace("/login");
        }
      }
    }

    return Promise.reject(error);
  }
);

export function withCollectionAlias(payload, key, mapper = (item) => item) {
  const items = Array.isArray(payload?.data) ? payload.data.map(mapper) : [];
  return { ...payload, data: items, [key]: items };
}

export function withItemAlias(payload, key, mapper = (item) => item) {
  const item = payload?.data ? mapper(payload.data) : null;
  return { ...payload, data: item, [key]: item };
}

export function withTopLevelAlias(
  payload,
  sourceKey,
  aliasKey,
  mapper = (item) => item
) {
  const rawValue = payload?.[sourceKey];

  if (Array.isArray(rawValue)) {
    const items = rawValue.map(mapper);
    return { ...payload, data: items, [aliasKey]: items };
  }

  const item = rawValue ? mapper(rawValue) : null;
  return { ...payload, data: item, [aliasKey]: item };
}

export function resolveApiAssetUrl(url) {
  if (!url) {
    return "";
  }

  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) {
    return url;
  }

  if (url.startsWith("/assets/") || url.startsWith("/images/")) {
    return `${API_ORIGIN}${url}`;
  }

  return url;
}

export function normalizeProduct(product) {
  if (!product) return null;

  const purchaseprice = product.purchaseprice ?? product.Purchaseprice ?? null;
  const saleprice = product.saleprice ?? product.Saleprice ?? null;
  const price = product.price ?? saleprice ?? purchaseprice ?? 0;

  return {
    ...product,
    id: product.id ?? product.productId,
    productId: product.productId ?? product.id,
    purchaseprice,
    saleprice,
    price,
    su: product.su ?? product.sku,
    imageUrl: resolveApiAssetUrl(product.imageUrl),
  };
}

export function normalizeCategory(category) {
  return category ? { ...category } : null;
}

export function normalizeSupplier(supplier) {
  return supplier ? { ...supplier } : null;
}

export function normalizeUser(user) {
  return user ? { ...user } : null;
}

export function decodeBase64(base64Value) {
  if (typeof atob === "function") {
    return atob(base64Value);
  }

  if (typeof Buffer !== "undefined") {
    return Buffer.from(base64Value, "base64").toString("binary");
  }

  throw new Error("Unable to decode placeholder image");
}

export function createPlaceholderImageFile() {
  const binary = decodeBase64(PLACEHOLDER_IMAGE_BASE64);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new File([bytes], "placeholder-product.png", { type: "image/png" });
}

export function isMissingFormDataValue(formData, key) {
  const value = formData.get(key);

  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === "string") {
    return value.trim() === "";
  }

  if (typeof File !== "undefined" && value instanceof File) {
    return value.size === 0;
  }

  return false;
}

export function upsertFormDataValue(formData, key, value) {
  if (typeof formData.set === "function") {
    formData.set(key, value);
    return;
  }

  formData.append(key, value);
}

export function prepareProductFormData(
  formData,
  { requireImage = false } = {}
) {
  if (typeof FormData === "undefined" || !(formData instanceof FormData)) {
    return formData;
  }

  if (isMissingFormDataValue(formData, "expiryDate")) {
    upsertFormDataValue(formData, "expiryDate", DEFAULT_EXPIRY_DATE);
  }

  if (requireImage && isMissingFormDataValue(formData, "imageFile")) {
    upsertFormDataValue(formData, "imageFile", createPlaceholderImageFile());
  }

  return formData;
}

export function buildNotes(...parts) {
  return parts
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean)
    .join(" | ");
}

export function toNumber(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
}

export function formatStatus(status) {
  if (!status) return "";
  return String(status).replace(/_/g, " ").toUpperCase();
}
