import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { PATHS } from "../../constants/paths";
import ApiService from "../../services/ApiService";
import "./ManagerDashboardPage.css";

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
  salesOrders: {
    eyebrow: "Sales orders",
    title: "Recent outbound demand",
    description:
      "Monitor the latest customer orders, volumes, and order status from the sales pipeline.",
  },
  purchaseOrders: {
    eyebrow: "Purchase orders",
    title: "Inbound procurement status",
    description:
      "Watch supplier orders move from ordering into partial receipt and final receiving.",
  },
  goodsReceipts: {
    eyebrow: "Stock inwards",
    title: "Inbound receiving activity",
    description:
      "Follow the most recent stock inward documents, received quantities, and warehouse destinations.",
  },
};

const EMPTY_WAREHOUSE_FORM = {
  name: "",
  address: "",
};

const ROLE_SCOPE_ITEMS = [
  {
    path: PATHS.category,
    label: "Categories",
    description: "Maintain the product groups that define the warehouse catalog.",
    countKey: "categories",
  },
  {
    path: PATHS.supplier,
    label: "Suppliers",
    description: "Keep supplier records ready for purchasing and stock inward flows.",
    countKey: "suppliers",
  },
  {
    path: PATHS.product,
    label: "Products",
    description: "Control the product master data used across warehouses and orders.",
    countKey: "products",
  },
  {
    path: PATHS.dashboardWarehouses,
    label: "Warehouses",
    description: "Manage locations and assign products to the right warehouse.",
    countKey: "warehouses",
  },
];

