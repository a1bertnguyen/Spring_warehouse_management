export const PATHS = {
  root: "/",
  login: "/login",
  dashboard: "/dashboard",
  dashboardWarehouses: "/dashboard/warehouses",
  dashboardInventory: "/dashboard/inventory",
  dashboardSalesOrders: "/dashboard/sales-orders",
  dashboardPurchaseOrders: "/dashboard/purchase-orders",
  dashboardGoodsReceipts: "/dashboard/goods-receipts",
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
