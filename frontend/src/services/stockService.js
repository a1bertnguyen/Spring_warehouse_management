import { apiClient, withTopLevelAlias } from "./apiClient";

export async function getAllStockInwards() {
  const response = await apiClient.get("/stock-inwards");
  return withTopLevelAlias(response.data, "stockInwards", "stockInwards");
}

export async function getStockInwardById(stockInwardId) {
  const response = await apiClient.get(`/stock-inwards/${stockInwardId}`);
  return withTopLevelAlias(response.data, "stockInward", "stockInward");
}

export async function getStockInwardDetails(stockInwardId) {
  const response = await apiClient.get(`/stock-inwards/${stockInwardId}/details`);
  return withTopLevelAlias(
    response.data,
    "stockInwardDetails",
    "stockInwardDetails"
  );
}

export async function getAllStockTakes() {
  const response = await apiClient.get("/stock-takes");
  return withTopLevelAlias(response.data, "stockTakes", "stockTakes");
}

export async function getStockTakeById(stockTakeId) {
  const response = await apiClient.get(`/stock-takes/${stockTakeId}`);
  return withTopLevelAlias(response.data, "stockTake", "stockTake");
}

export async function getStockTakeDetails(stockTakeId) {
  const response = await apiClient.get(`/stock-takes/${stockTakeId}/details`);
  return withTopLevelAlias(
    response.data,
    "stockTakeDetails",
    "stockTakeDetails"
  );
}