const ROLE_FLOW_STEPS = [
  {
    title: "Master data",
    description: "Categories, suppliers, and products are the foundation for every warehouse flow.",
  },
  {
    title: "Warehouse setup",
    description: "Create warehouses, keep addresses current, and attach products to locations.",
  },
  {
    title: "Inventory control",
    description: "Track current stock, low-stock risk, and empty shelves before fulfillment slips.",
  },
  {
    title: "Order oversight",
    description: "Monitor sales orders, purchase orders, and stock inward activity from one place.",
  },
];

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
  const timeoutRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [warehouseForm, setWarehouseForm] = useState(EMPTY_WAREHOUSE_FORM);
  const [editingWarehouseId, setEditingWarehouseId] = useState(null);
  const [showWarehouseForm, setShowWarehouseForm] = useState(false);
  const [isSavingWarehouse, setIsSavingWarehouse] = useState(false);
  const [warehouseSearchTerm, setWarehouseSearchTerm] = useState("");
  const [inventorySearchTerm, setInventorySearchTerm] = useState("");
  const [salesOrderSearchTerm, setSalesOrderSearchTerm] = useState("");
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
    salesOrders: [],
    purchaseOrders: [],
    goodsReceipts: [],
    inventorySummary: {
      totalQuantityOnHand: 0,
      lowStockCount: 0,
      outOfStockCount: 0,
    },
  });

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
      salesResult,
      purchaseResult,
      receiptResult,
    ] = await Promise.allSettled([
      ApiService.getAllCategory(),
      ApiService.getAllWarehouses(),
      ApiService.getAllSuppliers(),
      ApiService.getAllProducts(),
      ApiService.getAllInventories(),
      ApiService.getInventorySummary(),
      ApiService.getAllSalesOrders({ page: 0, size: 24 }),
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
      salesResult,
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
      salesOrders:
        salesResult.status === "fulfilled" ? salesResult.value?.salesOrders || [] : [],
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
    categories,
    warehouses,
    warehouseProducts,
    suppliers,
    products,
    inventories,
    salesOrders,
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
  }, [goodsReceipts, purchaseOrders, salesOrders]);

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
        ])
      ),
    [inventories, inventorySearchTerm]
  );

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
    ],
    [
      inventorySummary.lowStockCount,
      inventorySummary.totalQuantityOnHand,
      warehouses.length,
    ]
  );

  const roleScopeCards = useMemo(
    () =>
      ROLE_SCOPE_ITEMS.map((item) => ({
        ...item,
        count:
          item.countKey === "categories"
            ? categories.length
            : item.countKey === "suppliers"
              ? suppliers.length
              : item.countKey === "products"
                ? products.length
                : warehouses.length,
      })),
    [categories.length, products.length, suppliers.length, warehouses.length]
  );

  const activeCopy = SECTION_COPY[activeSection] || SECTION_COPY.overview;

  const salesOrderRows = useMemo(
    () =>
      salesOrders.map((order) => ({
        id: order.id,
        code: order.orderCode || `Sales order #${order.id}`,
        partner: order.customerName || "Customer not assigned",
        warehouse:
          order.orderDetails?.[0]?.warehouseName ||
          order.orderDetails?.[0]?.warehouseId ||
          "Mixed",
        totalItems: order.totalItems || 0,
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
        status: formatStatus(order.status),
        updatedAt: order.updatedAt || order.createdAt || order.orderDate,
      })),
    [purchaseOrders]
  );

  const goodsReceiptRows = useMemo(
    () =>
      goodsReceipts.map((receipt) => ({
        id: receipt.stockInwardId,
        code: receipt.inwardCode || `Receipt #${receipt.stockInwardId}`,
        partner: receipt.supplierName || "Supplier not assigned",
        warehouse: receipt.warehouseName || "Unassigned",
        totalItems: receipt.totalReceivedQuantity || receipt.totalItems || 0,
        status: formatStatus(receipt.status),
        updatedAt: receipt.createdAt || receipt.inwardDate,
      })),
    [goodsReceipts]
  );

  const filteredSalesOrderRows = useMemo(
    () =>
      salesOrderRows.filter((row) =>
        matchesSearch(salesOrderSearchTerm, [
          row.code,
          row.partner,
          row.warehouse,
          row.status,
        ])
      ),
    [salesOrderRows, salesOrderSearchTerm]
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

        <article className="manager-panel">
          <div className="manager-panel-heading">
            <div>
              <span className="manager-panel-label">Priority items</span>
              <h2>What needs attention</h2>
            </div>
            <div className="manager-form-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => navigate(PATHS.dashboardWarehouses)}
              >
                Warehouses
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => navigate(PATHS.dashboardInventory)}
              >
                Inventory
              </button>
            </div>
          </div>

          {lowStockItems.length ? (
            <div className="manager-list">
              {lowStockItems.slice(0, 6).map((inventory) => (
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
          ) : recentActivity.length ? (
            <div className="manager-timeline">
              {recentActivity.slice(0, 4).map((item) => (
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
              title="No urgent updates"
              description="Low-stock products or recent operations will appear here."
            />
          )}
        </article>

        <section className="manager-two-column-grid">
          <article className="manager-panel manager-panel-emphasis">
            <div className="manager-panel-heading">
              <div>
                <span className="manager-panel-label">Warehouse manager scope</span>
                <h2>React modules mapped from the warehouse flow</h2>
              </div>
            </div>

            <div className="manager-quick-actions">
              {roleScopeCards.map((card) => (
                <button
                  key={card.label}
                  type="button"
                  className="manager-action-card"
                  onClick={() => navigate(card.path)}
                >
                  <span>{formatCompactNumber(card.count)}</span>
                  <strong>{card.label}</strong>
                  <p>{card.description}</p>
                </button>
              ))}
            </div>
          </article>

          <article className="manager-panel">
            <div className="manager-panel-heading">
              <div>
                <span className="manager-panel-label">Operational flow</span>
                <h2>How this role moves through the warehouse</h2>
              </div>
            </div>

            <div className="manager-card-stack">
              {ROLE_FLOW_STEPS.map((step) => (
                <div key={step.title} className="manager-insight-card">
                  <div>
                    <strong>{step.title}</strong>
                    <p>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>
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
        </div>

        <div className="manager-toolbar">
          <input
            className="manager-search-input manager-search-input-wide"
            value={inventorySearchTerm}
            onChange={(event) => setInventorySearchTerm(event.target.value)}
            placeholder="Search product, SKU, warehouse, or status"
          />
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
                    <td>{inventory.quantityOnHand || 0}</td>
                    <td>{inventory.lowStockThreshold || 0}</td>
                    <td>
                      <span className="manager-status-badge manager-status-badge-neutral">
                        {formatStatus(inventory.status)}
                      </span>
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
                {rows.map((row) => (
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
                      </div>
                    </td>
                  </tr>
                ))}
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
      await ApiService.deleteWarehouse(warehouseId);
      showMessage("Warehouse deleted successfully.");
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

    if (activeSection === "salesOrders") {
      return renderOrders(
        "Recent sales orders",
        filteredSalesOrderRows,
        "No sales orders found",
        "No sales orders match the current search.",
        "Outbound",
        salesOrderSearchTerm,
        setSalesOrderSearchTerm,
        "salesOrder"
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
