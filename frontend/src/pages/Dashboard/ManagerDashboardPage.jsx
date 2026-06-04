// Learning note: ManagerDashboardPage is the broad operations dashboard. It
// connects categories, warehouses, products, inventory, and order approvals.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { PATHS } from "../../constants/paths";
import ApiService from "../../services/ApiService";
import PaginationComponent from "../../components/common/PaginationComponent";
import "./ManagerDashboardPage.css";

const INVENTORY_MOVEMENT_ITEMS_PER_PAGE = 12;

const SECTION_COPY = {
  overview: {
    eyebrow: "Overview",
    title: "Warehouse snapshot",
    description: "Only the most important stock and warehouse signals.",
  },
  warehouses: {
    eyebrow: "Warehouses",
    title: "Warehouse list",
    description: "Manage warehouse records and open the product list for each location.",
  },
  inventory: {
    eyebrow: "Inventory",
    title: "Inventory health and stock alerts",
    description:
      "Review on-hand quantities, low-stock risk, and out-of-stock items before they affect fulfillment.",
  },
  inventoryMovements: {
    eyebrow: "Inventory movements",
    title: "Stock movement history",
    description:
      "Trace stock-in and stock-out activity by warehouse, product, actor, and reference document.",
  },
  salesOrders: {
    eyebrow: "Sales orders",
    title: "Recent outbound demand",
    description:
      "Approve customer orders before they move into warehouse shipment handling.",
  },
  purchaseRequests: {
    eyebrow: "Purchase requests",
    title: "Restock request approvals",
    description:
      "Review replenishment requests from warehouse staff before they become supplier-facing purchase orders.",
  },
  purchaseOrders: {
    eyebrow: "Purchase orders",
    title: "Inbound procurement status",
    description:
      "Track supplier-facing purchase orders after requests have already been approved.",
  },
  goodsReceipts: {
    eyebrow: "Stock inwards",
    title: "Inbound receiving activity",
    description:
      "Approve inbound documents created by purchasing before warehouse staff completes receiving.",
  },
};

const EMPTY_WAREHOUSE_FORM = {
  name: "",
  address: "",
};

const ORDER_DETAIL_CONFIG = {
  salesOrder: {
    key: "salesOrderDetails",
    typeLabel: "Sales order details",
    quantityLabel: "Ordered",
    quantityKey: "quantityOrdered",
    priceLabel: "Unit price",
    priceKey: "unitSalePrice",
    totalLabel: "Line total",
    totalKey: "lineTotal",
    loader: (identifier) => ApiService.getSalesOrderDetails(identifier),
  },
  purchaseOrder: {
    key: "purchaseOrderDetails",
    typeLabel: "Purchase order details",
    quantityLabel: "Ordered",
    quantityKey: "orderedQuantity",
    priceLabel: "Est. unit cost",
    priceKey: "unitPriceEstimated",
    totalLabel: "Est. total",
    totalKey: "lineTotalEstimated",
    loader: (identifier) => ApiService.getPurchaseOrderDetails(identifier),
  },
  purchaseRequest: {
    key: "purchaseRequestDetails",
    typeLabel: "Purchase request details",
    quantityLabel: "Requested",
    quantityKey: "requestedQuantity",
    priceLabel: "Est. unit cost",
    priceKey: "unitPriceEstimated",
    totalLabel: "Est. total",
    totalKey: "lineTotalEstimated",
    loader: (identifier) => ApiService.getPurchaseRequestDetails(identifier),
  },
  stockInward: {
    key: "stockInwardDetails",
    typeLabel: "Stock inward details",
    quantityLabel: "Received",
    quantityKey: "quantityReceived",
    priceLabel: "Unit cost",
    priceKey: "unitPriceNegotiated",
    fallbackPriceKey: "unitPurchasePrice",
    totalLabel: "Line value",
    totalKey: "lineValue",
    loader: (identifier) => ApiService.getStockInwardDetails(identifier),
  },
};

const ORDER_STATUS_TRANSITIONS = {
  salesOrder: {
    pending_stock_check: ["awaiting_shipment", "cancelled"],
    awaiting_shipment: ["cancelled"],
    shipped: [],
    completed: [],
    cancelled: [],
  },
  purchaseRequest: {
    pending_approval: ["approved", "rejected"],
    approved: [],
    rejected: [],
    converted: [],
  },
  purchaseOrder: {
    pending_approval: [],
    approved: [],
    rejected: [],
    ordered: [],
    partially_received: [],
    received: [],
    cancelled: [],
  },
  stockInward: {
    DRAFT: ["APPROVED", "CANCELLED"],
    APPROVED: ["CANCELLED"],
    COMPLETED: [],
    CANCELLED: [],
  },
};

const ORDER_ACTIONS = {
  salesOrder: {
    pending_stock_check: [
      { value: "awaiting_shipment", label: "Approve", className: "success-button" },
      { value: "cancelled", label: "Reject", className: "danger-button" },
    ],
    awaiting_shipment: [
      { value: "cancelled", label: "Cancel", className: "danger-button" },
    ],
  },
  purchaseRequest: {
    pending_approval: [
      { value: "approved", label: "Approve", className: "success-button" },
      { value: "rejected", label: "Reject", className: "danger-button" },
    ],
  },
  purchaseOrder: {
  },
  stockInward: {
    DRAFT: [
      { value: "APPROVED", label: "Approve", className: "success-button" },
      { value: "CANCELLED", label: "Reject", className: "danger-button" },
    ],
    APPROVED: [
      { value: "CANCELLED", label: "Cancel", className: "danger-button" },
    ],
  },
};

const APPROVAL_SECTION_BY_KIND = {
  salesOrder: PATHS.dashboardSalesOrders,
  purchaseRequest: PATHS.dashboardPurchaseRequests,
  purchaseOrder: PATHS.dashboardPurchaseOrders,
  stockInward: PATHS.dashboardGoodsReceipts,
};

