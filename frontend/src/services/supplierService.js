// Learning note: Supplier API calls live here. Supplier records are used by
// product setup and purchase workflows.
import {
  apiClient,
  normalizeSupplier,
  withCollectionAlias,
  withItemAlias,
} from "./apiClient";

export async function addSupplier(supplierData) {
  const response = await apiClient.post("/suppliers/add", supplierData);
  return response.data;
}

export async function getAllSuppliers() {
  const response = await apiClient.get("/suppliers/all");
  return withCollectionAlias(response.data, "suppliers", normalizeSupplier);
}

export async function getSupplierById(supplierId) {
  const response = await apiClient.get(`/suppliers/${supplierId}`);
  return withItemAlias(response.data, "supplier", normalizeSupplier);
}

export async function updateSupplier(supplierId, supplierData) {
  const response = await apiClient.put(
    `/suppliers/update/${supplierId}`,
    supplierData
  );
  return response.data;
}

export async function deleteSupplier(supplierId) {
  const response = await apiClient.delete(`/suppliers/delete/${supplierId}`);
  return response.data;
}
