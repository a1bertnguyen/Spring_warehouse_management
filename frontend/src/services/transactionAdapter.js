// Learning note: This adapter preserves the older "transaction" UI by combining
// purchase requests and sales orders into one normalized transaction shape.
import {
  buildNotes,
  formatStatus,
  normalizeProduct,
  toNumber,
} from "./apiClient";
import {
  createPurchaseRequest,
  getAllPurchaseRequests,
  getPurchaseRequestById,
  getPurchaseRequestDetails,
  updatePurchaseRequestStatus,
} from "./purchaseRequestService";
import {
  createSalesOrder,
  getAllSalesOrders,
  getSalesOrderById,
  getSalesOrderDetails,
  updateSalesOrderStatus,
} from "./salesOrderService";
import { resolveWarehouseId } from "./warehouseService";

export function matchesTransactionFilter(transaction, filterValue) {
  const normalizedFilter = String(filterValue || "").trim().toLowerCase();

  if (!normalizedFilter) {
    return true;
  }

  return [
    transaction.id,
    transaction.transactionType,
    transaction.status,
    transaction.description,
    transaction.note,
    transaction.product?.name,
    transaction.product?.sku,
    transaction.user?.name,
    transaction.supplier?.name,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(normalizedFilter));
}

export function normalizePurchaseTransaction(request) {
  const details = Array.isArray(request?.requestDetails)
    ? request.requestDetails
    : [];
  const firstDetail = details[0] || {};
  const totalProducts =
    request?.totalItems ??
    details.reduce(
      (sum, detail) => sum + (Number(detail?.requestedQuantity) || 0),
      0
    );
  const totalPrice = Number(
    request?.totalEstimatedAmount ??
      details.reduce(
        (sum, detail) => sum + (Number(detail?.lineTotalEstimated) || 0),
        0
      ) ??
      0
  );

  const supplier =
    request?.supplierId || request?.supplierName
      ? {
          id: request?.supplierId ?? null,
          name: request?.supplierName ?? "",
          contactInfo: "",
          address: "",
        }
      : null;

  return {
    id: `purchase-request-${request?.id}`,
    sourceId: request?.id,
    sourceType: "purchase-request",
    transactionType: "PURCHASE REQUEST",
    status: formatStatus(request?.status),
    description: request?.requestCode || request?.notes || "Purchase request",
    note: request?.notes || "",
    totalProducts,
    totalPrice,
    createdAt: request?.createdAt || request?.requestDate,
    updatedAt: request?.updatedAt || request?.approvedAt || null,
    product: normalizeProduct({
      id: firstDetail?.productId ?? null,
      productId: firstDetail?.productId ?? null,
      name: firstDetail?.productName ?? "N/A",
      sku: firstDetail?.productSku ?? "",
      price: Number(firstDetail?.unitPriceEstimated || 0),
      stockQuantity: Number(firstDetail?.requestedQuantity || 0),
      description: firstDetail?.note || "",
    }),
    user: {
      id: request?.requesterId ?? null,
      name: request?.requesterName || "N/A",
      email: "",
      phoneNumber: "",
      role: "",
    },
    supplier,
    suppliers: supplier,
    details,
  };
}

export function normalizeSalesTransaction(order) {
  const details = Array.isArray(order?.orderDetails) ? order.orderDetails : [];
  const firstDetail = details[0] || {};
  const totalProducts =
    order?.totalItems ??
    details.reduce(
      (sum, detail) => sum + (Number(detail?.quantityOrdered) || 0),
      0
    );
  const totalPrice = Number(order?.totalOrderValue ?? 0);

  return {
    id: `sales-order-${order?.id}`,
    sourceId: order?.id,
    sourceType: "sales-order",
    transactionType: "SALES ORDER",
    status: formatStatus(order?.status),
    description: order?.orderCode || order?.notes || "Sales order",
    note: order?.notes || "",
    totalProducts,
    totalPrice,
    createdAt: order?.createdAt || order?.orderDate,
    updatedAt: order?.updatedAt || null,
    product: normalizeProduct({
      id: firstDetail?.productId ?? null,
      productId: firstDetail?.productId ?? null,
      name: firstDetail?.productName ?? "N/A",
      sku: firstDetail?.productSku ?? "",
      price: Number(firstDetail?.unitSalePrice || 0),
      stockQuantity: Number(firstDetail?.quantityOrdered || 0),
      description: order?.notes || "",
    }),
    user: {
      id: order?.createdById ?? null,
      name: order?.createdByName || "N/A",
      email: "",
      phoneNumber: "",
      role: "",
    },
    supplier: null,
    suppliers: null,
    details,
  };
}

export function parseTransactionIdentifier(transactionId) {
  const rawId = String(transactionId || "");

  if (rawId.startsWith("purchase-request-")) {
    return {
      sourceType: "purchase-request",
      sourceId: Number(rawId.replace("purchase-request-", "")),
    };
  }

  if (rawId.startsWith("sales-order-")) {
    return {
      sourceType: "sales-order",
      sourceId: Number(rawId.replace("sales-order-", "")),
    };
  }

  const numericId = Number(rawId);
  return {
    sourceType: "unknown",
    sourceId: Number.isNaN(numericId) ? rawId : numericId,
  };
}

