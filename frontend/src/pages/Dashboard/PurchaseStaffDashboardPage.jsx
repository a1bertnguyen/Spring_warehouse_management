import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { PATHS } from "../../constants/paths";
import ApiService from "../../services/ApiService";
import "./PurchaseStaffDashboardPage.css";

const SECTION_COPY = {
  overview: {
    title: "Purchase Dashboard",
    subtitle:
      "Track suppliers, inventory, purchase orders, stock inwards, and inventory movements in one workspace.",
  },
  suppliers: {
    title: "Suppliers",
    subtitle:
      "Review supplier records used by the purchasing and inbound receiving workflow.",
  },
  inventory: {
    title: "Inventory",
    subtitle:
      "Check on-hand stock by product and warehouse before receiving new inbound quantities.",
  },
  purchaseRequests: {
    title: "Purchase Requests",
    subtitle:
      "Review manager-approved warehouse requests before converting them into supplier purchase orders.",
  },
  purchaseOrders: {
    title: "Purchase Orders",
    subtitle:
      "Track supplier ordering, shipment progress, and receipt follow-up in one place.",
  },
  goodsReceipts: {
    title: "Stock Inwards",
    subtitle:
      "Review receiving documents by supplier, destination warehouse, and received quantity.",
  },
  inventoryMovements: {
    title: "Inventory Movements",
    subtitle:
      "Audit stock changes to reconcile purchase orders, stock inwards, and warehouse activity.",
  },
  createStockInward: {
    title: "Create Stock Inward",
    subtitle:
      "Create a receiving document with the same structure as the legacy stock inward form.",
  },
};