function formatStatus(value) {
  if (!value) {
    return "Unknown";
  }

  return String(value)
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatSignedQuantity(value) {
  const amount = Number(value || 0);

  if (amount > 0) {
    return `+${amount}`;
  }

  return String(amount);
}

function getInventoryStatusTone(status) {
  const normalizedStatus = String(status || "").toUpperCase();

  if (normalizedStatus === "OUT_OF_STOCK") {
    return "negative";
  }

  if (normalizedStatus === "LOW_STOCK") {
    return "warning";
  }

  if (normalizedStatus === "AVAILABLE") {
    return "positive";
  }

  return "neutral";
}

function formatDate(value) {
  if (!value) {
    return "No date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No date";
  }

  return date.toLocaleString();
}

function formatDateFilterValue(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("en-CA");
}

function matchesDateRange(value, dateFrom, dateTo) {
  if (!dateFrom && !dateTo) {
    return true;
  }

  if (!value) {
    return false;
  }

  const movementDate = new Date(value);
  if (Number.isNaN(movementDate.getTime())) {
    return false;
  }

  const movementDateKey = formatDateFilterValue(movementDate);

  if (dateFrom && movementDateKey < dateFrom) {
    return false;
  }

  if (dateTo && movementDateKey > dateTo) {
    return false;
  }

  return true;
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(value || 0));
}

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "N/A";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function normalizeWarehouseProducts(payload) {
  if (Array.isArray(payload?.products)) {
    return payload.products;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function normalizeTopLevelCollection(payload, collectionKey) {
  if (Array.isArray(payload?.[collectionKey])) {
    return payload[collectionKey];
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function normalizeDetailCollection(payload, collectionKey) {
  if (Array.isArray(payload?.[collectionKey])) {
    return payload[collectionKey];
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function matchesSearch(searchTerm, fields) {
  const normalizedSearch = String(searchTerm || "").trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return fields.some((field) => String(field || "").toLowerCase().includes(normalizedSearch));
}

function TableEmptyState({ title, description }) {
  return (
    <div className="manager-empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

const ManagerDashboardPage = ({ activeSection = "overview" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const timeoutRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [warehouseForm, setWarehouseForm] = useState(EMPTY_WAREHOUSE_FORM);
  const [editingWarehouseId, setEditingWarehouseId] = useState(null);
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [isSavingWarehouse, setIsSavingWarehouse] = useState(false);
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState("");
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState("all");
  const [isExportingInventory, setIsExportingInventory] = useState(false);
  const [statusUpdateKey, setStatusUpdateKey] = useState("");
  const [inventoryMovementSearchTerm, setInventoryMovementSearchTerm] = useState("");
  const [inventoryMovementDateFrom, setInventoryMovementDateFrom] = useState("");
  const [inventoryMovementDateTo, setInventoryMovementDateTo] = useState("");
  const [inventoryMovementPage, setInventoryMovementPage] = useState(1);
  const [salesOrderSearchTerm, setSalesOrderSearchTerm] = useState("");
  const [salesOrderStatusFilter, setSalesOrderStatusFilter] = useState("pending_stock_check");
  const [purchaseRequestSearchTerm, setPurchaseRequestSearchTerm] = useState("");
  const [purchaseOrderSearchTerm, setPurchaseOrderSearchTerm] = useState("");
  const [goodsReceiptSearchTerm, setGoodsReceiptSearchTerm] = useState("");
  const [detailDialog, setDetailDialog] = useState({
    isOpen: false,
    isLoading: false,
    title: "",
    subtitle: "",
    status: "",
    error: "",
    items: [],
    config: null,
  });
  const [dashboardData, setDashboardData] = useState({
    categories: [],
    warehouses: [],
    warehouseProducts: {},
    suppliers: [],
    products: [],
    inventories: [],
    inventoryMovements: [],
    salesOrders: [],
    purchaseRequests: [],
    purchaseOrders: [],
    goodsReceipts: [],
    inventorySummary: {
      totalQuantityOnHand: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    },
  });

  const movementScope = useMemo(() => {
    const params = new URLSearchParams(location.search);

    return {
      warehouseId: params.get("warehouseId"),
      warehouseName: params.get("warehouseName") || "",
      productId: params.get("productId"),
      productName: params.get("productName") || "",
    };
  }, [location.search]);

  useEffect(() => {
    loadDashboardData();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
    // `loadDashboardData` is intentionally invoked once on mount for the manager shell.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadDashboardData() {
    setIsLoading(true);

    const [
      categoryResult,
      warehouseResult,
      supplierResult,
      productResult,
      inventoryResult,
      summaryResult,
      movementResult,
      salesResult,
      purchaseRequestResult,
      purchaseResult,
      receiptResult,
    ] = await Promise.allSettled([
      ApiService.getAllCategory(),
      ApiService.getAllWarehouses(),
      ApiService.getAllSuppliers(),
      ApiService.getAllProducts(),
      ApiService.getAllInventories(),
      ApiService.getInventorySummary(),
      ApiService.getInventoryMovements(),
      ApiService.getAllSalesOrders({ page: 0, size: 24 }),
      ApiService.getAllPurchaseRequests({ page: 0, size: 24 }),
      ApiService.getAllPurchaseOrders({ page: 0, size: 24 }),
      ApiService.getAllStockInwards(),
    ]);

    const rejectedCalls = [
      categoryResult,
      warehouseResult,
      supplierResult,
      productResult,
      inventoryResult,
      summaryResult,
      movementResult,
      salesResult,
      purchaseRequestResult,
      purchaseResult,
      receiptResult,
    ].filter((result) => result.status === "rejected");

    if (rejectedCalls.length) {
      showMessage("Some warehouse manager data could not be loaded.");
    }

    let warehouseProducts = {};

    if (warehouseResult.status === "fulfilled") {
      const warehouseList = warehouseResult.value?.warehouses || [];
      const warehouseProductResults = await Promise.allSettled(
        warehouseList.map(async (warehouse) => {
          const response = await ApiService.getProductsByWarehouse(warehouse.id);
          return {
            warehouseId: warehouse.id,
            products: normalizeWarehouseProducts(response),
          };
        })
      );

      warehouseProducts = warehouseProductResults.reduce((accumulator, result) => {
        if (result.status === "fulfilled") {
          accumulator[result.value.warehouseId] = result.value.products;
        }

        return accumulator;
      }, {});
    }

    const inventorySummary =
      summaryResult.status === "fulfilled"
        ? {
            totalQuantityOnHand:
              Number(
                summaryResult.value?.summary?.totalQuantityOnHand ??
                  summaryResult.value?.data?.totalQuantityOnHand ??
                  summaryResult.value?.meta?.totalQuantityOnHand ??
                  0
              ) || 0,
            lowStockCount:
              Number(
                summaryResult.value?.summary?.lowStockCount ??
                  summaryResult.value?.data?.lowStockCount ??
                  summaryResult.value?.meta?.lowStockCount ??
                  0
              ) || 0,
            outOfStockCount:
              Number(
                summaryResult.value?.summary?.outOfStockCount ??
                  summaryResult.value?.data?.outOfStockCount ??
                  summaryResult.value?.meta?.outOfStockCount ??
                  0
              ) || 0,
          }
        : {
            totalQuantityOnHand: 0,
            lowStockCount: 0,
            outOfStockCount: 0,
          };

    setDashboardData({
      categories:
        categoryResult.status === "fulfilled" ? categoryResult.value?.categories || [] : [],
      warehouses:
        warehouseResult.status === "fulfilled"
          ? warehouseResult.value?.warehouses || []
          : [],
      warehouseProducts,
      suppliers:
        supplierResult.status === "fulfilled" ? supplierResult.value?.suppliers || [] : [],
      products: productResult.status === "fulfilled" ? productResult.value?.products || [] : [],
      inventories:
        inventoryResult.status === "fulfilled"
          ? inventoryResult.value?.inventories || []
          : [],
      inventoryMovements:
        movementResult.status === "fulfilled"
          ? normalizeTopLevelCollection(movementResult.value, "inventoryMovements")
          : [],
      salesOrders:
        salesResult.status === "fulfilled" ? salesResult.value?.salesOrders || [] : [],
      purchaseRequests:
        purchaseRequestResult.status === "fulfilled"
          ? purchaseRequestResult.value?.purchaseRequests || []
          : [],
      purchaseOrders:
        purchaseResult.status === "fulfilled"
          ? purchaseResult.value?.purchaseOrders || []
          : [],
      goodsReceipts:
        receiptResult.status === "fulfilled"
          ? normalizeTopLevelCollection(receiptResult.value, "stockInwards")
          : [],
      inventorySummary,
    });

    setIsLoading(false);
  }

  function showMessage(nextMessage) {
    setMessage(nextMessage);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setMessage("");
    }, 4000);
  }

  function resetWarehouseForm() {
    setWarehouseForm(EMPTY_WAREHOUSE_FORM);
    setEditingWarehouseId(null);
    setShowWarehouseForm(false);
  }

  function handleWarehouseFormChange({ target: { name, value } }) {
    setWarehouseForm((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
  }

  const {
    warehouses,
    warehouseProducts,
    inventories,
    inventoryMovements,
    salesOrders,
    purchaseRequests,
    purchaseOrders,
    goodsReceipts,
    inventorySummary,
  } = dashboardData;

  const warehouseInsights = useMemo(() => {
    const byWarehouse = inventories.reduce((accumulator, inventory) => {
      const warehouseId = inventory?.warehouseId ?? "unassigned";
      const currentEntry = accumulator.get(warehouseId) || {
        skuCount: 0,
        quantityOnHand: 0,
        lowStockCount: 0,
      };

      currentEntry.skuCount += 1;
      currentEntry.quantityOnHand += Number(inventory?.quantityOnHand || 0);

      if (
        Number(inventory?.quantityOnHand || 0) <= Number(inventory?.lowStockThreshold || 0)
      ) {
        currentEntry.lowStockCount += 1;
      }

      accumulator.set(warehouseId, currentEntry);
      return accumulator;
    }, new Map());

    return warehouses.map((warehouse, index) => {
      const insight = byWarehouse.get(warehouse?.id) || {
        skuCount: 0,
        quantityOnHand: 0,
        lowStockCount: 0,
      };
      const fallbackProducts = Array.isArray(warehouseProducts?.[warehouse?.id])
        ? warehouseProducts[warehouse.id]
        : Array.isArray(warehouse?.products)
          ? warehouse.products
          : [];
      const fallbackSkuCount = fallbackProducts.length;
      const fallbackQuantityOnHand = fallbackProducts.reduce(
        (sum, product) => sum + Number(product?.stockQuantity || 0),
        0
      );

      return {
        id: warehouse?.id ?? `warehouse-${index}`,
        name: warehouse?.name || `Warehouse ${index + 1}`,
        address: warehouse?.address || "Address unavailable",
        skuCount: insight.skuCount || fallbackSkuCount,
        quantityOnHand: insight.quantityOnHand || fallbackQuantityOnHand,
        lowStockCount: insight.lowStockCount,
        products: fallbackProducts,
      };
    });
  }, [inventories, warehouseProducts, warehouses]);

  const lowStockItems = useMemo(
    () =>
      inventories
        .filter(
          (inventory) =>
            Number(inventory?.quantityOnHand || 0) <= Number(inventory?.lowStockThreshold || 0)
        )
        .sort(
          (left, right) =>
            Number(left?.quantityOnHand || 0) - Number(right?.quantityOnHand || 0)
        )
        .slice(0, 6),
    [inventories]
  );

  const recentActivity = useMemo(() => {
    const allActivity = [
      ...salesOrders.map((order) => ({
        id: `sales-${order.id}`,
        type: "Sales order",
        title: order.orderCode || `Sales order #${order.id}`,
        subtitle: order.customerName || "Customer not assigned",
        date: order.createdAt || order.orderDate,
        status: formatStatus(order.status),
      })),
      ...purchaseRequests.map((request) => ({
        id: `request-${request.id}`,
        type: "Purchase request",
        title: request.requestCode || `Purchase request #${request.id}`,
        subtitle: request.warehouseName || "Warehouse not assigned",
        date: request.updatedAt || request.createdAt || request.requestDate,
        status: formatStatus(request.status),
      })),
      ...purchaseOrders.map((order) => ({
        id: `purchase-${order.id}`,
        type: "Purchase order",
        title: order.orderCode || `Purchase order #${order.id}`,
        subtitle: order.supplierName || "Supplier not assigned",
        date: order.createdAt || order.orderDate,
        status: formatStatus(order.status),
      })),
      ...goodsReceipts.map((receipt) => ({
        id: `receipt-${receipt.stockInwardId}`,
        type: "Stock inward",
        title: receipt.inwardCode || `Receipt #${receipt.stockInwardId}`,
        subtitle: receipt.warehouseName || "Warehouse not assigned",
        date: receipt.createdAt || receipt.inwardDate,
        status: formatStatus(receipt.status),
      })),
    ];

    return allActivity
      .sort((left, right) => new Date(right.date || 0) - new Date(left.date || 0))
      .slice(0, 7);
  }, [goodsReceipts, purchaseOrders, purchaseRequests, salesOrders]);

  const filteredWarehouseInsights = useMemo(
    () =>
      warehouseInsights.filter((warehouse) =>
        matchesSearch(warehouseSearchTerm, [warehouse.id, warehouse.name, warehouse.address])
      ),
    [warehouseInsights, warehouseSearchTerm]
  );

  const filteredInventories = useMemo(
    () =>
      inventories.filter((inventory) =>
        matchesSearch(inventorySearchTerm, [
          inventory.productName,
          inventory.productSku,
          inventory.warehouseName,
          inventory.status,
        ]) &&
        (inventoryStatusFilter === "all" ||
          String(inventory?.status || "").toUpperCase().replace(/\s+/g, "_") ===
            inventoryStatusFilter)
      ),
    [inventories, inventorySearchTerm, inventoryStatusFilter]
  );

  const filteredInventoryMovements = useMemo(
    () =>
      inventoryMovements.filter((movement) =>
        (!movementScope.warehouseId ||
          String(movement?.warehouseId ?? "") === String(movementScope.warehouseId)) &&
        (!movementScope.productId ||
          String(movement?.productId ?? "") === String(movementScope.productId)) &&
        matchesDateRange(
          movement.createdAt,
          inventoryMovementDateFrom,
          inventoryMovementDateTo
        ) &&
        matchesSearch(inventoryMovementSearchTerm, [
          movement.productName,
          movement.productSku,
          movement.warehouseName,
          movement.actorUserName,
          movement.movementType,
          movement.referenceType,
          movement.referenceCode,
          movement.referenceId,
          movement.note,
          formatDate(movement.createdAt),
          formatDateFilterValue(movement.createdAt),
        ])
      ),
    [
      inventoryMovementDateFrom,
      inventoryMovementDateTo,
      inventoryMovementSearchTerm,
      inventoryMovements,
      movementScope.productId,
      movementScope.warehouseId,
    ]
  );

  const inventoryMovementTotalPages = Math.max(
    1,
    Math.ceil(filteredInventoryMovements.length / INVENTORY_MOVEMENT_ITEMS_PER_PAGE)
  );

  const paginatedInventoryMovements = useMemo(
    () =>
      filteredInventoryMovements.slice(
        (inventoryMovementPage - 1) * INVENTORY_MOVEMENT_ITEMS_PER_PAGE,
        inventoryMovementPage * INVENTORY_MOVEMENT_ITEMS_PER_PAGE
      ),
    [filteredInventoryMovements, inventoryMovementPage]
  );

  useEffect(() => {
    setInventoryMovementPage(1);
  }, [
    inventoryMovementSearchTerm,
    inventoryMovementDateFrom,
    inventoryMovementDateTo,
    movementScope.productId,
    movementScope.warehouseId,
  ]);

  useEffect(() => {
    if (inventoryMovementPage > inventoryMovementTotalPages) {
      setInventoryMovementPage(inventoryMovementTotalPages);
    }
  }, [inventoryMovementPage, inventoryMovementTotalPages]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Warehouses",
        value: warehouses.length,
        helper: "Active locations",
      },
      {
        label: "Units on hand",
        value: inventorySummary.totalQuantityOnHand,
        helper: "Across all warehouses",
      },
      {
        label: "Low-stock alerts",
        value: inventorySummary.lowStockCount,
        helper: "Need attention",
      },
      {
        label: "Pending approvals",
        value:
          salesOrders.filter((order) => order?.status === "pending_stock_check").length +
          purchaseRequests.filter((request) => request?.status === "pending_approval").length +
          goodsReceipts.filter((receipt) => receipt?.status === "DRAFT").length,
        helper: "Manager action required",
      },
    ],
    [
      goodsReceipts,
      inventorySummary.lowStockCount,
      inventorySummary.totalQuantityOnHand,
      purchaseRequests,
      salesOrders,
      warehouses.length,
    ]
  );

  const activeCopy = SECTION_COPY[activeSection] || SECTION_COPY.overview;

  const salesOrderRows = useMemo(
    () =>
      salesOrders.map((order) => ({
        id: order.id,
        code: order.orderCode || `Sales order #${order.id}`,
        partner: order.customerName || "Customer not assigned",
        warehouse:
          order.warehouseName ||
          order.orderDetails?.[0]?.warehouseName ||
          order.orderDetails?.[0]?.warehouseId ||
          "Mixed",
        totalItems: order.totalItems || 0,
        rawStatus: order.status,
        status: formatStatus(order.status),
        updatedAt: order.updatedAt || order.createdAt || order.orderDate,
      })),
    [salesOrders]
  );

  const purchaseOrderRows = useMemo(
    () =>
      purchaseOrders.map((order) => ({
        id: order.id,
        code: order.orderCode || `Purchase order #${order.id}`,
        partner: order.supplierName || "Supplier not assigned",
        warehouse: order.warehouseName || "Unassigned",
        totalItems: order.totalItems || 0,
        rawStatus: order.status,
        status: formatStatus(order.status),
        updatedAt: order.updatedAt || order.createdAt || order.orderDate,
      })),
    [purchaseOrders]
  );

  const purchaseRequestRows = useMemo(
    () =>
      purchaseRequests.map((request) => ({
        id: request.id,
        code: request.requestCode || `Purchase request #${request.id}`,
        partner: request.requesterName || "Requester not assigned",
        warehouse: request.warehouseName || "Unassigned",
        totalItems: request.totalItems || 0,
        rawStatus: request.status,
        status: formatStatus(request.status),
        updatedAt: request.updatedAt || request.createdAt || request.requestDate,
      })),
    [purchaseRequests]
  );

  const goodsReceiptRows = useMemo(
    () =>
      goodsReceipts.map((receipt) => ({
        id: receipt.stockInwardId,
        code: receipt.inwardCode || `Receipt #${receipt.stockInwardId}`,
        partner: receipt.supplierName || "Supplier not assigned",
        warehouse: receipt.warehouseName || "Unassigned",
        totalItems: receipt.totalReceivedQuantity || receipt.totalItems || 0,
        rawStatus: receipt.status,
        status: formatStatus(receipt.status),
        updatedAt: receipt.createdAt || receipt.inwardDate,
      })),
    [goodsReceipts]
  );

  const approvalQueueRows = useMemo(() => {
    const pendingSales = salesOrderRows
      .filter((row) => String(row.rawStatus || "") === "pending_stock_check")
      .map((row) => ({
        ...row,
        queueKey: `sales-${row.id}`,
        kind: "salesOrder",
        typeLabel: "Sales order",
      }));

    const pendingRequests = purchaseRequestRows
      .filter((row) => String(row.rawStatus || "") === "pending_approval")
      .map((row) => ({
        ...row,
        queueKey: `request-${row.id}`,
        kind: "purchaseRequest",
        typeLabel: "Purchase request",
      }));

    const pendingReceipts = goodsReceiptRows
      .filter((row) => String(row.rawStatus || "") === "DRAFT")
      .map((row) => ({
        ...row,
        queueKey: `receipt-${row.id}`,
        kind: "stockInward",
        typeLabel: "Stock inward",
      }));

    return [...pendingSales, ...pendingRequests, ...pendingReceipts]
      .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0))
      .slice(0, 6);
  }, [goodsReceiptRows, purchaseRequestRows, salesOrderRows]);

  const filteredPurchaseRequestRows = useMemo(
    () =>
      purchaseRequestRows.filter((row) =>
        matchesSearch(purchaseRequestSearchTerm, [
          row.code,
          row.partner,
          row.warehouse,
          row.status,
        ])
      ),
    [purchaseRequestRows, purchaseRequestSearchTerm]
  );

  const filteredSalesOrderRows = useMemo(
    () =>
      salesOrderRows.filter((row) => {
        const matchesStatus =
          salesOrderStatusFilter === "all" ||
          String(row.rawStatus || "") === salesOrderStatusFilter;

        return matchesStatus && matchesSearch(salesOrderSearchTerm, [
          row.code,
          row.partner,
          row.warehouse,
          row.status,
        ]);
      }),
    [salesOrderRows, salesOrderSearchTerm, salesOrderStatusFilter]
  );

  const filteredPurchaseOrderRows = useMemo(
    () =>
      purchaseOrderRows.filter((row) =>
        matchesSearch(purchaseOrderSearchTerm, [
          row.code,
          row.partner,
          row.warehouse,
          row.status,
        ])
      ),
    [purchaseOrderRows, purchaseOrderSearchTerm]
  );

  const filteredGoodsReceiptRows = useMemo(
    () =>
      goodsReceiptRows.filter((row) =>
        matchesSearch(goodsReceiptSearchTerm, [
          row.code,
          row.partner,
          row.warehouse,
          row.status,
        ])
      ),
    [goodsReceiptRows, goodsReceiptSearchTerm]
  );

  function getStatusActionKey(kind, rowId, nextStatus) {
    return `${kind}:${rowId}:${nextStatus}`;
  }

  function getNextStatusOptions(kind, rawStatus) {
    const transitions = ORDER_STATUS_TRANSITIONS[kind] || {};
    return transitions[String(rawStatus || "")] || [];
  }

  function getActionButtons(kind, rawStatus) {
    const actions = ORDER_ACTIONS[kind] || {};
    return actions[String(rawStatus || "")] || [];
  }

  function openCreateWarehouseForm() {
    setWarehouseForm(EMPTY_WAREHOUSE_FORM);
    setEditingWarehouseId(null);
    setShowWarehouseForm(true);
  }

  function openWarehouseProducts(warehouse) {
    const params = new URLSearchParams({
      warehouseId: String(warehouse.id),
      warehouseName: warehouse.name || "Warehouse",
    });
    navigate(`${PATHS.product}?${params.toString()}`);
  }

  function openWarehouseMovements(warehouse) {
    const params = new URLSearchParams({
      warehouseId: String(warehouse.id),
      warehouseName: warehouse.name || "Warehouse",
    });
    navigate(`${PATHS.dashboardInventoryMovements}?${params.toString()}`);
  }

  function openProductMovements(inventory) {
    const params = new URLSearchParams({
      warehouseId: String(inventory.warehouseId),
      warehouseName: inventory.warehouseName || "Warehouse",
      productId: String(inventory.productId),
      productName: inventory.productName || "Product",
    });
    navigate(`${PATHS.dashboardInventoryMovements}?${params.toString()}`);
  }

  function clearMovementScope() {
    navigate(PATHS.dashboardInventoryMovements);
  }

  async function handleExportInventories() {
    setIsExportingInventory(true);

    try {
      const blob = await ApiService.exportInventories({
        productName: inventorySearchTerm || undefined,
        stockStatus: inventoryStatusFilter !== "all" ? inventoryStatusFilter : undefined,
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "inventories.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      showMessage(error.response?.data?.message || "Unable to export inventory data.");
    } finally {
      setIsExportingInventory(false);
    }
  }

  function closeDetailDialog() {
    setDetailDialog({
      isOpen: false,
      isLoading: false,
      title: "",
      subtitle: "",
      status: "",
      error: "",
      items: [],
      config: null,
    });
  }

  async function openOrderDetails(kind, row) {
    const config = ORDER_DETAIL_CONFIG[kind];

    if (!config) {
      return;
    }

    setDetailDialog({
      isOpen: true,
      isLoading: true,
      title: row.code,
      subtitle: `${row.partner} • ${row.warehouse}`,
      status: row.status,
      error: "",
      items: [],
      config,
    });

    try {
      const response = await config.loader(row.id);
      const items = normalizeDetailCollection(response, config.key);

      setDetailDialog((currentValue) => ({
        ...currentValue,
        isLoading: false,
        items,
      }));
    } catch (error) {
      setDetailDialog((currentValue) => ({
        ...currentValue,
        isLoading: false,
        error:
          error.response?.data?.message ||
          `Unable to load ${config.typeLabel.toLowerCase()}.`,
      }));
    }
  }

  async function handleUpdateOrderStatus(kind, row, nextStatus) {
    if (!nextStatus) {
      showMessage("No valid status transition is available for this document.");
      return;
    }

    const actionKey = getStatusActionKey(kind, row.id, nextStatus);
    setStatusUpdateKey(actionKey);

    try {
      if (kind === "salesOrder") {
        await ApiService.updateSalesOrderStatus(row.id, nextStatus);
      } else if (kind === "purchaseRequest") {
        await ApiService.updatePurchaseRequestStatus(row.id, nextStatus);
      } else if (kind === "purchaseOrder") {
        await ApiService.updatePurchaseOrderStatus(row.id, nextStatus);
      } else if (kind === "stockInward") {
        await ApiService.updateStockInwardStatus(row.id, nextStatus);
      } else {
        throw new Error("Unsupported document type for status updates.");
      }
      await loadDashboardData();
      showMessage(`Status updated to ${formatStatus(nextStatus)}.`);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to update the document status."
      );
    } finally {
      setStatusUpdateKey("");
    }
  }

  function renderOverview() {
    return (
      <>
        <section className="manager-metric-grid">
          {summaryCards.map((card) => (
            <article key={card.label} className="manager-metric-card">
              <span>{card.label}</span>
              <strong>{formatCompactNumber(card.value)}</strong>
              <p>{card.helper}</p>
            </article>
          ))}
        </section>

        <section className="manager-two-column-grid manager-overview-grid">
          <article className="manager-panel">
            <div className="manager-panel-heading">
              <div>
                <span className="manager-panel-label">Approval queue</span>
                <h2>Documents waiting for manager approval</h2>
              </div>
            </div>

            <div className="manager-approval-summary-grid">
              <button
                type="button"
                className="manager-approval-summary-card"
                onClick={() => navigate(PATHS.dashboardSalesOrders)}
              >
                <span>Sales orders</span>
                <strong>
                  {
                    salesOrderRows.filter(
                      (row) => String(row.rawStatus || "") === "pending_stock_check"
                    ).length
                  }
                </strong>
                <small>Pending stock check approvals</small>
              </button>

              <button
                type="button"
                className="manager-approval-summary-card"
                onClick={() => navigate(PATHS.dashboardPurchaseRequests)}
              >
                <span>Purchase requests</span>
                <strong>
                  {
                    purchaseRequestRows.filter(
                      (row) => String(row.rawStatus || "") === "pending_approval"
                    ).length
                  }
                </strong>
                <small>Requests waiting for manager approval</small>
              </button>

              <button
                type="button"
                className="manager-approval-summary-card"
                onClick={() => navigate(PATHS.dashboardGoodsReceipts)}
              >
                <span>Stock inwards</span>
                <strong>
                  {goodsReceiptRows.filter((row) => String(row.rawStatus || "") === "DRAFT").length}
                </strong>
                <small>Draft inward documents to review</small>
              </button>
            </div>

            {approvalQueueRows.length ? (
              <div className="manager-list">
                {approvalQueueRows.map((row) => {
                  const actionButtons = getActionButtons(row.kind, row.rawStatus);

                  return (
                    <div key={row.queueKey} className="manager-approval-row">
                      <div className="manager-approval-copy">
                        <span className="manager-panel-label">{row.typeLabel}</span>
                        <strong>{row.code}</strong>
                        <p>
                          {row.partner} - {row.warehouse}
                        </p>
                        <small>
                          {row.status} - {formatDate(row.updatedAt)}
                        </small>
                      </div>

                      <div className="manager-approval-actions">
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => navigate(APPROVAL_SECTION_BY_KIND[row.kind])}
                        >
                          Open Section
                        </button>

                        <button
                          type="button"
                          className="info-button"
                          onClick={() => openOrderDetails(row.kind, row)}
                        >
                          View Details
                        </button>

                        {actionButtons.map((actionButton) => {
                          const isUpdatingThisRow =
                            statusUpdateKey ===
                            getStatusActionKey(row.kind, row.id, actionButton.value);

                          return (
                            <button
                              key={actionButton.value}
                              type="button"
                              className={actionButton.className}
                              onClick={() =>
                                handleUpdateOrderStatus(row.kind, row, actionButton.value)
                              }
                              disabled={isUpdatingThisRow}
                            >
                              {isUpdatingThisRow ? "Updating..." : actionButton.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <TableEmptyState
                title="No approvals pending"
                description="Sales orders, purchase orders, and stock inwards that need manager review will appear here."
              />
            )}
          </article>

          <article className="manager-panel">
            <div className="manager-panel-heading">
              <div>
                <span className="manager-panel-label">Priority items</span>
                <h2>Low-stock watchlist</h2>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => navigate(PATHS.dashboardInventory)}
              >
                Inventory
              </button>
            </div>

            {lowStockItems.length ? (
              <div className="manager-list">
                {lowStockItems.slice(0, 5).map((inventory) => (
                  <div key={inventory.inventoryId} className="manager-list-row">
                    <div>
                      <strong>{inventory.productName || "Unnamed product"}</strong>
                      <p>
                        {inventory.productSku || "No SKU"} -{" "}
                        {inventory.warehouseName || "No warehouse"}
                      </p>
                    </div>
                    <div className="manager-row-metrics">
                      <span className="manager-status-badge manager-status-badge-warning">
                        {formatStatus(inventory.status)}
                      </span>
                      <strong>{inventory.quantityOnHand || 0}</strong>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <TableEmptyState
                title="No low-stock alerts"
                description="Products that need replenishment will appear here."
              />
            )}
          </article>
        </section>

        <section className="manager-panel">
          <div className="manager-panel-heading">
            <div>
              <span className="manager-panel-label">Recent activity</span>
              <h2>Latest warehouse operations</h2>
            </div>
            <button
              type="button"
              className="ghost-button"
              onClick={() => navigate(PATHS.dashboardInventoryMovements)}
            >
              Movements
            </button>
          </div>

          {recentActivity.length ? (
            <div className="manager-timeline">
              {recentActivity.slice(0, 5).map((item) => (
                <div key={item.id} className="manager-timeline-item">
                  <span className="manager-timeline-dot" />
                  <div>
                    <strong>{item.title}</strong>
                    <p>
                      {item.type} - {item.subtitle}
                    </p>
                    <small>
                      {item.status} - {formatDate(item.date)}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <TableEmptyState
              title="No recent activity"
              description="Sales orders, purchase orders, and stock inwards will appear here."
            />
          )}
        </section>
      </>
    );
  }

  function renderWarehouses() {
    return (
      <section className="manager-panel">
        <div className="manager-panel-heading">
          <div>
            <span className="manager-panel-label">Warehouse directory</span>
            <h2>Warehouse list</h2>
          </div>
        </div>

        <div className="manager-toolbar">
          <form
            className="manager-search-shell"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              className="manager-search-input"
              value={warehouseSearchTerm}
              onChange={(event) => setWarehouseSearchTerm(event.target.value)}
              placeholder="Search warehouses"
            />
            <button type="submit" className="ghost-button">
              Search
            </button>
          </form>

          <button type="button" onClick={openCreateWarehouseForm}>
            Add Warehouse
          </button>
        </div>

        {showWarehouseForm ? (
          <form className="manager-inline-form manager-inline-form-card" onSubmit={handleSaveWarehouse}>
            <div className="manager-panel-heading">
              <div>
                <span className="manager-panel-label">Warehouse form</span>
                <h2>{editingWarehouseId ? "Edit warehouse" : "Create warehouse"}</h2>
              </div>
            </div>

            <label>
              Warehouse name
              <input
                name="name"
                value={warehouseForm.name}
                onChange={handleWarehouseFormChange}
                placeholder="Main warehouse"
              />
            </label>
            <label>
              Address
              <input
                name="address"
                value={warehouseForm.address}
                onChange={handleWarehouseFormChange}
                placeholder="Warehouse address"
              />
            </label>
            <div className="manager-form-actions">
              <button type="submit" disabled={isSavingWarehouse}>
                {isSavingWarehouse
                  ? "Saving..."
                  : editingWarehouseId
                    ? "Update Warehouse"
                    : "Create Warehouse"}
              </button>
              <button type="button" className="ghost-button" onClick={resetWarehouseForm}>
                Cancel
              </button>
              {editingWarehouseId ? (
                <button
                  type="button"
                  className="danger-button"
                  onClick={() => handleDeleteWarehouse(editingWarehouseId)}
                >
                  Delete Warehouse
                </button>
              ) : null}
            </div>
          </form>
        ) : null}

        {filteredWarehouseInsights.length ? (
          <div className="manager-table-shell">
            <table className="manager-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Warehouse Name</th>
                  <th>Address</th>
                  <th>Products</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWarehouseInsights.map((warehouse) => (
                  <tr key={warehouse.id}>
                    <td>{warehouse.id}</td>
                    <td>
                      <strong>{warehouse.name}</strong>
                      <span>{warehouse.lowStockCount} low-stock alerts</span>
                    </td>
                    <td>{warehouse.address}</td>
                    <td>{warehouse.products.length}</td>
                    <td>
                      <div className="manager-table-actions">
                        <button
                          type="button"
                          className="warn-button"
                          onClick={() => handleEditWarehouse(warehouse)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="info-button"
                          onClick={() => openWarehouseProducts(warehouse)}
                        >
                          Products
                        </button>
                        <button
                          type="button"
                          className="ghost-button"
                          onClick={() => openWarehouseMovements(warehouse)}
                        >
                          View Movements
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <TableEmptyState
            title="No warehouses found"
            description="Try another search term or create a new warehouse."
          />
        )}
      </section>
    );
  }

  function renderInventory() {
    return (
      <section className="manager-panel">
        <div className="manager-panel-heading">
          <div>
            <span className="manager-panel-label">Inventory watchlist</span>
            <h2>Current stock positions</h2>
          </div>
          <button type="button" className="info-button" onClick={handleExportInventories}>
            {isExportingInventory ? "Exporting..." : "Export Excel"}
          </button>
        </div>

        <div className="manager-toolbar">
          <input
            className="manager-search-input manager-search-input-wide"
            value={inventorySearchTerm}
            onChange={(event) => setInventorySearchTerm(event.target.value)}
            placeholder="Search product, SKU, warehouse, or status"
          />
          <select
            className="manager-search-input"
            value={inventoryStatusFilter}
            onChange={(event) => setInventoryStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="LOW_STOCK">Low stock</option>
            <option value="OUT_OF_STOCK">Out of stock</option>
            <option value="UNKNOWN">Unknown</option>
          </select>
        </div>

        <div className="manager-summary-strip">
          <div>
            <span>Total units</span>
            <strong>{formatCompactNumber(inventorySummary.totalQuantityOnHand)}</strong>
          </div>
          <div>
            <span>Low stock</span>
            <strong>{inventorySummary.lowStockCount}</strong>
          </div>
          <div>
            <span>Out of stock</span>
            <strong>{inventorySummary.outOfStockCount}</strong>
          </div>
        </div>

        {filteredInventories.length ? (
          <div className="manager-table-shell">
            <table className="manager-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Warehouse</th>
                  <th>On hand</th>
                  <th>Threshold</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventories.slice(0, 12).map((inventory) => (
                  <tr key={inventory.inventoryId}>
                    <td>
                      <strong>{inventory.productName || "Unnamed product"}</strong>
                      <span>{inventory.productSku || "No SKU"}</span>
                    </td>
                    <td>{inventory.warehouseName || "Unassigned"}</td>
                    <td
                      className={`manager-quantity-cell manager-quantity-cell-${getInventoryStatusTone(
                        inventory.status
                      )}`}
                    >
                      {inventory.quantityOnHand || 0}
                    </td>
                    <td>{inventory.lowStockThreshold || 0}</td>
                    <td>
                      <span
                        className={`manager-status-badge manager-status-badge-${getInventoryStatusTone(
                          inventory.status
                        )}`}
                      >
                        {formatStatus(inventory.status)}
                      </span>
                    </td>
                    <td>
                      <div className="manager-table-actions">
                        <button
                          type="button"
                          className="info-button"
                          onClick={() => openProductMovements(inventory)}
                        >
                          View Movements
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <TableEmptyState
            title="No inventory matches"
            description="Try another search term to find a product, SKU, warehouse, or status."
          />
        )}
      </section>
    );
  }

  function renderInventoryMovements() {
    const hasMovementScope = movementScope.warehouseId || movementScope.productId;
    const scopeSummary = [
      movementScope.warehouseName ? `Warehouse: ${movementScope.warehouseName}` : null,
      movementScope.productName ? `Product: ${movementScope.productName}` : null,
    ]
      .filter(Boolean)
      .join(" • ");

    return (
      <section className="manager-panel">
        <div className="manager-panel-heading">
          <div>
            <span className="manager-panel-label">Inventory movements</span>
            <h2>Recent stock adjustments</h2>
            {scopeSummary ? (
              <p className="manager-panel-description">{scopeSummary}</p>
            ) : null}
          </div>
          {hasMovementScope ? (
            <button type="button" className="ghost-button" onClick={clearMovementScope}>
              Clear Context
            </button>
          ) : null}
        </div>

        <div className="manager-toolbar">
          <input
            className="manager-search-input manager-search-input-wide"
            value={inventoryMovementSearchTerm}
            onChange={(event) => setInventoryMovementSearchTerm(event.target.value)}
            placeholder="Search product, warehouse, actor, reference, movement type, or date"
          />
          <label className="manager-date-filter">
            <span>From</span>
            <input
              type="date"
              className="manager-search-input"
              value={inventoryMovementDateFrom}
              onChange={(event) => setInventoryMovementDateFrom(event.target.value)}
              aria-label="Inventory movement date from"
            />
          </label>
          <label className="manager-date-filter">
            <span>To</span>
            <input
              type="date"
              className="manager-search-input"
              value={inventoryMovementDateTo}
              onChange={(event) => setInventoryMovementDateTo(event.target.value)}
              aria-label="Inventory movement date to"
            />
          </label>
        </div>

        {filteredInventoryMovements.length ? (
          <>
            <div className="manager-table-shell">
              <table className="manager-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Time</th>
                    <th>Product</th>
                    <th>Warehouse</th>
                    <th>Movement</th>
                    <th>Reference</th>
                    <th>Actor</th>
                    <th>Before</th>
                    <th>Delta</th>
                    <th>After</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedInventoryMovements.map((movement, index) => (
                    <tr key={movement.movementId}>
                      <td>
                        {(inventoryMovementPage - 1) * INVENTORY_MOVEMENT_ITEMS_PER_PAGE + index + 1}
                      </td>
                      <td>{formatDate(movement.createdAt)}</td>
                      <td>
                        <strong>{movement.productName || "Unnamed product"}</strong>
                        <span>{movement.productSku || "No SKU"}</span>
                      </td>
                      <td>{movement.warehouseName || "Unassigned"}</td>
                      <td>
                        <span
                          className={`manager-status-badge ${
                            Number(movement.quantityDelta || 0) >= 0
                              ? "manager-status-badge-positive"
                              : "manager-status-badge-negative"
                          }`}
                        >
                          {formatStatus(movement.movementType)}
                        </span>
                      </td>
                      <td>
                        <strong>{movement.referenceCode || movement.referenceId || "Manual"}</strong>
                        <span>{formatStatus(movement.referenceType) || "No reference type"}</span>
                      </td>
                      <td>{movement.actorUserName || "System"}</td>
                      <td>{movement.quantityBefore || 0}</td>
                      <td
                        className={
                          Number(movement.quantityDelta || 0) >= 0
                            ? "manager-delta-positive"
                            : "manager-delta-negative"
                        }
                      >
                        {formatSignedQuantity(movement.quantityDelta)}
                      </td>
                      <td>{movement.quantityAfter || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <PaginationComponent
              currentPage={inventoryMovementPage}
              totalPages={inventoryMovementTotalPages}
              onPageChange={setInventoryMovementPage}
            />
          </>
        ) : (
          <TableEmptyState
            title="No inventory movements found"
            description="Movement history will appear here after stock enters or leaves a warehouse."
          />
        )}
      </section>
    );
  }

  function renderOrders(
    title,
    rows,
    emptyTitle,
    emptyDescription,
    type,
    searchTerm,
    setSearchTerm,
    detailKind
  ) {
    return (
      <section className="manager-panel">
        <div className="manager-panel-heading">
          <div>
            <span className="manager-panel-label">{type}</span>
            <h2>{title}</h2>
          </div>
        </div>

        <div className="manager-toolbar">
          <input
            className="manager-search-input manager-search-input-wide"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={`Search ${title.toLowerCase()}`}
          />
          {detailKind === "salesOrder" ? (
            <select
              className="manager-filter-select"
              value={salesOrderStatusFilter}
              onChange={(event) => setSalesOrderStatusFilter(event.target.value)}
            >
              <option value="pending_stock_check">Pending Stock Check</option>
              <option value="awaiting_shipment">Awaiting Shipment</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="all">All Statuses</option>
            </select>
          ) : null}
        </div>

        {rows.length ? (
          <div className="manager-table-shell">
            <table className="manager-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Partner</th>
                  <th>Warehouse</th>
                  <th>Items</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const nextStatusOptions = getNextStatusOptions(detailKind, row.rawStatus);
                  const actionButtons = getActionButtons(detailKind, row.rawStatus);

                  return (
                    <tr key={row.id}>
                      <td>
                        <strong>{row.code}</strong>
                      </td>
                      <td>{row.partner}</td>
                      <td>{row.warehouse}</td>
                      <td>{row.totalItems}</td>
                      <td>
                        <span className="manager-status-badge">{row.status}</span>
                      </td>
                      <td>{formatDate(row.updatedAt)}</td>
                      <td>
                        <div className="manager-table-actions">
                          <button
                            type="button"
                            className="info-button"
                            onClick={() => openOrderDetails(detailKind, row)}
                          >
                            View Details
                          </button>

                          {actionButtons.length ? (
                            <div className="manager-status-action-group">
                              {actionButtons.map((actionButton) => {
                                const isUpdatingThisRow =
                                  statusUpdateKey ===
                                  getStatusActionKey(detailKind, row.id, actionButton.value);

                                return (
                                  <button
                                    key={actionButton.value}
                                    type="button"
                                    className={actionButton.className}
                                    onClick={() =>
                                      handleUpdateOrderStatus(
                                        detailKind,
                                        row,
                                        actionButton.value
                                      )
                                    }
                                    disabled={isUpdatingThisRow}
                                  >
                                    {isUpdatingThisRow ? "Updating..." : actionButton.label}
                                  </button>
                                );
                              })}
                            </div>
                          ) : nextStatusOptions.length ? (
                            <span className="manager-table-note">
                              Manager review is not available for {row.status.toLowerCase()}.
                            </span>
                          ) : (
                            <span className="manager-table-note">No more transitions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <TableEmptyState title={emptyTitle} description={emptyDescription} />
        )}
      </section>
    );
  }

  async function handleSaveWarehouse(event) {
    event.preventDefault();

    if (!warehouseForm.name.trim() || !warehouseForm.address.trim()) {
      showMessage("Warehouse name and address are required.");
      return;
    }

    setIsSavingWarehouse(true);

    try {
      if (editingWarehouseId) {
        await ApiService.updateWarehouse(editingWarehouseId, {
          name: warehouseForm.name.trim(),
          address: warehouseForm.address.trim(),
        });
        showMessage("Warehouse updated successfully.");
      } else {
        await ApiService.createWarehouse({
          name: warehouseForm.name.trim(),
          address: warehouseForm.address.trim(),
        });
        showMessage("Warehouse created successfully.");
      }

      resetWarehouseForm();
      setShowWarehouseForm(false);
      await loadDashboardData();
    } catch (error) {
      showMessage(error.response?.data?.message || `Error saving warehouse: ${error}`);
    } finally {
      setIsSavingWarehouse(false);
    }
  }

  function handleEditWarehouse(warehouse) {
    setEditingWarehouseId(warehouse.id);
    setWarehouseForm({
      name: warehouse.name || "",
      address: warehouse.address || "",
    });
    setShowWarehouseForm(true);
  }

  async function handleDeleteWarehouse(warehouseId) {
    if (!window.confirm("Are you sure you want to delete this warehouse?")) {
      return;
    }

    try {
      const response = await ApiService.deleteWarehouse(warehouseId);
      setDashboardData((currentValue) => {
        const nextWarehouseProducts = { ...currentValue.warehouseProducts };
        delete nextWarehouseProducts[warehouseId];

        return {
          ...currentValue,
          warehouses: currentValue.warehouses.filter(
            (warehouse) => warehouse.id !== warehouseId
          ),
          inventories: currentValue.inventories.filter(
            (inventory) => inventory.warehouseId !== warehouseId
          ),
          warehouseProducts: nextWarehouseProducts,
        };
      });
      showMessage(response?.message || "Warehouse deleted successfully.");
      resetWarehouseForm();
      await loadDashboardData();
    } catch (error) {
      showMessage(
        error.response?.data?.message || `Error deleting warehouse: ${error}`
      );
    }
  }

  function renderActiveSection() {
    if (activeSection === "warehouses") {
      return renderWarehouses();
    }

    if (activeSection === "inventory") {
      return renderInventory();
    }

    if (activeSection === "inventoryMovements") {
      return renderInventoryMovements();
    }

    if (activeSection === "salesOrders") {
      return renderOrders(
        "Sales orders for manager approval",
        filteredSalesOrderRows,
        "No sales orders found",
        "No sales orders match the current manager filter.",
        "Manager approval",
        salesOrderSearchTerm,
        setSalesOrderSearchTerm,
        "salesOrder"
      );
    }

    if (activeSection === "purchaseRequests") {
      return renderOrders(
        "Recent purchase requests",
        filteredPurchaseRequestRows,
        "No purchase requests found",
        "No warehouse staff purchase requests match the current search.",
        "Restock requests",
        purchaseRequestSearchTerm,
        setPurchaseRequestSearchTerm,
        "purchaseRequest"
      );
    }

    if (activeSection === "purchaseOrders") {
      return renderOrders(
        "Recent purchase orders",
        filteredPurchaseOrderRows,
        "No purchase orders found",
        "No purchase orders match the current search.",
        "Procurement",
        purchaseOrderSearchTerm,
        setPurchaseOrderSearchTerm,
        "purchaseOrder"
      );
    }

    if (activeSection === "goodsReceipts") {
      return renderOrders(
        "Recent stock inwards",
        filteredGoodsReceiptRows,
        "No stock inwards found",
        "No stock inward documents match the current search.",
        "Inbound",
        goodsReceiptSearchTerm,
        setGoodsReceiptSearchTerm,
        "stockInward"
      );
    }

    return renderOverview();
  }

  return (
    <MainLayout>
      <div className="manager-dashboard">
        {message && <div className="message">{message}</div>}

        <section className="manager-hero">
          <div className="manager-hero-copy">
            <span>{activeCopy.eyebrow}</span>
            <h1>{activeCopy.title}</h1>
            <p>{activeCopy.description}</p>
          </div>

          <div className="manager-hero-card">
            <span>Signed in as</span>
            <strong>Warehouse Manager</strong>
            <p>
              {formatCompactNumber(inventorySummary.totalQuantityOnHand)} units tracked across{" "}
              {warehouses.length || 0} warehouses.
            </p>
          </div>
        </section>

        {isLoading ? (
          <section className="manager-loading-grid" aria-label="Loading manager dashboard">
            <div className="manager-loading-card" />
            <div className="manager-loading-card" />
            <div className="manager-loading-card" />
          </section>
        ) : (
          renderActiveSection()
        )}

        {detailDialog.isOpen ? (
          <div
            className="manager-dialog-backdrop"
            role="presentation"
            onClick={closeDetailDialog}
          >
            <section
              className="manager-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="manager-detail-dialog-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="manager-panel-heading">
                <div>
                  <span className="manager-panel-label">
                    {detailDialog.config?.typeLabel || "Details"}
                  </span>
                  <h2 id="manager-detail-dialog-title">{detailDialog.title}</h2>
                  <p className="manager-panel-description">{detailDialog.subtitle}</p>
                </div>

                <div className="manager-form-actions">
                  {detailDialog.status ? (
                    <span className="manager-status-badge">{detailDialog.status}</span>
                  ) : null}
                  <button type="button" className="ghost-button" onClick={closeDetailDialog}>
                    Close
                  </button>
                </div>
              </div>

              {detailDialog.isLoading ? (
                <div className="manager-empty-state">
                  <strong>Loading details</strong>
                  <p>Fetching the latest line items for this document.</p>
                </div>
              ) : detailDialog.error ? (
                <div className="manager-empty-state">
                  <strong>Unable to load details</strong>
                  <p>{detailDialog.error}</p>
                </div>
              ) : detailDialog.items.length ? (
                <div className="manager-table-shell">
                  <table className="manager-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>{detailDialog.config?.quantityLabel || "Quantity"}</th>
                        <th>{detailDialog.config?.priceLabel || "Unit price"}</th>
                        <th>{detailDialog.config?.totalLabel || "Line total"}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailDialog.items.map((item, index) => {
                        const priceValue =
                          item?.[detailDialog.config?.priceKey] ??
                          item?.[detailDialog.config?.fallbackPriceKey];

                        return (
                          <tr
                            key={
                              item.id ??
                              item.inwardDetailId ??
                              item.productId ??
                              `${detailDialog.title}-${index}`
                            }
                          >
                            <td>
                              <strong>{item.productName || "Unnamed product"}</strong>
                              <span>{item.productSku || "No SKU"}</span>
                              {item.note ? <span>{item.note}</span> : null}
                            </td>
                            <td>{item?.[detailDialog.config?.quantityKey] ?? 0}</td>
                            <td>{formatCurrency(priceValue)}</td>
                            <td>
                              {formatCurrency(item?.[detailDialog.config?.totalKey])}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="manager-empty-state">
                  <strong>No line items found</strong>
                  <p>This document does not currently have any detail rows to display.</p>
                </div>
              )}
            </section>
          </div>
        ) : null}
      </div>
    </MainLayout>
  );
};

export default ManagerDashboardPage;