export function mapLegacyStatusToPurchaseRequest(status) {
  const normalized = String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const statusMap = {
    pending: "pending_approval",
    pending_approval: "pending_approval",
    processing: "approved",
    approved: "approved",
    completed: "converted",
    converted: "converted",
    cancelled: "rejected",
    canceled: "rejected",
    rejected: "rejected",
  };

  return statusMap[normalized] || normalized;
}

export function mapLegacyStatusToSalesOrder(status) {
  const normalized = String(status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const statusMap = {
    pending: "pending_stock_check",
    pending_stock_check: "pending_stock_check",
    processing: "awaiting_shipment",
    awaiting_shipment: "awaiting_shipment",
    shipped: "shipped",
    completed: "completed",
    cancelled: "cancelled",
    canceled: "cancelled",
  };

  return statusMap[normalized] || normalized;
}

export async function purchaseProduct(body) {
  const warehouseId = await resolveWarehouseId(body);
  const requestBody = {
    warehouseId,
    supplierId: toNumber(body?.supplierId),
    notes: buildNotes(body?.description, body?.note),
    items: [
      {
        productId: toNumber(body?.productId),
        requestedQuantity: toNumber(body?.quantity),
        supplierIdSuggested: toNumber(body?.supplierId),
        note: buildNotes(body?.note, body?.description),
      },
    ],
  };

  const response = await createPurchaseRequest(requestBody);
  const transaction = normalizePurchaseTransaction(response?.data);
  return { ...response, data: transaction, transaction };
}

export async function sellProduct(body) {
  const warehouseId = await resolveWarehouseId(body);
  const requestBody = {
    notes: buildNotes(body?.description, body?.note),
    items: [
      {
        productId: toNumber(body?.productId),
        quantityOrdered: toNumber(body?.quantity),
        warehouseId,
      },
    ],
  };

  const response = await createSalesOrder(requestBody);
  const transaction = normalizeSalesTransaction(response?.data);
  return { ...response, data: transaction, transaction };
}

export async function returnToSupplier() {
  throw new Error(
    "Return-to-supplier flow is not exposed by the current backend API."
  );
}

export async function getAllTransactions(filter) {
  const purchaseParams = { page: 0, size: 100 };
  const salesParams = { page: 0, size: 100 };

  if (filter) {
    purchaseParams.requestCode = filter;
    salesParams.orderCode = filter;
    salesParams.customerName = filter;
  }

  const [purchaseResult, salesResult] = await Promise.allSettled([
    getAllPurchaseRequests(purchaseParams),
    getAllSalesOrders(salesParams),
  ]);

  const transactions = [];

  if (purchaseResult.status === "fulfilled") {
    transactions.push(
      ...purchaseResult.value.data.map((request) =>
        normalizePurchaseTransaction(request)
      )
    );
  }

  if (salesResult.status === "fulfilled") {
    transactions.push(
      ...salesResult.value.data.map((order) => normalizeSalesTransaction(order))
    );
  }

  if (!transactions.length) {
    throw (
      purchaseResult.status === "rejected"
        ? purchaseResult.reason
        : salesResult.reason
    );
  }

  const filteredTransactions = transactions
    .filter((transaction) => matchesTransactionFilter(transaction, filter))
    .sort(
      (left, right) =>
        new Date(right.createdAt || 0).getTime() -
        new Date(left.createdAt || 0).getTime()
    );

  return {
    status: 200,
    message: "success",
    data: filteredTransactions,
    transactions: filteredTransactions,
  };
}

export async function getTransactionById(transactionId) {
  const parsedIdentifier = parseTransactionIdentifier(transactionId);

  if (parsedIdentifier.sourceType === "purchase-request") {
    const [requestResponse, detailsResponse] = await Promise.all([
      getPurchaseRequestById(parsedIdentifier.sourceId),
      getPurchaseRequestDetails(parsedIdentifier.sourceId),
    ]);

    const request = {
      ...(requestResponse.data || {}),
      requestDetails: detailsResponse.data || [],
    };
    const transaction = normalizePurchaseTransaction(request);
    return { ...requestResponse, data: transaction, transaction };
  }

  if (parsedIdentifier.sourceType === "sales-order") {
    const [orderResponse, detailsResponse] = await Promise.all([
      getSalesOrderById(parsedIdentifier.sourceId),
      getSalesOrderDetails(parsedIdentifier.sourceId),
    ]);

    const order = {
      ...(orderResponse.data || {}),
      orderDetails: detailsResponse.data || [],
    };
    const transaction = normalizeSalesTransaction(order);
    return { ...orderResponse, data: transaction, transaction };
  }

  try {
    return await getTransactionById(`purchase-request-${transactionId}`);
  } catch (purchaseError) {
    return getTransactionById(`sales-order-${transactionId}`);
  }
}

export async function updateTransactionStatus(transactionId, status) {
  const parsedIdentifier = parseTransactionIdentifier(transactionId);

  if (parsedIdentifier.sourceType === "purchase-request") {
    return updatePurchaseRequestStatus(
      parsedIdentifier.sourceId,
      mapLegacyStatusToPurchaseRequest(status)
    );
  }

  if (parsedIdentifier.sourceType === "sales-order") {
    return updateSalesOrderStatus(
      parsedIdentifier.sourceId,
      mapLegacyStatusToSalesOrder(status)
    );
  }

  try {
    return await updateTransactionStatus(
      `purchase-request-${transactionId}`,
      status
    );
  } catch (purchaseError) {
    return updateTransactionStatus(`sales-order-${transactionId}`, status);
  }
}
