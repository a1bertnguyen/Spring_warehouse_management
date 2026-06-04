// Learning note: Keep client-side route paths in one place so links, redirects,
// and route definitions do not drift apart as the app grows.
export const PATHS = {
  root: "/",
  login: "/login",
  dashboard: "/dashboard",
  dashboardWarehouses: "/dashboard/warehouses",
  dashboardSuppliers: "/dashboard/suppliers",
  dashboardInventory: "/dashboard/inventory",
  dashboardInventoryMovements: "/dashboard/inventory-movements",
  dashboardSalesOrders: "/dashboard/sales-orders",
  dashboardPurchaseRequests: "/dashboard/purchase-requests",
  dashboardPurchaseOrders: "/dashboard/purchase-orders",
  dashboardGoodsReceipts: "/dashboard/goods-receipts",
  dashboardCreateStockInward: "/dashboard/create-stock-inward",
  category: "/category",
  supplier: "/supplier",
  addSupplier: "/add-supplier",
  editSupplier: "/edit-supplier/:supplierId",
  product: "/product",
  addProduct: "/add-product",
  editProduct: "/edit-product/:productId",
  purchase: "/purchase",
  sell: "/sell",
  transaction: "/transaction",
  transactionDetails: "/transaction/:transactionId",
  profile: "/profile",
  users: "/users",
  activityLogs: "/activity-logs",
};

export const buildEditSupplierPath = (supplierId) => `/edit-supplier/${supplierId}`;
export const buildEditProductPath = (productId) => `/edit-product/${productId}`;
export const buildTransactionDetailsPath = (transactionId) => `/transaction/${transactionId}`;
