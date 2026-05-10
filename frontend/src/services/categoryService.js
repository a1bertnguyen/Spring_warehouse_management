import {
  apiClient,
  normalizeCategory,
  withCollectionAlias,
  withItemAlias,
} from "./apiClient";

export async function createCategory(category) {
  const response = await apiClient.post("/categories/add", category);
  return response.data;
}

export async function getAllCategory() {
  const response = await apiClient.get("/categories/all");
  return withCollectionAlias(response.data, "categories", normalizeCategory);
}

export async function getCategoryById(categoryId) {
  const response = await apiClient.get(`/categories/${categoryId}`);
  return withItemAlias(response.data, "category", normalizeCategory);
}

export async function updateCategory(categoryId, categoryData) {
  const response = await apiClient.put(
    `/categories/update/${categoryId}`,
    categoryData
  );
  return response.data;
}

export async function deleteCategory(categoryId) {
  const response = await apiClient.delete(`/categories/delete/${categoryId}`);
  return response.data;
}
