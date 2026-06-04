// Learning note: Stock inward and stock take API calls live here. These endpoints
// support receiving purchased goods and checking warehouse stock.
import { apiClient, withTopLevelAlias } from "./apiClient";

export async function getAllStockInwards() {
  const response = await apiClient.get("/stock-inwards");
  return withTopLevelAlias(response.data, "stockInwards", "stockInwards");
}

export async function createStockInward(stockInwardData) {
  const response = await apiClient.post("/stock-inwards", stockInwardData);
  return response.data;
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

export async function updateStockInwardStatus(stockInwardId, status) {
  const response = await apiClient.patch(
    `/stock-inwards/${stockInwardId}/status`,
    null,
    { params: { status } }
  );
  return response.data;
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
