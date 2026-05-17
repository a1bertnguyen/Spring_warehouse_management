import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { PATHS } from "../../constants/paths";
import ApiService from "../../services/ApiService";
import "./WarehouseStaffDashboardPage.css";

const SECTION_COPY = {
  overview: {
    title: "Warehouse Staff Dashboard",
    subtitle:
      "Manage live inventory, outbound shipment queues, inbound stock checks, and purchase requests in one standardized workspace.",
  },
  inventory: {
    title: "Inventory",
    subtitle:
      "Review stock levels by warehouse, focus on low-stock products, and export the latest inventory snapshot.",
  },
  salesOrders: {
    title: "Sales Orders",
    subtitle:
      "Process orders waiting for shipment and confirm outbound progress directly from the warehouse queue.",
  },
  goodsReceipts: {
    title: "Stock Inwards",
    subtitle:
      "Track approved inbound receipts, review line items, and complete warehouse receipt handling.",
  },
  purchaseRequests: {
    title: "Purchase Requests",
    subtitle:
      "Request replenishment by warehouse, submit restock quantities, and monitor your request history in English.",
  },
};

const DETAIL_CONFIG = {
  salesOrder: {
    key: "salesOrderDetails",
    typeLabel: "Sales Order Details",
    quantityLabel: "Ordered Quantity",
    quantityKey: "quantityOrdered",
    priceLabel: "Unit Sale Price",
    priceKey: "unitSalePrice",
    totalLabel: "Line Total",
    totalKey: "lineTotal",
    loader: (identifier) => ApiService.getSalesOrderDetails(identifier),
  },
  purchaseRequest: {
    key: "purchaseRequestDetails",
    typeLabel: "Purchase Request Details",
    quantityLabel: "Requested Quantity",
    quantityKey: "requestedQuantity",
    priceLabel: "Estimated Unit Cost",
    priceKey: "unitPriceEstimated",
    totalLabel: "Estimated Total",
    totalKey: "lineTotalEstimated",
    loader: (identifier) => ApiService.getPurchaseRequestDetails(identifier),
  },
  stockInward: {
    key: "stockInwardDetails",
    typeLabel: "Stock Inward Details",
    quantityLabel: "Received Quantity",
    quantityKey: "quantityReceived",
    priceLabel: "Unit Cost",
    priceKey: "unitPriceNegotiated",
    fallbackPriceKey: "unitPurchasePrice",
    totalLabel: "Line Value",
    totalKey: "lineValue",
    loader: (identifier) => ApiService.getStockInwardDetails(identifier),
  },
};

const STATUS_LABELS = {
  APPROVED: "Approved",
  AVAILABLE: "Available",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
  CONVERTED: "Converted",
  DELIVERED: "Delivered",
  LOW_STOCK: "Low Stock",
  OUT_OF_STOCK: "Out Of Stock",
  PARTIALLY_RECEIVED: "Partially Received",
  PENDING: "Pending",
  PENDING_APPROVAL: "Pending Approval",
  PROCESSING: "Processing",
  RECEIVED: "Received",
  REJECTED: "Rejected",
  SHIPPED: "Shipped",
  AWAITING_SHIPMENT: "Awaiting Shipment",
  PENDING_STOCK_CHECK: "Pending Stock Check",
};

const PAGE_SIZE = 8;

function formatStatus(value) {
  const normalizedValue = String(value || "").trim().toUpperCase();

  if (!normalizedValue) {
    return "Not Set";
  }

  if (STATUS_LABELS[normalizedValue]) {
    return STATUS_LABELS[normalizedValue];
  }

  return normalizedValue
    .toLowerCase()
    .split("_")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function formatDate(value) {
  if (!value) {
    return "Not Available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not Available";
  }

  return date.toLocaleString("en-GB");
}

function formatCompactNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value || 0));
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

function matchesSearch(searchTerm, fields) {
  const normalizedSearch = String(searchTerm || "").trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return fields.some((field) => String(field || "").toLowerCase().includes(normalizedSearch));
}

function getStatusTone(status) {
  const normalizedStatus = String(status || "").trim().toUpperCase();

  if (
    [
      "REJECTED",
      "CANCELLED",
      "OUT_OF_STOCK",
      "OUTBOUND",
      "STOCK_OUT",
    ].includes(normalizedStatus)
  ) {
    return "danger";
  }

  if (
    [
      "PENDING",
      "PENDING_APPROVAL",
      "PROCESSING",
      "LOW_STOCK",
      "PARTIALLY_RECEIVED",
      "AWAITING_SHIPMENT",
    ].includes(normalizedStatus)
  ) {
    return "warning";
  }

  if (
    ["APPROVED", "AVAILABLE", "COMPLETED", "DELIVERED", "RECEIVED", "SHIPPED"].includes(
      normalizedStatus
    )
  ) {
    return "success";
  }

  return "neutral";
}

