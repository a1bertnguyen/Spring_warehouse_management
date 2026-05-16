import { apiClient, withCollectionAlias, withItemAlias } from "./apiClient";

export async function getAllPurchaseOrders(params = {}) {
  const response = await apiClient.get("/purchase-orders", { params });
  return withCollectionAlias(response.data, "purchaseOrders");
}

export async function createPurchaseOrder(orderData) {
  const response = await apiClient.post("/purchase-orders", orderData);
  return response.data;
}

export async function getPurchaseOrderById(orderId) {
  const response = await apiClient.get(`/purchase-orders/${orderId}`);
  return withItemAlias(response.data, "purchaseOrder");
}

export async function updatePurchaseOrder(orderId, orderData) {
  const response = await apiClient.put(`/purchase-orders/${orderId}`, orderData);
  return response.data;
}

export async function getPurchaseOrderDetails(orderId) {
  const response = await apiClient.get(`/purchase-orders/${orderId}/details`);
  return withCollectionAlias(response.data, "purchaseOrderDetails");
}

export async function updatePurchaseOrderStatus(orderId, status) {
  const response = await apiClient.patch(
    `/purchase-orders/${orderId}/status`,
    null,
    { params: { status } }
  );
  return response.data;
}

export async function deletePurchaseOrder(orderId) {
  const response = await apiClient.delete(`/purchase-orders/${orderId}`);
  return response.data;
}
