// Learning note: Inventory API calls live here. Dashboards use this service for
// stock lists, summaries, movement history, and exports.
import { apiClient, withCollectionAlias, withItemAlias } from "./apiClient";

export async function getAllInventories() {
  const response = await apiClient.get("/inventories/all");
  return withCollectionAlias(response.data, "inventories");
}

export async function getInventoryById(inventoryId) {
  const response = await apiClient.get(`/inventories/${inventoryId}`);
  return withItemAlias(response.data, "inventory");
}

export async function getInventoriesByWarehouse(warehouseId) {
  const response = await apiClient.get(`/inventories/warehouse/${warehouseId}`);
  return withCollectionAlias(response.data, "inventories");
}

export async function searchInventories(params = {}) {
  const response = await apiClient.get("/inventories/search", { params });
  return withCollectionAlias(response.data, "inventories");
}

export async function getInventorySummary() {
  const response = await apiClient.get("/inventories/summary");
  return withItemAlias(response.data, "summary");
}

export async function exportInventories(params = {}) {
  const response = await apiClient.get("/inventories/export", {
    params,
    responseType: "blob",
  });
  return response.data;
}

export async function getInventoryMovements(params = {}) {
  const response = await apiClient.get("/inventory-movements", { params });
  return withCollectionAlias(response.data, "inventoryMovements");
}