function normalizeCollection(payload, collectionKey) {
  if (Array.isArray(payload?.[collectionKey])) {
    return payload[collectionKey];
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  return [];
}

function getInventoryValue(inventory) {
  const unitCost = Number(
    inventory.purchaseprice ??
      inventory.purchasePrice ??
      inventory.product?.purchaseprice ??
      inventory.product?.purchasePrice ??
      0
  );
  const quantityOnHand = Number(inventory.quantityOnHand || 0);

  return unitCost * quantityOnHand;
}

function buildPageSlice(items, currentPage) {
  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const safePage = Math.min(Math.max(currentPage, 1), totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;

  return {
    currentPage: safePage,
    startIndex,
    rows: items.slice(startIndex, startIndex + PAGE_SIZE),
  };
}

function WarehouseSectionHeader({
  eyebrow,
  title,
  description,
  meta,
  action = null,
}) {
  return (
    <div className="warehouse-section-header">
      <div className="warehouse-section-copy">
        <p className="warehouse-section-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="warehouse-section-actions">
        {meta ? <span className="warehouse-section-meta">{meta}</span> : null}
        {action}
      </div>
    </div>
  );
}

function WarehouseEmptyState({ title, description }) {
  return (
    <div className="warehouse-empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function Pagination({ currentPage, totalItems, onChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="warehouse-pagination" aria-label="Pagination">
      <button
        type="button"
        className="warehouse-pagination-button"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;

        return (
          <button
            key={page}
            type="button"
            className={
              page === currentPage
                ? "warehouse-pagination-button active"
                : "warehouse-pagination-button"
            }
            onClick={() => onChange(page)}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        className="warehouse-pagination-button"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}

const WarehouseStaffDashboardPage = ({ activeSection = "overview" }) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");
  const [inventoryStatusFilter, setInventoryStatusFilter] = useState("all");
  const [inventoryWarehouseFilter, setInventoryWarehouseFilter] = useState("all");
  const [salesOrderSearchTerm, setSalesOrderSearchTerm] = useState("");
  const [salesOrderStatusFilter, setSalesOrderStatusFilter] = useState("awaiting_shipment");
  const [goodsReceiptSearchTerm, setGoodsReceiptSearchTerm] = useState("");
  const [goodsReceiptStatusFilter, setGoodsReceiptStatusFilter] = useState("approved");
  const [purchaseRequestSearchTerm, setPurchaseRequestSearchTerm] = useState("");
  const [purchaseRequestStatusFilter, setPurchaseRequestStatusFilter] = useState("all");
  const [showRequestComposer, setShowRequestComposer] = useState(
    activeSection === "purchaseRequests"
  );
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);
  const [isExportingInventory, setIsExportingInventory] = useState(false);
  const [actionKey, setActionKey] = useState("");
  const [pages, setPages] = useState({
    inventory: 1,
    salesOrders: 1,
    goodsReceipts: 1,
    purchaseRequests: 1,
  });
  const [currentUser, setCurrentUser] = useState(null);
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
    inventories: [],
    salesOrders: [],
    goodsReceipts: [],
    purchaseRequests: [],
    warehouses: [],
  });
  const [requestForm, setRequestForm] = useState({
    warehouseId: "",
    notes: "",
  });
  const [requestQuantities, setRequestQuantities] = useState({});

  const showMessage = useCallback((nextMessage) => {
    setMessage(nextMessage);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setMessage("");
    }, 4000);
  }, []);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);

    try {
      const [
        currentUserResult,
        inventoryResult,
        salesOrderResult,
        goodsReceiptResult,
        purchaseRequestResult,
        warehouseResult,
      ] = await Promise.allSettled([
        ApiService.getLoggedInUserInfo(),
        ApiService.getAllInventories(),
        ApiService.getAllSalesOrders(),
        ApiService.getAllStockInwards(),
        ApiService.getAllPurchaseRequests(),
        ApiService.getAllWarehouses(),
      ]);

      const nextData = {
        inventories:
          inventoryResult.status === "fulfilled"
            ? inventoryResult.value?.inventories || []
            : [],
        salesOrders:
          salesOrderResult.status === "fulfilled"
            ? salesOrderResult.value?.salesOrders || []
            : [],
        goodsReceipts:
          goodsReceiptResult.status === "fulfilled"
            ? normalizeCollection(goodsReceiptResult.value, "stockInwards")
            : [],
        purchaseRequests:
          purchaseRequestResult.status === "fulfilled"
            ? purchaseRequestResult.value?.purchaseRequests || []
            : [],
        warehouses:
          warehouseResult.status === "fulfilled"
            ? warehouseResult.value?.warehouses || []
            : [],
      };

      setDashboardData(nextData);
      setCurrentUser(
        currentUserResult.status === "fulfilled"
          ? currentUserResult.value?.user || null
          : null
      );
      setRequestForm((currentValue) => ({
        ...currentValue,
        warehouseId:
          currentValue.warehouseId || String(nextData.warehouses[0]?.id ?? ""),
      }));

      const errors = [
        currentUserResult,
        inventoryResult,
        salesOrderResult,
        goodsReceiptResult,
        purchaseRequestResult,
        warehouseResult,
      ]
        .filter((result) => result.status === "rejected")
        .map((result) => result.reason?.response?.data?.message || "Unable to load data.");

      if (errors.length) {
        showMessage(errors[0]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [showMessage]);

  useEffect(() => {
    loadDashboardData();

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [loadDashboardData]);

  useEffect(() => {
    if (activeSection === "purchaseRequests") {
      setShowRequestComposer(true);
    }
  }, [activeSection]);

  const loggedInUserId = useMemo(() => {
    const rawUserId =
      currentUser?.id ?? currentUser?.userId ?? ApiService.getUserId?.() ?? null;
    const parsedUserId = Number(rawUserId);

    return Number.isFinite(parsedUserId) ? parsedUserId : null;
  }, [currentUser]);

  const activeCopy = SECTION_COPY[activeSection] || SECTION_COPY.overview;

  const warehouseOptions = useMemo(
    () =>
      dashboardData.warehouses.map((warehouse) => ({
        id: warehouse.id,
        name: warehouse.name || `Warehouse ${warehouse.id}`,
      })),
    [dashboardData.warehouses]
  );

  const inventoryRows = useMemo(
    () =>
      dashboardData.inventories
        .map((inventory) => ({
          id: inventory.inventoryId ?? inventory.id,
          productId: inventory.productId ?? inventory.product?.id,
          productName:
            inventory.productName || inventory.product?.name || "Unnamed Product",
          productSku: inventory.productSku || inventory.product?.sku || "No SKU",
          warehouseId: inventory.warehouseId ?? inventory.warehouse?.id,
          warehouseName:
            inventory.warehouseName || inventory.warehouse?.name || "Unassigned",
          quantityOnHand: Number(inventory.quantityOnHand || 0),
          lowStockThreshold: Number(inventory.lowStockThreshold || 0),
          status: formatStatus(inventory.status),
          rawStatus: inventory.status,
          stockValue: getInventoryValue(inventory),
        }))
        .sort((left, right) =>
          left.productName.localeCompare(right.productName, undefined, {
            sensitivity: "base",
          })
        ),
    [dashboardData.inventories]
  );

  const filteredInventories = useMemo(
    () =>
      inventoryRows.filter((inventory) => {
        const matchesWarehouse =
          inventoryWarehouseFilter === "all" ||
          String(inventory.warehouseId ?? "") === inventoryWarehouseFilter;
        const matchesStatus =
          inventoryStatusFilter === "all" ||
          String(inventory.rawStatus || "").toUpperCase() === inventoryStatusFilter;

        return (
          matchesWarehouse &&
          matchesStatus &&
          matchesSearch(inventorySearchTerm, [
            inventory.productName,
            inventory.productSku,
            inventory.warehouseName,
            inventory.status,
          ])
        );
      }),
    [inventoryRows, inventorySearchTerm, inventoryStatusFilter, inventoryWarehouseFilter]
  );

  const lowStockRows = useMemo(
    () =>
      inventoryRows
        .filter((inventory) =>
          ["LOW_STOCK", "OUT_OF_STOCK"].includes(
            String(inventory.rawStatus || "").toUpperCase()
          )
        )
        .sort((left, right) => left.quantityOnHand - right.quantityOnHand),
    [inventoryRows]
  );

  const salesOrderRows = useMemo(
    () =>
      dashboardData.salesOrders
        .map((order) => ({
          id: order.id ?? order.salesOrderId,
          code: order.orderCode || order.salesOrderCode || `SO-${order.id ?? "N/A"}`,
          customerName:
            order.customerName || order.customer?.name || "Walk-in Customer",
          warehouseName:
            order.warehouseName || order.warehouse?.name || "Unassigned",
          totalItems:
            order.totalItems ??
            (Array.isArray(order.orderDetails)
              ? order.orderDetails.reduce(
                  (sum, detail) => sum + Number(detail.quantityOrdered || 0),
                  0
                )
              : 0),
          status: formatStatus(order.status),
          rawStatus: order.status,
          updatedAt: order.updatedAt || order.orderDate || order.createdAt,
          orderDate: order.orderDate || order.createdAt,
        }))
        .sort(
          (left, right) =>
            new Date(right.updatedAt || 0).getTime() -
            new Date(left.updatedAt || 0).getTime()
        ),
    [dashboardData.salesOrders]
  );

  const filteredSalesOrderRows = useMemo(
    () =>
      salesOrderRows.filter((row) => {
        const matchesStatus =
          salesOrderStatusFilter === "all" ||
          String(row.rawStatus || "").toLowerCase() === salesOrderStatusFilter;

        return (
          matchesStatus &&
          matchesSearch(salesOrderSearchTerm, [
            row.code,
            row.customerName,
            row.warehouseName,
            row.status,
          ])
        );
      }),
    [salesOrderRows, salesOrderSearchTerm, salesOrderStatusFilter]
  );

  const goodsReceiptRows = useMemo(
    () =>
      dashboardData.goodsReceipts
        .map((receipt) => ({
          id: receipt.id ?? receipt.stockInwardId,
          code:
            receipt.stockInwardCode ||
            receipt.code ||
            `INW-${receipt.id ?? receipt.stockInwardId ?? "N/A"}`,
          supplierName:
            receipt.supplierName || receipt.supplier?.name || "No Supplier",
          warehouseName:
            receipt.warehouseName || receipt.warehouse?.name || "Unassigned",
          totalItems:
            receipt.totalReceivedQuantity ??
            receipt.totalItems ??
            receipt.totalQuantity ??
            0,
          status: formatStatus(receipt.status),
          rawStatus: receipt.status,
          updatedAt:
            receipt.updatedAt || receipt.inwardDate || receipt.createdAt || receipt.date,
        }))
        .sort(
          (left, right) =>
            new Date(right.updatedAt || 0).getTime() -
            new Date(left.updatedAt || 0).getTime()
        ),
    [dashboardData.goodsReceipts]
  );

  const filteredGoodsReceiptRows = useMemo(
    () =>
      goodsReceiptRows.filter((row) => {
        const normalizedStatus = String(row.rawStatus || "").toLowerCase();
        const matchesStatus =
          goodsReceiptStatusFilter === "all" ||
          normalizedStatus === goodsReceiptStatusFilter;

        return (
          matchesStatus &&
          matchesSearch(goodsReceiptSearchTerm, [
            row.code,
            row.supplierName,
            row.warehouseName,
            row.status,
          ])
        );
      }),
    [goodsReceiptRows, goodsReceiptSearchTerm, goodsReceiptStatusFilter]
  );

  const purchaseRequestRows = useMemo(
    () =>
      dashboardData.purchaseRequests
        .map((request) => ({
          id: request.id ?? request.purchaseRequestId,
          code:
            request.requestCode ||
            request.code ||
            `REQ-${request.id ?? request.purchaseRequestId ?? "N/A"}`,
          warehouseId: request.warehouseId ?? request.warehouse?.id,
          warehouseName:
            request.warehouseName || request.warehouse?.name || "Unassigned",
          requesterId: request.requesterId ?? request.createdById ?? null,
          requesterName:
            request.requesterName ||
            request.createdByName ||
            currentUser?.name ||
            "Warehouse Staff",
          totalItems:
            request.totalItems ??
            (Array.isArray(request.requestDetails)
              ? request.requestDetails.reduce(
                  (sum, detail) => sum + Number(detail.requestedQuantity || 0),
                  0
                )
              : 0),
          estimatedAmount: Number(request.totalEstimatedAmount || 0),
          status: formatStatus(request.status),
          rawStatus: request.status,
          updatedAt: request.updatedAt || request.requestDate || request.createdAt,
        }))
        .sort(
          (left, right) =>
            new Date(right.updatedAt || 0).getTime() -
            new Date(left.updatedAt || 0).getTime()
        ),
    [dashboardData.purchaseRequests, currentUser]
  );

  const myPurchaseRequestRows = useMemo(
    () =>
      purchaseRequestRows.filter((row) => {
        if (!loggedInUserId || row.requesterId == null) {
          return true;
        }

        return Number(row.requesterId) === loggedInUserId;
      }),
    [purchaseRequestRows, loggedInUserId]
  );

  const filteredPurchaseRequestRows = useMemo(
    () =>
      myPurchaseRequestRows.filter((row) => {
        const matchesStatus =
          purchaseRequestStatusFilter === "all" ||
          String(row.rawStatus || "").toLowerCase() === purchaseRequestStatusFilter;

        return (
          matchesStatus &&
          matchesSearch(purchaseRequestSearchTerm, [
            row.code,
            row.warehouseName,
            row.requesterName,
            row.status,
          ])
        );
      }),
    [myPurchaseRequestRows, purchaseRequestSearchTerm, purchaseRequestStatusFilter]
  );

  const selectedWarehouseInventories = useMemo(
    () =>
      inventoryRows
        .filter(
          (inventory) => String(inventory.warehouseId ?? "") === requestForm.warehouseId
        )
        .sort((left, right) => {
          const leftPriority = ["OUT_OF_STOCK", "LOW_STOCK"].includes(
            String(left.rawStatus || "").toUpperCase()
          )
            ? 0
            : 1;
          const rightPriority = ["OUT_OF_STOCK", "LOW_STOCK"].includes(
            String(right.rawStatus || "").toUpperCase()
          )
            ? 0
            : 1;

          if (leftPriority !== rightPriority) {
            return leftPriority - rightPriority;
          }

          return left.productName.localeCompare(right.productName, undefined, {
            sensitivity: "base",
          });
        }),
    [inventoryRows, requestForm.warehouseId]
  );

  const overviewCards = useMemo(
    () => [
      {
        label: "Inventory Rows",
        value: inventoryRows.length,
        helper: "Tracked stock positions across all warehouse locations.",
      },
      {
        label: "Low Stock Alerts",
        value: lowStockRows.length,
        helper: "Products that need restock attention from warehouse staff.",
      },
      {
        label: "Awaiting Shipment",
        value: salesOrderRows.filter(
          (row) => String(row.rawStatus || "").toLowerCase() === "awaiting_shipment"
        ).length,
        helper: "Outbound orders still waiting for warehouse confirmation.",
      },
      {
        label: "Approved Receipts",
        value: goodsReceiptRows.filter(
          (row) => String(row.rawStatus || "").toUpperCase() === "APPROVED"
        ).length,
        helper: "Inbound documents ready for stock inward handling.",
      },
    ],
    [goodsReceiptRows, inventoryRows.length, lowStockRows.length, salesOrderRows]
  );

  const queueSummary = useMemo(() => {
    const pendingShipments = salesOrderRows.filter(
      (row) => String(row.rawStatus || "").toLowerCase() === "awaiting_shipment"
    ).length;
    const approvedReceipts = goodsReceiptRows.filter(
      (row) => String(row.rawStatus || "").toUpperCase() === "APPROVED"
    ).length;
    const openRequests = myPurchaseRequestRows.filter((row) =>
      ["pending_approval", "approved", "processing"].includes(
        String(row.rawStatus || "").toLowerCase()
      )
    ).length;

    return pendingShipments + approvedReceipts + openRequests;
  }, [goodsReceiptRows, myPurchaseRequestRows, salesOrderRows]);

  const shipmentQueue = useMemo(
    () =>
      salesOrderRows.filter(
        (row) => String(row.rawStatus || "").toLowerCase() === "awaiting_shipment"
      ),
    [salesOrderRows]
  );

  const approvedReceiptQueue = useMemo(
    () =>
      goodsReceiptRows.filter(
        (row) => String(row.rawStatus || "").toUpperCase() === "APPROVED"
      ),
    [goodsReceiptRows]
  );

  function updatePage(section, nextPage) {
    setPages((currentValue) => ({
      ...currentValue,
      [section]: nextPage,
    }));
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

  async function openDetails(kind, row) {
    const config = DETAIL_CONFIG[kind];

    if (!config) {
      return;
    }

    setDetailDialog({
      isOpen: true,
      isLoading: true,
      title: row.code,
      subtitle:
        row.customerName ||
        row.supplierName ||
        row.requesterName ||
        row.warehouseName ||
        "Warehouse flow detail",
      status: row.status,
      error: "",
      items: [],
      config,
    });

    try {
      const response = await config.loader(row.id);
      const items = normalizeCollection(response, config.key);

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
          error.response?.data?.message || "Unable to load detail line items.",
      }));
    }
  }

  async function handleMarkShipped(row) {
    const nextActionKey = `ship-${row.id}`;
    setActionKey(nextActionKey);

    try {
      await ApiService.updateSalesOrderStatus(row.id, "shipped");
      await loadDashboardData();
      showMessage(`Sales order ${row.code} marked as shipped.`);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to update the sales order status."
      );
    } finally {
      setActionKey("");
    }
  }

  async function handleCompleteReceipt(row) {
    const nextActionKey = `receipt-${row.id}`;
    setActionKey(nextActionKey);

    try {
      await ApiService.updateStockInwardStatus(row.id, "COMPLETED");
      await loadDashboardData();
      showMessage(`Stock inward ${row.code} marked as completed.`);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to complete this stock inward."
      );
    } finally {
      setActionKey("");
    }
  }

  async function handleExportInventories() {
    setIsExportingInventory(true);

    try {
      const blob = await ApiService.exportInventories();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = "warehouse-inventory.xlsx";
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to export the inventory snapshot."
      );
    } finally {
      setIsExportingInventory(false);
    }
  }

  function resetRequestForm(defaultWarehouseId = requestForm.warehouseId) {
    setRequestForm({
      warehouseId: defaultWarehouseId || String(warehouseOptions[0]?.id ?? ""),
      notes: "",
    });
    setRequestQuantities({});
  }

  function handleRequestFormChange(event) {
    const { name, value } = event.target;

    setRequestForm((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));

    if (name === "warehouseId") {
      setRequestQuantities({});
      setPages((currentValue) => ({
        ...currentValue,
        purchaseRequests: 1,
      }));
    }
  }

  function handleRequestQuantityChange(productId, value) {
    setRequestQuantities((currentValue) => ({
      ...currentValue,
      [productId]: value,
    }));
  }

  async function handleCreatePurchaseRequest(event) {
    event.preventDefault();

    if (!requestForm.warehouseId) {
      showMessage("Select a warehouse before creating a purchase request.");
      return;
    }

    const requestItems = selectedWarehouseInventories
      .map((inventory) => ({
        productId: Number(inventory.productId),
        requestedQuantity: Number(requestQuantities[inventory.productId] || 0),
      }))
      .filter(
        (item) =>
          Number.isFinite(item.productId) &&
          Number.isFinite(item.requestedQuantity) &&
          item.requestedQuantity > 0
      );

    if (!requestItems.length) {
      showMessage("Enter at least one requested quantity greater than zero.");
      return;
    }

    setIsSubmittingRequest(true);

    try {
      await ApiService.createPurchaseRequest({
        warehouseId: Number(requestForm.warehouseId),
        notes: requestForm.notes.trim(),
        items: requestItems,
      });
      await loadDashboardData();
      resetRequestForm(requestForm.warehouseId);
      setShowRequestComposer(false);
      showMessage("Purchase request created successfully.");
      navigate(PATHS.dashboardPurchaseRequests);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to create the purchase request."
      );
    } finally {
      setIsSubmittingRequest(false);
    }
  }

  function renderOverview() {
    return (
      <>
        <section className="warehouse-stats-grid">
          {overviewCards.map((card) => (
            <article key={card.label} className="warehouse-stat-card">
              <span>{card.label}</span>
              <strong>{formatCompactNumber(card.value)}</strong>
              <p>{card.helper}</p>
            </article>
          ))}
        </section>

        <section className="warehouse-overview-grid">
          <article className="warehouse-panel">
            <div className="warehouse-panel-heading">
              <div>
                <p className="warehouse-panel-label">Action Center</p>
                <h2>Warehouse workspaces</h2>
              </div>
            </div>

            <div className="warehouse-quick-grid">
              <button
                type="button"
                className="warehouse-quick-card"
                onClick={() => navigate(PATHS.dashboardInventory)}
              >
                <strong>Inventory</strong>
                <span>Inspect on-hand stock, export current rows, and isolate low-stock items.</span>
              </button>

              <button
                type="button"
                className="warehouse-quick-card"
                onClick={() => navigate(PATHS.dashboardSalesOrders)}
              >
                <strong>Sales Orders</strong>
                <span>Open the outbound queue and confirm shipments waiting for dispatch.</span>
              </button>

              <button
                type="button"
                className="warehouse-quick-card"
                onClick={() => navigate(PATHS.dashboardGoodsReceipts)}
              >
                <strong>Stock Inwards</strong>
                <span>Review approved receipts, inspect line items, and complete inbound checks.</span>
              </button>

              <button
                type="button"
                className="warehouse-quick-card"
                onClick={() => navigate(PATHS.dashboardPurchaseRequests)}
              >
                <strong>Purchase Requests</strong>
                <span>Request replenishment by warehouse and track every submitted request.</span>
              </button>
            </div>
          </article>

          <article className="warehouse-panel">
            <div className="warehouse-panel-heading">
              <div>
                <p className="warehouse-panel-label">Priority Queue</p>
                <h2>Items needing attention</h2>
              </div>
            </div>

            <div className="warehouse-list-group">
              <div>
                <h3>Low-stock products</h3>
                {lowStockRows.length ? (
                  <div className="warehouse-list">
                    {lowStockRows.slice(0, 4).map((inventory) => (
                      <div key={inventory.id} className="warehouse-list-row">
                        <div>
                          <strong>{inventory.productName}</strong>
                          <p>
                            {inventory.productSku} - {inventory.warehouseName}
                          </p>
                        </div>
                        <div className="warehouse-row-metrics">
                          <span className={`warehouse-badge tone-${getStatusTone(inventory.rawStatus)}`}>
                            {inventory.status}
                          </span>
                          <strong>{inventory.quantityOnHand}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <WarehouseEmptyState
                    title="No low-stock alerts"
                    description="Products that need replenishment will appear here."
                  />
                )}
              </div>

              <div>
                <h3>Inbound and outbound queue</h3>
                <div className="warehouse-kpi-strip">
                  <div>
                    <span>Awaiting Shipment</span>
                    <strong>{formatCompactNumber(shipmentQueue.length)}</strong>
                  </div>
                  <div>
                    <span>Approved Receipts</span>
                    <strong>{formatCompactNumber(approvedReceiptQueue.length)}</strong>
                  </div>
                  <div>
                    <span>Open Requests</span>
                    <strong>
                      {formatCompactNumber(
                        myPurchaseRequestRows.filter((row) =>
                          ["pending_approval", "approved", "processing"].includes(
                            String(row.rawStatus || "").toLowerCase()
                          )
                        ).length
                      )}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </section>
      </>
    );
  }

  function renderInventory() {
    const { currentPage, rows, startIndex } = buildPageSlice(
      filteredInventories,
      pages.inventory
    );

    return (
      <section className="warehouse-section-card">
        <WarehouseSectionHeader
          eyebrow="Inventory View"
          title="Live Inventory Snapshot"
          description="Filter by warehouse and status, then export the latest inventory table when you need an offline copy."
          meta={`${formatCompactNumber(filteredInventories.length)} rows`}
          action={
            <button
              type="button"
              className="warehouse-primary-action"
              onClick={handleExportInventories}
              disabled={isExportingInventory}
            >
              {isExportingInventory ? "Exporting..." : "Export Excel"}
            </button>
          }
        />

        <div className="warehouse-toolbar">
          <input
            className="warehouse-search-input"
            value={inventorySearchTerm}
            onChange={(event) => setInventorySearchTerm(event.target.value)}
            placeholder="Search by product, SKU, warehouse, or status"
          />

          <select
            className="warehouse-filter-input"
            value={inventoryWarehouseFilter}
            onChange={(event) => setInventoryWarehouseFilter(event.target.value)}
          >
            <option value="all">All warehouses</option>
            {warehouseOptions.map((warehouse) => (
              <option key={warehouse.id} value={String(warehouse.id)}>
                {warehouse.name}
              </option>
            ))}
          </select>

          <select
            className="warehouse-filter-input"
            value={inventoryStatusFilter}
            onChange={(event) => setInventoryStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="LOW_STOCK">Low Stock</option>
            <option value="OUT_OF_STOCK">Out Of Stock</option>
          </select>
        </div>

        <div className="warehouse-summary-strip">
          <div>
            <span>Tracked Units</span>
            <strong>
              {formatCompactNumber(
                inventoryRows.reduce(
                  (sum, inventory) => sum + Number(inventory.quantityOnHand || 0),
                  0
                )
              )}
            </strong>
          </div>
          <div>
            <span>Low Stock Items</span>
            <strong>{formatCompactNumber(lowStockRows.length)}</strong>
          </div>
          <div>
            <span>Inventory Value</span>
            <strong>
              {formatCurrency(
                inventoryRows.reduce(
                  (sum, inventory) => sum + Number(inventory.stockValue || 0),
                  0
                )
              )}
            </strong>
          </div>
        </div>

        {rows.length ? (
          <>
            <div className="warehouse-table-shell">
              <table className="warehouse-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Product</th>
                    <th>Warehouse</th>
                    <th>On Hand</th>
                    <th>Threshold</th>
                    <th>Stock Value</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((inventory, index) => (
                    <tr key={inventory.id}>
                      <td>{startIndex + index + 1}</td>
                      <td>
                        <strong>{inventory.productName}</strong>
                        <span>{inventory.productSku}</span>
                      </td>
                      <td>{inventory.warehouseName}</td>
                      <td>{formatCompactNumber(inventory.quantityOnHand)}</td>
                      <td>{formatCompactNumber(inventory.lowStockThreshold)}</td>
                      <td>{formatCurrency(inventory.stockValue)}</td>
                      <td>
                        <span className={`warehouse-badge tone-${getStatusTone(inventory.rawStatus)}`}>
                          {inventory.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredInventories.length}
              onChange={(page) => updatePage("inventory", page)}
            />
          </>
        ) : (
          <WarehouseEmptyState
            title="No inventory rows match"
            description="Try another search term, warehouse, or inventory status."
          />
        )}
      </section>
    );
  }

  function renderSalesOrders() {
    const { currentPage, rows, startIndex } = buildPageSlice(
      filteredSalesOrderRows,
      pages.salesOrders
    );

    return (
      <section className="warehouse-section-card">
        <WarehouseSectionHeader
          eyebrow="Outbound Queue"
          title="Sales Orders Waiting For Warehouse Action"
          description="Open detail lines, confirm shipped orders, and keep outbound status aligned with warehouse operations."
          meta={`${formatCompactNumber(filteredSalesOrderRows.length)} orders`}
        />

        <div className="warehouse-toolbar">
          <input
            className="warehouse-search-input"
            value={salesOrderSearchTerm}
            onChange={(event) => setSalesOrderSearchTerm(event.target.value)}
            placeholder="Search by code, customer, warehouse, or status"
          />

          <select
            className="warehouse-filter-input"
            value={salesOrderStatusFilter}
            onChange={(event) => setSalesOrderStatusFilter(event.target.value)}
          >
            <option value="awaiting_shipment">Awaiting Shipment</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="all">All statuses</option>
          </select>
        </div>

        {rows.length ? (
          <>
            <div className="warehouse-table-shell">
              <table className="warehouse-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Order Code</th>
                    <th>Customer</th>
                    <th>Warehouse</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th>Ordered On</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => {
                    const isAwaitingShipment =
                      String(row.rawStatus || "").toLowerCase() === "awaiting_shipment";

                    return (
                      <tr key={row.id}>
                        <td>{startIndex + index + 1}</td>
                        <td>
                          <strong>{row.code}</strong>
                        </td>
                        <td>{row.customerName}</td>
                        <td>{row.warehouseName}</td>
                        <td>{formatCompactNumber(row.totalItems)}</td>
                        <td>
                          <span className={`warehouse-badge tone-${getStatusTone(row.rawStatus)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td>{formatDate(row.orderDate)}</td>
                        <td>
                          <div className="warehouse-row-actions">
                            <button
                              type="button"
                              className="warehouse-row-action secondary"
                              onClick={() => openDetails("salesOrder", row)}
                            >
                              Details
                            </button>
                            {isAwaitingShipment ? (
                              <button
                                type="button"
                                className="warehouse-row-action"
                                disabled={actionKey === `ship-${row.id}`}
                                onClick={() => handleMarkShipped(row)}
                              >
                                {actionKey === `ship-${row.id}` ? "Saving..." : "Mark Shipped"}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredSalesOrderRows.length}
              onChange={(page) => updatePage("salesOrders", page)}
            />
          </>
        ) : (
          <WarehouseEmptyState
            title="No sales orders match"
            description="Try another outbound search term or status."
          />
        )}
      </section>
    );
  }

  function renderGoodsReceipts() {
    const { currentPage, rows, startIndex } = buildPageSlice(
      filteredGoodsReceiptRows,
      pages.goodsReceipts
    );

    return (
      <section className="warehouse-section-card">
        <WarehouseSectionHeader
          eyebrow="Inbound Check"
          title="Approved Stock Inwards"
          description="Review inbound receipt details, focus on approved documents, and complete the receipt flow when the warehouse is done checking."
          meta={`${formatCompactNumber(filteredGoodsReceiptRows.length)} receipts`}
        />

        <div className="warehouse-toolbar">
          <input
            className="warehouse-search-input"
            value={goodsReceiptSearchTerm}
            onChange={(event) => setGoodsReceiptSearchTerm(event.target.value)}
            placeholder="Search by code, supplier, warehouse, or status"
          />

          <select
            className="warehouse-filter-input"
            value={goodsReceiptStatusFilter}
            onChange={(event) => setGoodsReceiptStatusFilter(event.target.value)}
          >
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="all">All statuses</option>
          </select>
        </div>

        {rows.length ? (
          <>
            <div className="warehouse-table-shell">
              <table className="warehouse-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Receipt Code</th>
                    <th>Supplier</th>
                    <th>Warehouse</th>
                    <th>Quantity</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => {
                    const isApproved =
                      String(row.rawStatus || "").toUpperCase() === "APPROVED";

                    return (
                      <tr key={row.id}>
                        <td>{startIndex + index + 1}</td>
                        <td>
                          <strong>{row.code}</strong>
                        </td>
                        <td>{row.supplierName}</td>
                        <td>{row.warehouseName}</td>
                        <td>{formatCompactNumber(row.totalItems)}</td>
                        <td>
                          <span className={`warehouse-badge tone-${getStatusTone(row.rawStatus)}`}>
                            {row.status}
                          </span>
                        </td>
                        <td>{formatDate(row.updatedAt)}</td>
                        <td>
                          <div className="warehouse-row-actions">
                            <button
                              type="button"
                              className="warehouse-row-action secondary"
                              onClick={() => openDetails("stockInward", row)}
                            >
                              Details
                            </button>
                            {isApproved ? (
                              <button
                                type="button"
                                className="warehouse-row-action"
                                disabled={actionKey === `receipt-${row.id}`}
                                onClick={() => handleCompleteReceipt(row)}
                              >
                                {actionKey === `receipt-${row.id}`
                                  ? "Saving..."
                                  : "Complete Receipt"}
                              </button>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredGoodsReceiptRows.length}
              onChange={(page) => updatePage("goodsReceipts", page)}
            />
          </>
        ) : (
          <WarehouseEmptyState
            title="No stock inwards match"
            description="Try another inbound search term or status."
          />
        )}
      </section>
    );
  }

  function renderPurchaseRequests() {
    const { currentPage, rows, startIndex } = buildPageSlice(
      filteredPurchaseRequestRows,
      pages.purchaseRequests
    );

    return (
      <section className="warehouse-section-card">
        <WarehouseSectionHeader
          eyebrow="Restock Requests"
          title="Purchase Request Workspace"
          description="Submit replenishment quantities by warehouse and keep your request history aligned with warehouse demand."
          meta={`${formatCompactNumber(filteredPurchaseRequestRows.length)} requests`}
          action={
            <button
              type="button"
              className="warehouse-primary-action"
              onClick={() => setShowRequestComposer((currentValue) => !currentValue)}
            >
              {showRequestComposer ? "Hide Composer" : "Create Request"}
            </button>
          }
        />

        {showRequestComposer ? (
          <form className="warehouse-request-form" onSubmit={handleCreatePurchaseRequest}>
            <div className="warehouse-request-form-grid">
              <div className="warehouse-request-form-main">
                <label>
                  Warehouse
                  <select
                    name="warehouseId"
                    value={requestForm.warehouseId}
                    onChange={handleRequestFormChange}
                  >
                    <option value="">Select warehouse</option>
                    {warehouseOptions.map((warehouse) => (
                      <option key={warehouse.id} value={String(warehouse.id)}>
                        {warehouse.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Notes
                  <textarea
                    name="notes"
                    rows={4}
                    value={requestForm.notes}
                    onChange={handleRequestFormChange}
                    placeholder="Add purchase request notes for the warehouse manager"
                  />
                </label>
              </div>

              <aside className="warehouse-request-summary">
                <strong>Composer Summary</strong>
                <p>
                  Select a warehouse, enter the requested quantity per product, then submit the request
                  for approval.
                </p>
                <div className="warehouse-kpi-strip">
                  <div>
                    <span>Warehouse Rows</span>
                    <strong>{formatCompactNumber(selectedWarehouseInventories.length)}</strong>
                  </div>
                  <div>
                    <span>Open Requests</span>
                    <strong>
                      {formatCompactNumber(
                        myPurchaseRequestRows.filter((row) =>
                          ["pending_approval", "approved", "processing"].includes(
                            String(row.rawStatus || "").toLowerCase()
                          )
                        ).length
                      )}
                    </strong>
                  </div>
                </div>
              </aside>
            </div>

            {selectedWarehouseInventories.length ? (
              <div className="warehouse-table-shell">
                <table className="warehouse-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Product</th>
                      <th>Warehouse</th>
                      <th>On Hand</th>
                      <th>Status</th>
                      <th>Requested Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedWarehouseInventories.map((inventory, index) => (
                      <tr key={`${inventory.warehouseId}-${inventory.productId}`}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{inventory.productName}</strong>
                          <span>{inventory.productSku}</span>
                        </td>
                        <td>{inventory.warehouseName}</td>
                        <td>{formatCompactNumber(inventory.quantityOnHand)}</td>
                        <td>
                          <span className={`warehouse-badge tone-${getStatusTone(inventory.rawStatus)}`}>
                            {inventory.status}
                          </span>
                        </td>
                        <td>
                          <input
                            className="warehouse-quantity-input"
                            type="number"
                            min="0"
                            step="1"
                            value={requestQuantities[inventory.productId] || ""}
                            onChange={(event) =>
                              handleRequestQuantityChange(
                                inventory.productId,
                                event.target.value
                              )
                            }
                            placeholder="0"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <WarehouseEmptyState
                title="No inventory rows for this warehouse"
                description="Choose another warehouse to create a purchase request."
              />
            )}

            <div className="warehouse-form-actions">
              <button
                type="button"
                className="warehouse-secondary-action"
                onClick={() => resetRequestForm(requestForm.warehouseId)}
              >
                Reset
              </button>
              <button
                type="submit"
                className="warehouse-primary-action"
                disabled={isSubmittingRequest}
              >
                {isSubmittingRequest ? "Submitting..." : "Submit Purchase Request"}
              </button>
            </div>
          </form>
        ) : null}

        <div className="warehouse-toolbar">
          <input
            className="warehouse-search-input"
            value={purchaseRequestSearchTerm}
            onChange={(event) => setPurchaseRequestSearchTerm(event.target.value)}
            placeholder="Search by code, warehouse, requester, or status"
          />

          <select
            className="warehouse-filter-input"
            value={purchaseRequestStatusFilter}
            onChange={(event) => setPurchaseRequestStatusFilter(event.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="pending_approval">Pending Approval</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="converted">Converted</option>
          </select>
        </div>

        {rows.length ? (
          <>
            <div className="warehouse-table-shell">
              <table className="warehouse-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Request Code</th>
                    <th>Warehouse</th>
                    <th>Requester</th>
                    <th>Total Items</th>
                    <th>Estimated Amount</th>
                    <th>Status</th>
                    <th>Updated</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={row.id}>
                      <td>{startIndex + index + 1}</td>
                      <td>
                        <strong>{row.code}</strong>
                      </td>
                      <td>{row.warehouseName}</td>
                      <td>{row.requesterName}</td>
                      <td>{formatCompactNumber(row.totalItems)}</td>
                      <td>{formatCurrency(row.estimatedAmount)}</td>
                      <td>
                        <span className={`warehouse-badge tone-${getStatusTone(row.rawStatus)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>{formatDate(row.updatedAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="warehouse-row-action secondary"
                          onClick={() => openDetails("purchaseRequest", row)}
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredPurchaseRequestRows.length}
              onChange={(page) => updatePage("purchaseRequests", page)}
            />
          </>
        ) : (
          <WarehouseEmptyState
            title="No purchase requests match"
            description="Try another request search term or create a new restock request."
          />
        )}
      </section>
    );
  }

  function renderActiveSection() {
    if (activeSection === "inventory") {
      return renderInventory();
    }

    if (activeSection === "salesOrders") {
      return renderSalesOrders();
    }

    if (activeSection === "goodsReceipts") {
      return renderGoodsReceipts();
    }

    if (activeSection === "purchaseRequests") {
      return renderPurchaseRequests();
    }

    return renderOverview();
  }

  return (
    <MainLayout>
      {message ? <div className="message">{message}</div> : null}

      <div className="warehouse-dashboard-page">
        <section className="warehouse-page-shell">
          <div className="warehouse-page-header">
            <div className="warehouse-page-title">
              <span className="warehouse-page-kicker">Warehouse Staff Dashboard</span>
              <h1>{activeCopy.title}</h1>
              <p>{activeCopy.subtitle}</p>
            </div>

            <div className="warehouse-page-summary-card">
              <span>Queue Summary</span>
              <strong>{formatCompactNumber(queueSummary)}</strong>
              <p>tasks need shipment, receipt completion, or restock follow-up.</p>
            </div>
          </div>

          {isLoading ? (
            <section className="warehouse-loading-grid" aria-label="Loading warehouse dashboard">
              <div className="warehouse-loading-card" />
              <div className="warehouse-loading-card" />
              <div className="warehouse-loading-card" />
            </section>
          ) : (
            renderActiveSection()
          )}
        </section>
      </div>

      {detailDialog.isOpen ? (
        <div
          className="warehouse-dialog-backdrop"
          role="presentation"
          onClick={closeDetailDialog}
        >
          <section
            className="warehouse-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="warehouse-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="warehouse-panel-heading warehouse-dialog-heading">
              <div>
                <p className="warehouse-panel-label">
                  {detailDialog.config?.typeLabel || "Details"}
                </p>
                <h2 id="warehouse-detail-title">{detailDialog.title}</h2>
                <p className="warehouse-dialog-subtitle">{detailDialog.subtitle}</p>
              </div>

              <div className="warehouse-dialog-actions">
                {detailDialog.status ? (
                  <span className="warehouse-badge tone-neutral">{detailDialog.status}</span>
                ) : null}
                <button
                  type="button"
                  className="warehouse-secondary-action"
                  onClick={closeDetailDialog}
                >
                  Close
                </button>
              </div>
            </div>

            {detailDialog.isLoading ? (
              <div className="warehouse-loading-grid warehouse-loading-grid-dialog">
                <div className="warehouse-loading-card" />
              </div>
            ) : detailDialog.error ? (
              <WarehouseEmptyState
                title="Unable to load detail lines"
                description={detailDialog.error}
              />
            ) : detailDialog.items.length ? (
              <div className="warehouse-table-shell">
                <table className="warehouse-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Product</th>
                      <th>{detailDialog.config.quantityLabel}</th>
                      <th>{detailDialog.config.priceLabel}</th>
                      <th>{detailDialog.config.totalLabel}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailDialog.items.map((item, index) => {
                      const unitPrice =
                        item[detailDialog.config.priceKey] ??
                        item[detailDialog.config.fallbackPriceKey] ??
                        0;
                      const quantity = Number(item[detailDialog.config.quantityKey] || 0);
                      const totalValue =
                        item[detailDialog.config.totalKey] ?? Number(unitPrice) * quantity;

                      return (
                        <tr key={`detail-line-${index}`}>
                          <td>{index + 1}</td>
                          <td>
                            <strong>
                              {item.productName ||
                                item.product?.name ||
                                `Product ${item.productId ?? index + 1}`}
                            </strong>
                            <span>{item.productSku || item.product?.sku || "No SKU"}</span>
                          </td>
                          <td>{formatCompactNumber(quantity)}</td>
                          <td>{formatCurrency(unitPrice)}</td>
                          <td>{formatCurrency(totalValue)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <WarehouseEmptyState
                title="No detail rows"
                description="Line item details are not available for this document."
              />
            )}
          </section>
        </div>
      ) : null}
    </MainLayout>
  );
};

export default WarehouseStaffDashboardPage;
