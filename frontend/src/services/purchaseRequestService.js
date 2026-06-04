// Learning note: Purchase request API calls live here. Purchase and warehouse
// dashboards use these endpoints to create and approve replenishment requests.
import { apiClient, withCollectionAlias, withItemAlias } from "./apiClient";

export async function getAllPurchaseRequests(params = {}) {
  const response = await apiClient.get("/purchase-requests", { params });
  return withCollectionAlias(response.data, "purchaseRequests");
}

export async function createPurchaseRequest(requestData) {
  const response = await apiClient.post("/purchase-requests", requestData);
  return response.data;
}

export async function getPurchaseRequestById(requestId) {
  const response = await apiClient.get(`/purchase-requests/${requestId}`);
  return withItemAlias(response.data, "purchaseRequest");
}

export async function getPurchaseRequestDetails(requestId) {
  const response = await apiClient.get(`/purchase-requests/${requestId}/details`);
  return withCollectionAlias(response.data, "purchaseRequestDetails");
}

export async function updatePurchaseRequestStatus(requestId, status) {
  const response = await apiClient.patch(
    `/purchase-requests/${requestId}/status`,
    null,
    { params: { status } }
  );
  return response.data;
}

export async function deletePurchaseRequest(requestId) {
  const response = await apiClient.delete(`/purchase-requests/${requestId}`);
  return response.data;
}
