const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

function getAuthHeader() {
  const rawUser = localStorage.getItem('warehouse_user');
  const user = rawUser ? JSON.parse(rawUser) : null;
  return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
}

async function request(path, options = {}) {
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...getAuthHeader(),
      ...options.headers,
    },
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : await response.text();

  if (!response.ok) {
    const message = data?.message || data || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}

export const authApi = {
  login: (payload) => request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};

export const purchasingApi = {
  getPurchaseRequests: (params = {}) => request(`/api/purchase-requests${toQuery(params)}`),
  getPurchaseRequestDetails: (id) => request(`/api/purchase-requests/${id}/details`),
  updatePurchaseRequestStatus: (id, status) => request(`/api/purchase-requests/${id}/status?status=${status}`, { method: 'PATCH' }),
  getPurchaseOrders: (params = {}) => request(`/api/purchase-orders${toQuery(params)}`),
  getPurchaseOrderDetails: (id) => request(`/api/purchase-orders/${id}/details`),
  updatePurchaseOrderStatus: (id, status) => request(`/api/purchase-orders/${id}/status?status=${status}`, { method: 'PATCH' }),
  getSuppliers: () => request('/api/suppliers/all'),
  addSupplier: (payload) => request('/api/suppliers/add', { method: 'POST', body: JSON.stringify(payload) }),
  getStockInwards: () => request('/api/stock-inwards'),
  getInventoryMovements: (params = {}) => request(`/api/inventory-movements${toQuery(params)}`),
  getProducts: () => request('/api/products/all'),
};

export const warehouseApi = {
  getStockInwards: () => request('/api/stock-inwards'),
  getStockInwardDetails: (id) => request(`/api/stock-inwards/${id}/details`),
  getStockTakes: () => request('/api/stock-takes'),
  getStockTakeDetails: (id) => request(`/api/stock-takes/${id}/details`),
  getInventoryMovements: (params = {}) => request(`/api/inventory-movements${toQuery(params)}`),
  getProducts: () => request('/api/products/all'),
  getTasksByUser: (userId) => request(`/api/tasks/user/${userId}`),
  updateTaskStatus: (id, status) => request(`/api/tasks/${id}/status?status=${status}`, { method: 'PATCH' }),
};

export function toQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.append(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

export function unwrapArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(payload?.data?.[key])) return payload.data[key];
  }
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.data?.content)) return payload.data.content;
  return [];
}

export function unwrapMeta(payload) {
  return payload?.meta || payload?.data?.meta || {};
}
