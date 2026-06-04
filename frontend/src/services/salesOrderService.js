// Learning note: Sales order API calls live here. Sales and warehouse staff use
// this service to create, review, ship, and complete sales orders.
import { apiClient, withCollectionAlias, withItemAlias } from "./apiClient";

export async function getAllSalesOrders(params = {}) {
  const response = await apiClient.get("/sales-orders", { params });
  return withCollectionAlias(response.data, "salesOrders");
}

export async function createSalesOrder(orderData) {
  const response = await apiClient.post("/sales-orders", orderData);
  return response.data;
}

export async function getSalesOrderById(orderId) {
  const response = await apiClient.get(`/sales-orders/${orderId}`);
  return withItemAlias(response.data, "salesOrder");
}

export async function getSalesOrderDetails(orderId) {
  const response = await apiClient.get(`/sales-orders/${orderId}/details`);
  return withCollectionAlias(response.data, "salesOrderDetails");
}

export async function updateSalesOrderStatus(orderId, status) {
  const response = await apiClient.patch(
    `/sales-orders/${orderId}/status`,
    null,
    { params: { status } }
  );
  return response.data;
}

export async function deleteSalesOrder(orderId) {
  const response = await apiClient.delete(`/sales-orders/${orderId}`);
  return response.data;
}
