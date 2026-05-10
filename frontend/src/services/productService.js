import {
  apiClient,
  normalizeProduct,
  prepareProductFormData,
  withCollectionAlias,
  withItemAlias,
} from "./apiClient";

export async function addProduct(formData) {
  const payload = prepareProductFormData(formData, { requireImage: true });
  const response = await apiClient.post("/products/add", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function updateProduct(formData) {
  const payload = prepareProductFormData(formData);
  const response = await apiClient.put("/products/update", payload, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}

export async function getAllProducts() {
  const response = await apiClient.get("/products/all");
  return withCollectionAlias(response.data, "products", normalizeProduct);
}

export async function getProductById(productId) {
  const response = await apiClient.get(`/products/${productId}`);
  return withItemAlias(response.data, "product", normalizeProduct);
}

export async function searchProduct(searchValue) {
  const response = await apiClient.get("/products/search", {
    params: { input: searchValue },
  });
  return withCollectionAlias(response.data, "products", normalizeProduct);
}

export async function deleteProduct(productId) {
  const response = await apiClient.delete(`/products/delete/${productId}`);
  return response.data;
}
