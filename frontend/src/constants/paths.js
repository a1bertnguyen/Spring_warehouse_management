export const PATHS = {
  root: "/",
  login: "/login",
  dashboard: "/dashboard",
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