const ORDER_DETAIL_CONFIG = {
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
  purchaseOrder: {
    key: "purchaseOrderDetails",
    typeLabel: "Purchase Order Details",
    quantityLabel: "Ordered Quantity",
    quantityKey: "orderedQuantity",
    priceLabel: "Estimated Unit Cost",
    priceKey: "unitPriceEstimated",
    totalLabel: "Estimated Total",
    totalKey: "lineTotalEstimated",
    loader: (identifier) => ApiService.getPurchaseOrderDetails(identifier),
  },
  stockInward: {
    key: "stockInwardDetails",
    typeLabel: "Stock Inward Details",
    quantityLabel: "Received Quantity",
    quantityKey: "quantityReceived",
    priceLabel: "Negotiated Unit Cost",
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
  CREATED: "Created",
  DELIVERED: "Delivered",
  INBOUND: "Inbound",
  LOW_STOCK: "Low Stock",
  ORDERED: "Ordered",
  PENDING_APPROVAL: "Pending Approval",
  OUTBOUND: "Outbound",
  OUT_OF_STOCK: "Out of Stock",
  PARTIALLY_RECEIVED: "Partially Received",
  PENDING: "Pending",
  PROCESSING: "Processing",
  RECEIVED: "Received",
  REJECTED: "Rejected",
  STOCK_IN: "Stock In",
  STOCK_OUT: "Stock Out",
  TRANSFER: "Transfer",
  UPDATED: "Updated",
  CONVERTED: "Converted",
};

const PAGE_SIZE = 10;

const EMPTY_INWARD_ITEM = {
  productId: "",
  quantityReceived: "",
  negotiatedPrice: "",
  actualPrice: "",
};

function createStockInwardCode() {
  return `INW${Date.now()}`;
}

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

function formatSignedQuantity(value) {
  const amount = Number(value || 0);
  return amount > 0 ? `+${amount}` : String(amount);
}

function getStatusTone(status) {
  const normalizedValue = String(status || "").toUpperCase();

  if (
    ["REJECTED", "CANCELLED", "OUT_OF_STOCK", "STOCK_OUT", "OUTBOUND"].includes(
      normalizedValue
    )
  ) {
    return "danger";
  }

  if (
    ["PENDING", "PENDING_APPROVAL", "PROCESSING", "ORDERED", "PARTIALLY_RECEIVED", "LOW_STOCK"].includes(
      normalizedValue
    )
  ) {
    return "warning";
  }

  if (
    ["APPROVED", "RECEIVED", "DELIVERED", "AVAILABLE", "STOCK_IN", "INBOUND", "COMPLETED"].includes(
      normalizedValue
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

function matchesSearch(searchTerm, fields) {
  const normalizedSearch = String(searchTerm || "").trim().toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  return fields.some((field) => String(field || "").toLowerCase().includes(normalizedSearch));
}

function clampPage(page, totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  return Math.min(Math.max(page, 1), totalPages);
}

function buildItemRowsFromPurchaseOrderDetails(details) {
  if (!details.length) {
    return [EMPTY_INWARD_ITEM];
  }

  return details.map((detail) => ({
    productId: String(detail.productId ?? ""),
    quantityReceived: String(detail.orderedQuantity ?? ""),
    negotiatedPrice: String(detail.unitPriceEstimated ?? ""),
    actualPrice: String(detail.unitPriceEstimated ?? ""),
  }));
}

function PurchaseEmptyState({ title, description }) {
  return (
    <div className="purchase-empty-state">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}

function PurchaseSectionHeader({
  eyebrow,
  title,
  description,
  meta,
  action = null,
}) {
  return (
    <div className="purchase-section-header">
      <div className="purchase-section-copy">
        <p className="purchase-section-eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      <div className="purchase-section-actions">
        {meta ? <span className="purchase-section-meta">{meta}</span> : null}
        {action}
      </div>
    </div>
  );
}

function Pagination({ currentPage, totalItems, onChange }) {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="purchase-pagination" aria-label="Pagination">
      <button
        type="button"
        className="purchase-pagination-button"
        disabled={currentPage === 1}
        onClick={() => onChange(currentPage - 1)}
      >
        «
      </button>

      {Array.from({ length: totalPages }, (_, index) => {
        const page = index + 1;

        return (
          <button
            key={page}
            type="button"
            className={
              page === currentPage
                ? "purchase-pagination-button active"
                : "purchase-pagination-button"
            }
            onClick={() => onChange(page)}
          >
            {page}
          </button>
        );
      })}

      <button
        type="button"
        className="purchase-pagination-button"
        disabled={currentPage === totalPages}
        onClick={() => onChange(currentPage + 1)}
      >
        »
      </button>
    </div>
  );
}

const PurchaseStaffDashboardPage = ({ activeSection = "overview" }) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [supplierSearchTerm, setSupplierSearchTerm] = useState("");
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");
  const [purchaseRequestSearchTerm, setPurchaseRequestSearchTerm] = useState("");
  const [purchaseOrderSearchTerm, setPurchaseOrderSearchTerm] = useState("");
  const [goodsReceiptSearchTerm, setGoodsReceiptSearchTerm] = useState("");
  const [movementSearchTerm, setMovementSearchTerm] = useState("");
  const [isSubmittingStockInward, setIsSubmittingStockInward] = useState(false);
  const [isCreatingPurchaseOrder, setIsCreatingPurchaseOrder] = useState(false);
  const [pages, setPages] = useState({
    suppliers: 1,
    inventory: 1,
    purchaseRequests: 1,
    purchaseOrders: 1,
    goodsReceipts: 1,
    inventoryMovements: 1,
  });
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
  const [purchaseOrderEditor, setPurchaseOrderEditor] = useState({
    isOpen: false,
    isLoading: false,
    isSubmitting: false,
    orderId: null,
    orderCode: "",
    requesterName: "",
    warehouseName: "",
    orderDate: "",
    status: "approved",
    supplierId: "",
    notes: "",
  });
  const [dashboardData, setDashboardData] = useState({
    suppliers: [],
    inventories: [],
    purchaseRequests: [],
    purchaseOrders: [],
    goodsReceipts: [],
    inventoryMovements: [],
    warehouses: [],
    products: [],
  });
  const [stockInwardForm, setStockInwardForm] = useState({
    stockInwardCode: createStockInwardCode(),
    warehouseId: "",
    purchaseOrderId: "",
    note: "",
    items: [EMPTY_INWARD_ITEM],
  });

  const showMessage = React.useCallback((nextMessage) => {
    setMessage(nextMessage);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setMessage("");
    }, 4000);
  }, []);

  const loadDashboardData = React.useCallback(async () => {
    setIsLoading(true);

    try {
      const [
        supplierResult,
        inventoryResult,
        purchaseRequestResult,
        purchaseOrderResult,
        goodsReceiptResult,
        movementResult,
        warehouseResult,
        productResult,
      ] = await Promise.allSettled([
        ApiService.getAllSuppliers(),
        ApiService.getAllInventories(),
        ApiService.getAllPurchaseRequests(),
        ApiService.getAllPurchaseOrders(),
        ApiService.getAllStockInwards(),
        ApiService.getInventoryMovements(),
        ApiService.getAllWarehouses(),
        ApiService.getAllProducts(),
      ]);

      const nextData = {
        suppliers:
          supplierResult.status === "fulfilled"
            ? supplierResult.value?.suppliers || []
            : [],
        inventories:
          inventoryResult.status === "fulfilled"
            ? inventoryResult.value?.inventories || []
            : [],
        purchaseRequests:
          purchaseRequestResult.status === "fulfilled"
            ? purchaseRequestResult.value?.purchaseRequests || []
            : [],
        purchaseOrders:
          purchaseOrderResult.status === "fulfilled"
            ? purchaseOrderResult.value?.purchaseOrders || []
            : [],
        goodsReceipts:
          goodsReceiptResult.status === "fulfilled"
            ? normalizeCollection(goodsReceiptResult.value, "stockInwards")
            : [],
        inventoryMovements:
          movementResult.status === "fulfilled"
            ? normalizeCollection(movementResult.value, "inventoryMovements")
            : [],
        warehouses:
          warehouseResult.status === "fulfilled"
            ? warehouseResult.value?.warehouses || []
            : [],
        products:
          productResult.status === "fulfilled"
            ? productResult.value?.products || []
            : [],
      };

      setDashboardData(nextData);
      setStockInwardForm((currentValue) => ({
        ...currentValue,
        warehouseId:
          currentValue.warehouseId || String(nextData.warehouses[0]?.id ?? ""),
      }));

      const errors = [
        supplierResult,
        inventoryResult,
        purchaseRequestResult,
        purchaseOrderResult,
        goodsReceiptResult,
        movementResult,
        warehouseResult,
        productResult,
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

  function closePurchaseOrderEditor() {
    setPurchaseOrderEditor({
      isOpen: false,
      isLoading: false,
      isSubmitting: false,
      orderId: null,
      orderCode: "",
      requesterName: "",
      warehouseName: "",
      orderDate: "",
      status: "approved",
      supplierId: "",
      notes: "",
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
      subtitle: `${row.partner} | ${row.warehouse}`,
      status: row.status,
      error: "",
      items: [],
      config,
    });

    try {
      const response = await config.loader(row.id);

      setDetailDialog((currentValue) => ({
        ...currentValue,
        isLoading: false,
        items: normalizeCollection(response, config.key),
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

  async function openPurchaseOrderEditor(orderId) {
    closeDetailDialog();
    setPurchaseOrderEditor({
      isOpen: true,
      isLoading: true,
      isSubmitting: false,
      orderId,
      orderCode: "",
        requesterName: "",
        warehouseName: "",
        orderDate: "",
        status: "approved",
        supplierId: "",
        notes: "",
      });

    try {
      const response = await ApiService.getPurchaseOrderById(orderId);
      const purchaseOrder = response?.purchaseOrder || response?.data;

      setPurchaseOrderEditor({
        isOpen: true,
        isLoading: false,
        isSubmitting: false,
        orderId: purchaseOrder?.id ?? orderId,
        orderCode: purchaseOrder?.orderCode || "",
        requesterName: purchaseOrder?.requesterName || "",
        warehouseName: purchaseOrder?.warehouseName || "",
        orderDate: purchaseOrder?.orderDate || "",
        status: purchaseOrder?.status || "approved",
        supplierId: String(purchaseOrder?.supplierId ?? ""),
        notes: purchaseOrder?.notes || "",
      });
    } catch (error) {
      closePurchaseOrderEditor();
      showMessage(
        error.response?.data?.message || "Unable to load purchase order for editing."
      );
    }
  }

  const {
    suppliers,
    inventories,
    purchaseRequests,
    purchaseOrders,
    goodsReceipts,
    inventoryMovements,
    warehouses,
    products,
  } = dashboardData;

  const supplierRows = useMemo(
    () =>
      suppliers.map((supplier) => ({
        id: supplier.id,
        name: supplier.name || "Unnamed Supplier",
        contactInfo: supplier.contactInfo || "Not Available",
        address: supplier.address || "Not Available",
      })),
    [suppliers]
  );

  const inventoryRows = useMemo(
    () =>
      inventories
        .map((inventory) => ({
          id: inventory.inventoryId,
          productName: inventory.productName || "Unnamed Product",
          productSku: inventory.productSku || "N/A",
          warehouseName: inventory.warehouseName || "Unassigned",
          quantityOnHand: inventory.quantityOnHand || 0,
          lowStockThreshold: inventory.lowStockThreshold || 0,
          status: formatStatus(inventory.status),
          rawStatus: inventory.status,
        }))
        .sort((left, right) => right.quantityOnHand - left.quantityOnHand),
    [inventories]
  );

  const purchaseOrderRows = useMemo(
    () =>
      purchaseOrders
        .map((order) => ({
          id: order.id,
          code: order.orderCode || `PO-${order.id}`,
          partner: order.supplierName || "Supplier Not Assigned",
          warehouse: order.warehouseName || "Unassigned",
          totalItems: order.totalItems || 0,
          status: formatStatus(order.status),
          rawStatus: order.status,
          updatedAt: order.updatedAt || order.createdAt || order.orderDate,
          supplierId: order.supplierId ?? null,
          warehouseId: order.warehouseId ?? null,
        }))
        .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0)),
    [purchaseOrders]
  );

  const purchaseRequestRows = useMemo(
    () =>
      purchaseRequests
        .map((request) => ({
          id: request.id,
          code: request.requestCode || `PR-${request.id}`,
          requester: request.requesterName || "Requester Not Assigned",
          warehouse: request.warehouseName || "Unassigned",
          totalItems: request.totalItems || 0,
          estimatedAmount: request.totalEstimatedAmount || 0,
          status: formatStatus(request.status),
          rawStatus: request.status,
          updatedAt: request.updatedAt || request.createdAt || request.requestDate,
          notes: request.notes || "",
          supplierId: request.supplierId ?? null,
        }))
        .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0)),
    [purchaseRequests]
  );

  const goodsReceiptRows = useMemo(
    () =>
      goodsReceipts
        .map((receipt) => ({
          id: receipt.stockInwardId,
          code: receipt.inwardCode || `INW-${receipt.stockInwardId}`,
          partner: receipt.supplierName || "Supplier Not Assigned",
          warehouse: receipt.warehouseName || "Unassigned",
          totalItems: receipt.totalReceivedQuantity || receipt.totalItems || 0,
          status: formatStatus(receipt.status),
          rawStatus: receipt.status,
          updatedAt: receipt.createdAt || receipt.inwardDate,
        }))
        .sort((left, right) => new Date(right.updatedAt || 0) - new Date(left.updatedAt || 0)),
    [goodsReceipts]
  );

  const movementRows = useMemo(
    () =>
      inventoryMovements
        .map((movement) => ({
          id: movement.movementId,
          createdAt: movement.createdAt,
          product: movement.productName || "Unnamed Product",
          productSku: movement.productSku || "N/A",
          warehouse: movement.warehouseName || "Unassigned",
          movementType: formatStatus(movement.movementType),
          rawMovementType: movement.movementType,
          reference: movement.referenceCode || movement.referenceId || "Manual",
          referenceType: formatStatus(movement.referenceType),
          actor: movement.actorUserName || "System",
          before: movement.quantityBefore || 0,
          delta: Number(movement.quantityDelta || 0),
          after: movement.quantityAfter || 0,
        }))
        .sort((left, right) => new Date(right.createdAt || 0) - new Date(left.createdAt || 0)),
    [inventoryMovements]
  );

  const filteredSuppliers = useMemo(
    () =>
      supplierRows.filter((supplier) =>
        matchesSearch(supplierSearchTerm, [
          supplier.name,
          supplier.contactInfo,
          supplier.address,
        ])
      ),
    [supplierRows, supplierSearchTerm]
  );

  const filteredInventories = useMemo(
    () =>
      inventoryRows.filter((inventory) =>
        matchesSearch(inventorySearchTerm, [
          inventory.productName,
          inventory.productSku,
          inventory.warehouseName,
          inventory.status,
        ])
      ),
    [inventoryRows, inventorySearchTerm]
  );

  const filteredPurchaseRequestRows = useMemo(
    () =>
      purchaseRequestRows.filter((row) =>
        matchesSearch(purchaseRequestSearchTerm, [
          row.code,
          row.requester,
          row.warehouse,
          row.status,
        ])
      ),
    [purchaseRequestRows, purchaseRequestSearchTerm]
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

  const filteredInventoryMovements = useMemo(
    () =>
      movementRows.filter((row) =>
        matchesSearch(movementSearchTerm, [
          row.product,
          row.productSku,
          row.warehouse,
          row.movementType,
          row.reference,
          row.referenceType,
          row.actor,
        ])
      ),
    [movementRows, movementSearchTerm]
  );

  const overviewCards = useMemo(
    () => [
      {
        label: "Suppliers",
        value: suppliers.length,
        helper: "Active supplier records",
      },
      {
        label: "Inventory Rows",
        value: inventories.length,
        helper: "Tracked stock lines",
      },
      {
        label: "Approved Requests",
        value: purchaseRequests.filter((request) =>
          ["approved", "converted"].includes(String(request.status || "").toLowerCase())
        ).length,
        helper: "Ready for procurement",
      },
      {
        label: "Purchase Orders",
        value: purchaseOrders.length,
        helper: "Inbound procurement documents",
      },
      {
        label: "Stock Inwards",
        value: goodsReceipts.length,
        helper: "Receiving documents on file",
      },
    ],
    [
      goodsReceipts.length,
      inventories.length,
      purchaseOrders.length,
      purchaseRequests,
      suppliers.length,
    ]
  );

  const pendingPurchaseCount = useMemo(
    () =>
      purchaseOrders.filter((order) =>
        ["PENDING", "PENDING_APPROVAL", "APPROVED", "ORDERED", "PARTIALLY_RECEIVED", "PROCESSING"].includes(
          String(order.status || "").toUpperCase()
        )
      ).length,
    [purchaseOrders]
  );

  const selectedPurchaseOrder = useMemo(
    () =>
      purchaseOrderRows.find(
        (order) => String(order.id) === String(stockInwardForm.purchaseOrderId || "")
      ) || null,
    [purchaseOrderRows, stockInwardForm.purchaseOrderId]
  );

  const stockInwardEligibleOrders = useMemo(
    () =>
      purchaseOrderRows.filter((order) =>
        ["ordered", "partially_received"].includes(String(order.rawStatus || "").toLowerCase())
      ),
    [purchaseOrderRows]
  );

  const selectedSupplier = useMemo(() => {
    if (!selectedPurchaseOrder?.supplierId) {
      return null;
    }

    return (
      suppliers.find(
        (supplier) =>
          String(supplier.id) === String(selectedPurchaseOrder.supplierId)
      ) || null
    );
  }, [selectedPurchaseOrder, suppliers]);

  const selectedEditSupplier = useMemo(
    () =>
      suppliers.find(
        (supplier) => String(supplier.id) === String(purchaseOrderEditor.supplierId)
      ) || null,
    [purchaseOrderEditor.supplierId, suppliers]
  );

  const activeCopy = SECTION_COPY[activeSection] || SECTION_COPY.overview;

  function paginate(rows, section) {
    const currentPage = clampPage(pages[section], rows.length);
    const startIndex = (currentPage - 1) * PAGE_SIZE;

    return {
      currentPage,
      rows: rows.slice(startIndex, startIndex + PAGE_SIZE),
      startIndex,
    };
  }

  function resetStockInwardForm(defaultWarehouseId = stockInwardForm.warehouseId) {
    setStockInwardForm({
      stockInwardCode: createStockInwardCode(),
      warehouseId: defaultWarehouseId || String(warehouses[0]?.id ?? ""),
      purchaseOrderId: "",
      note: "",
      items: [EMPTY_INWARD_ITEM],
    });
  }

  function handleStockInwardChange(event) {
    const { name, value } = event.target;
    setStockInwardForm((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
  }

  function handlePurchaseOrderEditChange(event) {
    const { name, value } = event.target;
    setPurchaseOrderEditor((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
  }

  async function handlePurchaseOrderSelection(event) {
    const selectedOrderId = event.target.value;
    const selectedOrder =
      stockInwardEligibleOrders.find((order) => String(order.id) === String(selectedOrderId)) || null;

    setStockInwardForm((currentValue) => ({
      ...currentValue,
      purchaseOrderId: selectedOrderId,
      warehouseId:
        selectedOrder?.warehouseId != null
          ? String(selectedOrder.warehouseId)
          : currentValue.warehouseId,
      items: selectedOrderId ? currentValue.items : [EMPTY_INWARD_ITEM],
    }));

    if (!selectedOrderId) {
      return;
    }

    try {
      const response = await ApiService.getPurchaseOrderDetails(selectedOrderId);
      const details = normalizeCollection(response, "purchaseOrderDetails");

      setStockInwardForm((currentValue) => ({
        ...currentValue,
        purchaseOrderId: selectedOrderId,
        items: buildItemRowsFromPurchaseOrderDetails(details),
      }));
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to load purchase order details."
      );
    }
  }

  function handleStockInwardItemChange(index, field, value) {
    setStockInwardForm((currentValue) => ({
      ...currentValue,
      items: currentValue.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addStockInwardItem() {
    setStockInwardForm((currentValue) => ({
      ...currentValue,
      items: [...currentValue.items, EMPTY_INWARD_ITEM],
    }));
  }

  function removeStockInwardItem(index) {
    setStockInwardForm((currentValue) => ({
      ...currentValue,
      items:
        currentValue.items.length === 1
          ? [EMPTY_INWARD_ITEM]
          : currentValue.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  }

  async function handleSubmitStockInward(event) {
    event.preventDefault();

    if (!stockInwardForm.warehouseId || !stockInwardForm.purchaseOrderId) {
      showMessage("Warehouse and purchase order are required.");
      return;
    }

    const normalizedItems = stockInwardForm.items
      .map((item) => ({
        productId: Number(item.productId),
        quantityReceived: Number(item.quantityReceived),
        unitPriceNegotiated: Number(item.negotiatedPrice),
        unitPurchasePrice: Number(item.actualPrice),
      }))
      .filter(
        (item) =>
          Number.isFinite(item.productId) &&
          item.productId > 0 &&
          item.quantityReceived > 0 &&
          item.unitPriceNegotiated >= 0 &&
          item.unitPurchasePrice >= 0
      );

    if (!normalizedItems.length) {
      showMessage("Add at least one valid receiving line item.");
      return;
    }

    const payload = {
      inwardCode: stockInwardForm.stockInwardCode,
      warehouseId: Number(stockInwardForm.warehouseId),
      purchaseOrderId: Number(stockInwardForm.purchaseOrderId),
      notes: stockInwardForm.note.trim(),
      items: normalizedItems,
    };

    setIsSubmittingStockInward(true);

    try {
      await ApiService.createStockInward(payload);
      await loadDashboardData();
      showMessage("Stock inward created successfully.");
      resetStockInwardForm(String(stockInwardForm.warehouseId));
      navigate(PATHS.dashboardGoodsReceipts);
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Unable to create stock inward with the current payload."
      );
    } finally {
      setIsSubmittingStockInward(false);
    }
  }

  async function submitPurchaseOrderEditor(mode = "save") {
    if (!purchaseOrderEditor.orderId) {
      return;
    }

    if (!purchaseOrderEditor.supplierId) {
      showMessage("Supplier is required.");
      return;
    }

    const nextStatus = mode === "send" ? "ordered" : null;

    if (
      mode === "send" &&
      !["approved", "pending_approval"].includes(
        String(purchaseOrderEditor.status || "").toLowerCase()
      )
    ) {
      showMessage("Only ready purchase orders can be sent to the supplier.");
      return;
    }

    setPurchaseOrderEditor((currentValue) => ({
      ...currentValue,
      isSubmitting: true,
    }));

    try {
      await ApiService.updatePurchaseOrder(purchaseOrderEditor.orderId, {
        supplierId: Number(purchaseOrderEditor.supplierId),
        notes: purchaseOrderEditor.notes.trim(),
        ...(nextStatus ? { status: nextStatus } : {}),
      });
      await loadDashboardData();
      closePurchaseOrderEditor();
      showMessage(
        mode === "send"
          ? "Purchase order sent successfully."
          : "Purchase order updated successfully."
      );
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to update the purchase order."
      );
      setPurchaseOrderEditor((currentValue) => ({
        ...currentValue,
        isSubmitting: false,
      }));
    }
  }

  async function handleCreatePurchaseOrderFromRequest(row) {
    setIsCreatingPurchaseOrder(true);

    try {
      const response = await ApiService.createPurchaseOrder({
        purchaseRequestId: Number(row.id),
        supplierId: row.supplierId || null,
        notes: row.notes || "",
      });

      const createdPurchaseOrder = response?.data || response?.purchaseOrder || null;
      await loadDashboardData();
      navigate(PATHS.dashboardPurchaseOrders);

      if (createdPurchaseOrder?.id) {
        await openPurchaseOrderEditor(createdPurchaseOrder.id);
      }

      showMessage(
        "Purchase order created. Choose the supplier if needed, then send it to the supplier."
      );
    } catch (error) {
      showMessage(
        error.response?.data?.message ||
          "Unable to convert the purchase request into a purchase order."
      );
    } finally {
      setIsCreatingPurchaseOrder(false);
    }
  }

  function renderOverview() {
    return (
      <>
        <section className="purchase-stats-grid">
          {overviewCards.map((card) => (
            <article key={card.label} className="purchase-stat-card">
              <span>{card.label}</span>
              <strong>{formatCompactNumber(card.value)}</strong>
              <p>{card.helper}</p>
            </article>
          ))}
        </section>

        <section className="purchase-overview-grid">
          <article className="purchase-panel">
            <div className="purchase-panel-heading">
              <div>
                <p className="purchase-panel-label">Priority View</p>
                <h2>Inbound workload</h2>
              </div>
            </div>

            <div className="purchase-kpi-strip">
              <div>
                <span>Pending Orders</span>
                <strong>{formatCompactNumber(pendingPurchaseCount)}</strong>
              </div>
              <div>
                <span>Inventory Rows</span>
                <strong>{formatCompactNumber(inventories.length)}</strong>
              </div>
              <div>
                <span>Movements</span>
                <strong>{formatCompactNumber(inventoryMovements.length)}</strong>
              </div>
            </div>

            <div className="purchase-quick-grid">
              <div className="purchase-quick-card">
                <strong>Suppliers</strong>
                <span>Keep supplier records clean for inbound flows.</span>
              </div>
              <div className="purchase-quick-card">
                <strong>Inventory</strong>
                <span>Review current stock before receiving new goods.</span>
              </div>
              <div className="purchase-quick-card">
                <strong>Purchase Requests</strong>
                <span>Convert approved warehouse requests into supplier orders.</span>
              </div>
              <div className="purchase-quick-card">
                <strong>Purchase Orders</strong>
                <span>Assign suppliers and send approved orders out.</span>
              </div>
              <div className="purchase-quick-card">
                <strong>Create Stock Inward</strong>
                <span>Receive ordered items with a structured form.</span>
              </div>
            </div>
          </article>

          <article className="purchase-panel">
            <div className="purchase-panel-heading">
              <div>
                <p className="purchase-panel-label">Recent Suppliers</p>
                <h2>Latest supplier records</h2>
              </div>
            </div>

            {filteredSuppliers.slice(0, 5).length ? (
              <div className="purchase-list">
                {filteredSuppliers.slice(0, 5).map((supplier) => (
                  <div key={supplier.id} className="purchase-list-row">
                    <div>
                      <strong>{supplier.name}</strong>
                      <p>{supplier.contactInfo}</p>
                    </div>
                    <span>{supplier.address}</span>
                  </div>
                ))}
              </div>
            ) : (
              <PurchaseEmptyState
                title="No suppliers yet"
                description="Supplier records will appear here when data is available."
              />
            )}
          </article>
        </section>
      </>
    );
  }

  function renderSuppliers() {
    const { currentPage, rows, startIndex } = paginate(filteredSuppliers, "suppliers");

    return (
      <section className="purchase-section-card">
        <PurchaseSectionHeader
          eyebrow="Supplier Directory"
          title="Supplier Records"
          description="Keep contact details and supplier addresses aligned with the inbound purchasing workflow."
          meta={`${formatCompactNumber(filteredSuppliers.length)} records`}
        />

        <div className="purchase-toolbar">
          <input
            className="purchase-search-input"
            value={supplierSearchTerm}
            onChange={(event) => setSupplierSearchTerm(event.target.value)}
            placeholder="Search by supplier name, contact info, or address"
          />
        </div>

        {rows.length ? (
          <>
            <div className="purchase-table-shell">
              <table className="purchase-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Supplier Name</th>
                    <th>Contact Info</th>
                    <th>Address</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((supplier, index) => (
                    <tr key={supplier.id}>
                      <td>{startIndex + index + 1}</td>
                      <td>
                        <strong>{supplier.name}</strong>
                      </td>
                      <td>{supplier.contactInfo}</td>
                      <td>{supplier.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredSuppliers.length}
              onChange={(page) => updatePage("suppliers", page)}
            />
          </>
        ) : (
          <PurchaseEmptyState
            title="No suppliers match"
            description="Try a different supplier search term."
          />
        )}
      </section>
    );
  }

  function renderInventory() {
    const { currentPage, rows, startIndex } = paginate(filteredInventories, "inventory");

    return (
      <section className="purchase-section-card">
        <PurchaseSectionHeader
          eyebrow="Live Inventory"
          title="Inventory Snapshot"
          description="Review stock by product and warehouse before creating a new receipt or following up with suppliers."
          meta={`${formatCompactNumber(filteredInventories.length)} inventory rows`}
        />

        <div className="purchase-toolbar">
          <input
            className="purchase-search-input"
            value={inventorySearchTerm}
            onChange={(event) => setInventorySearchTerm(event.target.value)}
            placeholder="Search by product, SKU, warehouse, or status"
          />
        </div>

        {rows.length ? (
          <>
            <div className="purchase-table-shell">
              <table className="purchase-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Product</th>
                    <th>Warehouse</th>
                    <th>On Hand</th>
                    <th>Threshold</th>
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
                      <td>{inventory.quantityOnHand}</td>
                      <td>{inventory.lowStockThreshold}</td>
                      <td>
                        <span className={`purchase-badge tone-${getStatusTone(inventory.rawStatus)}`}>
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
          <PurchaseEmptyState
            title="No inventory rows match"
            description="Try a different inventory search term."
          />
        )}
      </section>
    );
  }

  function renderPurchaseOrders() {
    const { currentPage, rows, startIndex } = paginate(
      filteredPurchaseOrderRows,
      "purchaseOrders"
    );

    return (
      <section className="purchase-section-card">
        <PurchaseSectionHeader
          eyebrow="Procurement Flow"
          title="Purchase Order Tracking"
          description="Monitor approved supplier orders, receipt progress, and the latest warehouse follow-up activity."
          meta={`${formatCompactNumber(filteredPurchaseOrderRows.length)} orders`}
        />

        <div className="purchase-toolbar">
          <input
            className="purchase-search-input"
            value={purchaseOrderSearchTerm}
            onChange={(event) => setPurchaseOrderSearchTerm(event.target.value)}
            placeholder="Search by code, supplier, warehouse, or status"
          />
        </div>

        {rows.length ? (
          <>
            <div className="purchase-table-shell">
              <table className="purchase-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Code</th>
                    <th>Supplier</th>
                    <th>Warehouse</th>
                    <th>Items</th>
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
                      <td>{row.partner}</td>
                      <td>{row.warehouse}</td>
                      <td>{row.totalItems}</td>
                      <td>
                        <span className={`purchase-badge tone-${getStatusTone(row.rawStatus)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>{formatDate(row.updatedAt)}</td>
                      <td>
                        <div className="purchase-row-actions">
                          <button
                            type="button"
                            className="purchase-row-action"
                            onClick={() => openOrderDetails("purchaseOrder", row)}
                          >
                            Details
                          </button>
                          <button
                            type="button"
                            className="purchase-row-action secondary"
                            onClick={() => openPurchaseOrderEditor(row.id)}
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredPurchaseOrderRows.length}
              onChange={(page) => updatePage("purchaseOrders", page)}
            />
          </>
        ) : (
          <PurchaseEmptyState
            title="No purchase orders match"
            description="Try a different purchase order search term."
          />
        )}
      </section>
    );
  }

  function renderPurchaseRequests() {
    const { currentPage, rows, startIndex } = paginate(
      filteredPurchaseRequestRows,
      "purchaseRequests"
    );
    const approvedRequestCount = filteredPurchaseRequestRows.filter(
      (row) => String(row.rawStatus || "").toLowerCase() === "approved"
    ).length;

    return (
      <section className="purchase-section-card">
        <PurchaseSectionHeader
          eyebrow="Upstream Requests"
          title="Warehouse Purchase Requests"
          description="Review manager-approved warehouse requests, inspect line items, and convert approved requests into supplier purchase orders."
          meta={`${formatCompactNumber(approvedRequestCount)} approved requests ready`}
        />

        <div className="purchase-toolbar">
          <input
            className="purchase-search-input"
            value={purchaseRequestSearchTerm}
            onChange={(event) => setPurchaseRequestSearchTerm(event.target.value)}
            placeholder="Search by code, requester, warehouse, or status"
          />
        </div>

        {rows.length ? (
          <>
            <div className="purchase-table-shell">
              <table className="purchase-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Request Code</th>
                    <th>Requester</th>
                    <th>Warehouse</th>
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
                      <td>{row.requester}</td>
                      <td>{row.warehouse}</td>
                      <td>{row.totalItems}</td>
                      <td>{formatCurrency(row.estimatedAmount)}</td>
                      <td>
                        <span className={`purchase-badge tone-${getStatusTone(row.rawStatus)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>{formatDate(row.updatedAt)}</td>
                      <td>
                        <div className="purchase-row-actions">
                          <button
                            type="button"
                            className="purchase-row-action"
                            onClick={() => openOrderDetails("purchaseRequest", row)}
                          >
                            Details
                          </button>
                          {String(row.rawStatus || "").toLowerCase() === "approved" ? (
                            <button
                              type="button"
                              className="purchase-row-action secondary"
                              onClick={() => handleCreatePurchaseOrderFromRequest(row)}
                              disabled={isCreatingPurchaseOrder}
                            >
                              {isCreatingPurchaseOrder ? "Creating..." : "Create PO"}
                            </button>
                          ) : null}
                        </div>
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
          <PurchaseEmptyState
            title="No purchase requests match"
            description="Approved warehouse requests will appear here for the purchasing team."
          />
        )}
      </section>
    );
  }

  function renderGoodsReceipts() {
    const { currentPage, rows, startIndex } = paginate(
      filteredGoodsReceiptRows,
      "goodsReceipts"
    );

    return (
      <section className="purchase-section-card">
        <PurchaseSectionHeader
          eyebrow="Receiving Workspace"
          title="Stock Inward Dashboard"
          description="Review inbound receipts and launch the receiving form directly from the stock inward workspace."
          meta={`${formatCompactNumber(filteredGoodsReceiptRows.length)} receipts`}
          action={
            <button
              type="button"
              className="purchase-primary-action"
              onClick={() => navigate(PATHS.dashboardCreateStockInward)}
            >
              Create Stock Inward
            </button>
          }
        />

        <div className="purchase-toolbar">
          <input
            className="purchase-search-input"
            value={goodsReceiptSearchTerm}
            onChange={(event) => setGoodsReceiptSearchTerm(event.target.value)}
            placeholder="Search by code, supplier, warehouse, or status"
          />
        </div>

        {rows.length ? (
          <>
            <div className="purchase-table-shell">
              <table className="purchase-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Code</th>
                    <th>Supplier</th>
                    <th>Warehouse</th>
                    <th>Received Quantity</th>
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
                      <td>{row.partner}</td>
                      <td>{row.warehouse}</td>
                      <td>{row.totalItems}</td>
                      <td>
                        <span className={`purchase-badge tone-${getStatusTone(row.rawStatus)}`}>
                          {row.status}
                        </span>
                      </td>
                      <td>{formatDate(row.updatedAt)}</td>
                      <td>
                        <button
                          type="button"
                          className="purchase-row-action"
                          onClick={() => openOrderDetails("stockInward", row)}
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
              totalItems={filteredGoodsReceiptRows.length}
              onChange={(page) => updatePage("goodsReceipts", page)}
            />
          </>
        ) : (
          <PurchaseEmptyState
            title="No stock inwards match"
            description="Try a different stock inward search term."
          />
        )}
      </section>
    );
  }

  function renderInventoryMovements() {
    const { currentPage, rows, startIndex } = paginate(
      filteredInventoryMovements,
      "inventoryMovements"
    );

    return (
      <section className="purchase-section-card">
        <PurchaseSectionHeader
          eyebrow="Audit Trail"
          title="Inventory Movement History"
          description="Trace stock increases and decreases across warehouses, purchase receipts, and operator actions."
          meta={`${formatCompactNumber(filteredInventoryMovements.length)} movements`}
        />

        <div className="purchase-toolbar">
          <input
            className="purchase-search-input"
            value={movementSearchTerm}
            onChange={(event) => setMovementSearchTerm(event.target.value)}
            placeholder="Search by product, warehouse, movement type, actor, or reference"
          />
        </div>

        {rows.length ? (
          <>
            <div className="purchase-table-shell">
              <table className="purchase-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Timestamp</th>
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
                  {rows.map((row, index) => (
                    <tr key={row.id}>
                      <td>{startIndex + index + 1}</td>
                      <td>{formatDate(row.createdAt)}</td>
                      <td>
                        <strong>{row.product}</strong>
                        <span>{row.productSku}</span>
                      </td>
                      <td>{row.warehouse}</td>
                      <td>
                        <span
                          className={`purchase-badge tone-${getStatusTone(
                            row.rawMovementType
                          )}`}
                        >
                          {row.movementType}
                        </span>
                      </td>
                      <td>
                        <strong>{row.reference}</strong>
                        <span>{row.referenceType}</span>
                      </td>
                      <td>{row.actor}</td>
                      <td>{row.before}</td>
                      <td className={row.delta >= 0 ? "movement-up" : "movement-down"}>
                        {formatSignedQuantity(row.delta)}
                      </td>
                      <td>{row.after}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredInventoryMovements.length}
              onChange={(page) => updatePage("inventoryMovements", page)}
            />
          </>
        ) : (
          <PurchaseEmptyState
            title="No inventory movements match"
            description="Inventory movement history will appear here when activity exists."
          />
        )}
      </section>
    );
  }

  function renderCreateStockInward() {
    return (
      <section className="purchase-section-card purchase-section-card-form">
        <PurchaseSectionHeader
          eyebrow="Receiving Form"
          title="Create Stock Inward"
          description="Use the purchase order details below to draft a stock inward document for manager approval before warehouse receipt."
          action={
            <button
              type="button"
              className="purchase-secondary-action"
              onClick={() => navigate(PATHS.dashboardGoodsReceipts)}
            >
              Back to Stock Inwards
            </button>
          }
        />

        <form className="stock-inward-form" onSubmit={handleSubmitStockInward}>
          <div className="stock-inward-form-grid">
            <div className="stock-inward-form-main">
              <label>
                Stock Inward Code
                <input
                  name="stockInwardCode"
                  value={stockInwardForm.stockInwardCode}
                  onChange={handleStockInwardChange}
                />
              </label>

              <label>
                Warehouse
                <select
                  name="warehouseId"
                  value={stockInwardForm.warehouseId}
                  onChange={handleStockInwardChange}
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.name || `Warehouse ${warehouse.id}`}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Purchase Order
                <select
                  name="purchaseOrderId"
                  value={stockInwardForm.purchaseOrderId}
                  onChange={handlePurchaseOrderSelection}
                >
                  <option value="">Select purchase order</option>
                  {stockInwardEligibleOrders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.code}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Notes
                <textarea
                  name="note"
                  value={stockInwardForm.note}
                  onChange={handleStockInwardChange}
                  rows={4}
                  placeholder="Add receiving notes"
                />
              </label>
            </div>

            <aside className="stock-inward-supplier-card">
              <strong>Supplier Information</strong>
              {selectedPurchaseOrder ? (
                <div className="stock-inward-supplier-details">
                  <p>
                    <span>Supplier</span>
                    {selectedPurchaseOrder.partner || "Not Available"}
                  </p>
                  <p>
                    <span>Warehouse</span>
                    {selectedPurchaseOrder.warehouse || "Not Available"}
                  </p>
                  <p>
                    <span>Contact</span>
                    {selectedSupplier?.contactInfo || "Not Available"}
                  </p>
                  <p>
                    <span>Address</span>
                    {selectedSupplier?.address || "Not Available"}
                  </p>
                </div>
              ) : (
                <p className="stock-inward-supplier-placeholder">
                  Select a purchase order to load supplier details.
                </p>
              )}
            </aside>
          </div>

          <div className="stock-inward-line-items">
            <div className="purchase-panel-heading">
              <div>
                <p className="purchase-panel-label">Line Items</p>
                <h2>Products to receive</h2>
              </div>
            </div>

            <div className="purchase-table-shell">
              <table className="purchase-table stock-inward-items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Negotiated Price</th>
                    <th>Actual Purchase Price</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {stockInwardForm.items.map((item, index) => (
                    <tr key={`stock-inward-item-${index}`}>
                      <td>
                        <select
                          value={item.productId}
                          onChange={(event) =>
                            handleStockInwardItemChange(index, "productId", event.target.value)
                          }
                        >
                          <option value="">Select product</option>
                          {products.map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.name || product.productName || `Product ${product.id}`}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.quantityReceived}
                          onChange={(event) =>
                            handleStockInwardItemChange(
                              index,
                              "quantityReceived",
                              event.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.negotiatedPrice}
                          onChange={(event) =>
                            handleStockInwardItemChange(
                              index,
                              "negotiatedPrice",
                              event.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.actualPrice}
                          onChange={(event) =>
                            handleStockInwardItemChange(
                              index,
                              "actualPrice",
                              event.target.value
                            )
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="stock-inward-remove-button"
                          onClick={() => removeStockInwardItem(index)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="stock-inward-actions-row">
              <button
                type="button"
                className="purchase-secondary-action"
                onClick={addStockInwardItem}
              >
                Add Product
              </button>
            </div>
          </div>

          <div className="stock-inward-footer">
            <button
              type="button"
              className="purchase-secondary-action"
              onClick={() => resetStockInwardForm(String(stockInwardForm.warehouseId))}
            >
              Reset
            </button>
            <button
              type="submit"
              className="purchase-primary-action"
              disabled={isSubmittingStockInward}
            >
              {isSubmittingStockInward ? "Creating..." : "Create Stock Inward"}
            </button>
          </div>
        </form>
      </section>
    );
  }

  function renderActiveSection() {
    if (activeSection === "suppliers") {
      return renderSuppliers();
    }

    if (activeSection === "inventory") {
      return renderInventory();
    }

    if (activeSection === "purchaseRequests") {
      return renderPurchaseRequests();
    }

    if (activeSection === "purchaseOrders") {
      return renderPurchaseOrders();
    }

    if (activeSection === "goodsReceipts") {
      return renderGoodsReceipts();
    }

    if (activeSection === "inventoryMovements") {
      return renderInventoryMovements();
    }

    if (activeSection === "createStockInward") {
      return renderCreateStockInward();
    }

    return renderOverview();
  }

  return (
    <MainLayout>
      {message ? <div className="message">{message}</div> : null}

      <div className="purchase-dashboard-page">
        <section className="purchase-page-shell">
          <div className="purchase-page-header">
            <div className="purchase-page-title">
              <span className="purchase-page-kicker">Purchase Dashboard</span>
              <h1>{activeCopy.title}</h1>
              <p>{activeCopy.subtitle}</p>
            </div>

            <div className="purchase-page-summary-card">
              <span>Quick Summary</span>
              <strong>{formatCompactNumber(pendingPurchaseCount)}</strong>
              <p>purchase orders still need follow-up or receiving attention.</p>
            </div>
          </div>

          {isLoading ? (
            <section className="purchase-loading-grid" aria-label="Loading purchase dashboard">
              <div className="purchase-loading-card" />
              <div className="purchase-loading-card" />
              <div className="purchase-loading-card" />
            </section>
          ) : (
            renderActiveSection()
          )}
        </section>
      </div>

      {detailDialog.isOpen ? (
        <div
          className="purchase-dialog-backdrop"
          role="presentation"
          onClick={closeDetailDialog}
        >
          <section
            className="purchase-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-detail-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="purchase-panel-heading purchase-dialog-heading">
              <div>
                <p className="purchase-panel-label">
                  {detailDialog.config?.typeLabel || "Details"}
                </p>
                <h2 id="purchase-detail-title">{detailDialog.title}</h2>
                <p className="purchase-dialog-subtitle">{detailDialog.subtitle}</p>
              </div>

              <div className="purchase-dialog-actions">
                {detailDialog.status ? (
                  <span className="purchase-badge tone-neutral">{detailDialog.status}</span>
                ) : null}
                <button
                  type="button"
                  className="purchase-link-button"
                  onClick={closeDetailDialog}
                >
                  Close
                </button>
              </div>
            </div>

            {detailDialog.isLoading ? (
              <PurchaseEmptyState
                title="Loading details"
                description="Fetching the latest document line items."
              />
            ) : detailDialog.error ? (
              <PurchaseEmptyState
                title="Unable to load details"
                description={detailDialog.error}
              />
            ) : detailDialog.items.length ? (
              <div className="purchase-table-shell">
                <table className="purchase-table">
                  <thead>
                    <tr>
                      <th>No.</th>
                      <th>Product</th>
                      <th>{detailDialog.config?.quantityLabel}</th>
                      <th>{detailDialog.config?.priceLabel}</th>
                      <th>{detailDialog.config?.totalLabel}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailDialog.items.map((item, index) => (
                      <tr key={`${detailDialog.title}-${index}`}>
                        <td>{index + 1}</td>
                        <td>
                          <strong>{item.productName || item.productSku || "N/A"}</strong>
                          <span>{item.productSku || "No SKU"}</span>
                        </td>
                        <td>{item[detailDialog.config?.quantityKey] || 0}</td>
                        <td>
                          {formatCurrency(
                            item[detailDialog.config?.priceKey] ??
                              item[detailDialog.config?.fallbackPriceKey]
                          )}
                        </td>
                        <td>{formatCurrency(item[detailDialog.config?.totalKey])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <PurchaseEmptyState
                title="No line items"
                description="This document does not contain any line items yet."
              />
            )}
          </section>
        </div>
      ) : null}

      {purchaseOrderEditor.isOpen ? (
        <div
          className="purchase-dialog-backdrop"
          role="presentation"
          onClick={closePurchaseOrderEditor}
        >
          <section
            className="purchase-dialog purchase-order-editor-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="purchase-order-editor-title"
            onClick={(event) => event.stopPropagation()}
          >
            <PurchaseSectionHeader
              eyebrow="Edit Purchase Order"
              title="Purchase Order Adjustment"
              description="Review supplier assignment, notes, and order status before saving or sending the purchase order."
            />

            {purchaseOrderEditor.isLoading ? (
              <PurchaseEmptyState
                title="Loading purchase order"
                description="Fetching the latest purchase order data."
              />
            ) : (
              <div className="purchase-order-editor-grid">
                <div className="purchase-order-editor-main">
                  <label>
                    Order Code
                    <input
                      className="purchase-form-control is-readonly"
                      value={purchaseOrderEditor.orderCode}
                      readOnly
                    />
                  </label>

                  <label>
                    Requester
                    <input
                      className="purchase-form-control is-readonly"
                      value={purchaseOrderEditor.requesterName}
                      readOnly
                    />
                  </label>

                  <label>
                    Warehouse
                    <input
                      className="purchase-form-control is-readonly"
                      value={purchaseOrderEditor.warehouseName}
                      readOnly
                    />
                  </label>

                  <label>
                    Order Date
                    <input
                      className="purchase-form-control is-readonly"
                      value={formatDate(purchaseOrderEditor.orderDate)}
                      readOnly
                    />
                  </label>

                  <label>
                    Status
                    <input
                      className="purchase-form-control is-readonly"
                      value={formatStatus(purchaseOrderEditor.status)}
                      readOnly
                    />
                  </label>
                </div>

                <div className="purchase-order-editor-side">
                  <label>
                    Supplier
                    <select
                      className="purchase-form-control"
                      name="supplierId"
                      value={purchaseOrderEditor.supplierId}
                      onChange={handlePurchaseOrderEditChange}
                    >
                      <option value="">Select supplier</option>
                      {suppliers.map((supplier) => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div className="purchase-order-editor-card">
                    <strong>Supplier Information</strong>
                    {selectedEditSupplier ? (
                      <div className="purchase-order-editor-card-copy">
                        <p>
                          <span>Contact</span>
                          {selectedEditSupplier.contactInfo || "Not Available"}
                        </p>
                        <p>
                          <span>Address</span>
                          {selectedEditSupplier.address || "Not Available"}
                        </p>
                      </div>
                    ) : (
                      <p className="stock-inward-supplier-placeholder">
                        Select a supplier to review contact details.
                      </p>
                    )}
                  </div>

                  <label>
                    Notes
                    <textarea
                      className="purchase-form-control purchase-form-textarea"
                      name="notes"
                      value={purchaseOrderEditor.notes}
                      onChange={handlePurchaseOrderEditChange}
                      rows={5}
                    />
                  </label>
                </div>
              </div>
            )}

            <div className="purchase-order-editor-actions">
              <button
                type="button"
                className="purchase-secondary-action"
                onClick={closePurchaseOrderEditor}
                disabled={purchaseOrderEditor.isSubmitting}
              >
                Back
              </button>
              <button
                type="button"
                className="purchase-primary-action"
                onClick={() => submitPurchaseOrderEditor("save")}
                disabled={purchaseOrderEditor.isLoading || purchaseOrderEditor.isSubmitting}
              >
                {purchaseOrderEditor.isSubmitting ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                className="purchase-primary-action purchase-primary-action-alt"
                onClick={() => submitPurchaseOrderEditor("send")}
                disabled={
                  purchaseOrderEditor.isLoading ||
                  purchaseOrderEditor.isSubmitting ||
                  !purchaseOrderEditor.supplierId
                }
              >
                Send Order
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </MainLayout>
  );
};

export default PurchaseStaffDashboardPage;
