// Learning note: Warehouse API calls live here. These functions support warehouse
// CRUD plus product assignment/removal inside a warehouse.
import {
  apiClient,
  normalizeProduct,
  withCollectionAlias,
  withItemAlias,
} from "./apiClient";

export async function getAllWarehouses() {
  const response = await apiClient.get("/warehouses/all");
  return withCollectionAlias(response.data, "warehouses");
}

export async function createWarehouse(warehouseData) {
  const response = await apiClient.post("/warehouses/add", warehouseData);
  return response.data;
}

export async function getWarehouseById(warehouseId) {
  const response = await apiClient.get(`/warehouses/${warehouseId}`);
  return withItemAlias(response.data, "warehouse");
}

export async function updateWarehouse(warehouseId, warehouseData) {
  const response = await apiClient.put(
    `/warehouses/update/${warehouseId}`,
    warehouseData
  );
  return response.data;
}

export async function deleteWarehouse(warehouseId) {
  const response = await apiClient.delete(`/warehouses/delete/${warehouseId}`);
  return response.data;
}

export async function getProductsByWarehouse(warehouseId) {
  const response = await apiClient.get(`/warehouses/${warehouseId}/products`);
  return withCollectionAlias(response.data, "products", normalizeProduct);
}

export async function addProductToWarehouse(warehouseId, productId, quantity) {
  const response = await apiClient.post(`/warehouses/${warehouseId}/products`, null, {
    params: quantity === undefined || quantity === null ? { productId } : { productId, quantity },
  });
  return response.data;
}

export async function removeProductFromWarehouse(warehouseId, productId) {
  const response = await apiClient.delete(
    `/warehouses/${warehouseId}/products/${productId}`
  );
  return response.data;
}

export async function resolveWarehouseId(body = {}) {
  if (body.warehouseId !== null && body.warehouseId !== undefined && body.warehouseId !== "") {
    return Number(body.warehouseId);
  }

  try {
    const warehouseResponse = await getAllWarehouses();
    const warehouses = Array.isArray(warehouseResponse?.data)
      ? warehouseResponse.data
      : [];

    if (!warehouses.length) {
      throw new Error("No warehouse found");
    }

    return warehouses[0].id;
  } catch (error) {
    if (error?.response?.status === 403) {
      throw new Error(
        "Backend now requires warehouseId. Add warehouseId to the request or log in with a role that can read warehouses."
      );
    }

    throw new Error(
      error?.response?.data?.message ||
        error?.message ||
        "Unable to resolve warehouseId"
    );
  }
}
