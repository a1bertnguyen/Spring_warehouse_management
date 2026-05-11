import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { PATHS } from "../../constants/paths";
import ApiService from "../../services/ApiService";
import "./ManagerDashboardPage.css";

const SECTION_COPY = {
  overview: {
    eyebrow: "Manager overview",
    title: "Warehouse operations at a glance",
    description:
      "Track stock health, warehouse occupancy, and order flow from one operational dashboard.",
  },
  warehouses: {
    eyebrow: "Warehouses",
    title: "Warehouse capacity and fulfillment readiness",
    description:
      "See how each warehouse is stocked, how many SKUs it carries, and where replenishment attention is needed.",
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
      "Watch supplier orders moving through approval, processing, and receiving.",
  },
  goodsReceipts: {
    eyebrow: "Goods receipts",
    title: "Inbound receipt activity",
    description:
      "Follow the most recent stock inward documents, receiving volumes, and warehouse destinations.",
  },
};

const EMPTY_WAREHOUSE_FORM = {
  name: "",
  address: "",
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
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [warehouseForm, setWarehouseForm] = useState(EMPTY_WAREHOUSE_FORM);
  const [editingWarehouseId, setEditingWarehouseId] = useState(null);
  const [warehouseProductId, setWarehouseProductId] = useState("");
  const [warehouseQuantity, setWarehouseQuantity] = useState("1");
  const [isSavingWarehouse, setIsSavingWarehouse] = useState(false);
  const [isAssigningProduct, setIsAssigningProduct] = useState(false);
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

  useEffect(() => {
    if (!dashboardData.warehouses.length) {
      setSelectedWarehouseId(null);
      return;
    }

    setSelectedWarehouseId((currentValue) => {
      const hasCurrentWarehouse = dashboardData.warehouses.some(
        (warehouse) => warehouse.id === currentValue
      );

      return hasCurrentWarehouse ? currentValue : dashboardData.warehouses[0].id;
    });
  }, [dashboardData.warehouses]);

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
      ApiService.getAllSalesOrders({ page: 0, size: 8 }),
      ApiService.getAllPurchaseOrders({ page: 0, size: 8 }),
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

  const selectedWarehouse = useMemo(
    () =>
      warehouseInsights.find((warehouse) => warehouse.id === selectedWarehouseId) ||
      warehouseInsights[0] ||
      null,
    [selectedWarehouseId, warehouseInsights]
  );

  const selectedWarehouseProducts = useMemo(
    () => selectedWarehouse?.products || [],
    [selectedWarehouse]
  );

  const availableProductsForWarehouse = useMemo(() => {
    const selectedWarehouseProductIds = new Set(
      selectedWarehouseProducts.map((product) => product.id ?? product.productId)
    );

    return products.filter(
      (product) => !selectedWarehouseProductIds.has(product.id ?? product.productId)
    );
  }, [products, selectedWarehouseProducts]);

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
        type: "Goods receipt",
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

  const summaryCards = useMemo(
    () => [
      {
        label: "Warehouses",
        value: warehouses.length,
        helper: "Operational storage sites",
      },
      {
        label: "Units on hand",
        value: inventorySummary.totalQuantityOnHand,
        helper: "Tracked across all warehouses",
      },
      {
        label: "Low-stock alerts",
        value: inventorySummary.lowStockCount,
        helper: "Need manager attention",
      },
      {
        label: "Sales orders",
        value: salesOrders.length,
        helper: "Recent outbound records",
      },
    ],
    [
      inventorySummary.lowStockCount,
      inventorySummary.totalQuantityOnHand,
      salesOrders.length,
      warehouses.length,
    ]
  );

  const activeCopy = SECTION_COPY[activeSection] || SECTION_COPY.overview;

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

        <section className="manager-two-column-grid">
          <article className="manager-panel">
            <div className="manager-panel-heading">
              <div>
                <span className="manager-panel-label">Warehouses</span>
                <h2>Quick warehouse snapshot</h2>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => navigate(PATHS.dashboardWarehouses)}
              >
                Open warehouses
              </button>
            </div>

            {warehouseInsights.length ? (
              <div className="manager-list">
                {warehouseInsights.slice(0, 4).map((warehouse) => (
                  <button
                    key={warehouse.id}
                    type="button"
                    className="manager-list-row manager-list-row-button"
                    onClick={() => {
                      setSelectedWarehouseId(warehouse.id);
                      navigate(PATHS.dashboardWarehouses);
                    }}
                  >
                    <div>
                      <strong>{warehouse.name}</strong>
                      <p>
                        {warehouse.address}
                      </p>
                    </div>
                    <div className="manager-row-metrics">
                      <span className="manager-status-badge">{warehouse.skuCount} SKUs</span>
                      <strong>{formatCompactNumber(warehouse.quantityOnHand)}</strong>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <TableEmptyState
                title="No warehouses yet"
                description="Create your first warehouse to start organizing products and stock."
              />
            )}
          </article>

          <article className="manager-panel">
            <div className="manager-panel-heading">
              <div>
                <span className="manager-panel-label">Low stock</span>
                <h2>Products that need attention</h2>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => navigate(PATHS.dashboardInventory)}
              >
                View inventory
              </button>
            </div>

            {lowStockItems.length ? (
              <div className="manager-list">
                {lowStockItems.slice(0, 5).map((inventory) => (
                  <div key={inventory.inventoryId} className="manager-list-row">
                    <div>
                      <strong>{inventory.productName || "Unnamed product"}</strong>
                      <p>
                        {inventory.productSku || "No SKU"} - {inventory.warehouseName || "No warehouse"}
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
                title="Inventory is stable"
                description="No products are currently at or below their low-stock threshold."
              />
            )}
          </article>
        </section>

        <article className="manager-panel">
          <div className="manager-panel-heading">
            <div>
              <span className="manager-panel-label">Recent activity</span>
              <h2>Latest operational events</h2>
            </div>
          </div>

          {recentActivity.length ? (
            <div className="manager-timeline manager-timeline-grid">
              {recentActivity.slice(0, 6).map((item) => (
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
              description="Recent sales, purchase orders, and receipt updates will appear here."
            />
          )}
        </article>
      </>
    );
  }

  function renderWarehouses() {
    return (
      <section className="manager-warehouse-layout">
        <article className="manager-panel">
          <div className="manager-panel-heading">
            <div>
              <span className="manager-panel-label">Warehouse list</span>
              <h2>Warehouses in the network</h2>
            </div>
          </div>

          {warehouseInsights.length ? (
            <div className="manager-warehouse-list">
              {warehouseInsights.map((warehouse) => (
                <button
                  key={warehouse.id}
                  type="button"
                  className={
                    warehouse.id === selectedWarehouse?.id
                      ? "manager-warehouse-card active"
                      : "manager-warehouse-card"
                  }
                  onClick={() => setSelectedWarehouseId(warehouse.id)}
                >
                  <div className="manager-warehouse-card-top">
                    <div>
                      <span className="manager-panel-label">Warehouse</span>
                      <strong>{warehouse.name}</strong>
                    </div>
                    <span className="manager-status-badge">{warehouse.skuCount} SKUs</span>
                  </div>
                  <p>{warehouse.address}</p>
                  <div className="manager-highlight-grid">
                    <div>
                      <span>Units on hand</span>
                      <strong>{formatCompactNumber(warehouse.quantityOnHand)}</strong>
                    </div>
                    <div>
                      <span>Low-stock alerts</span>
                      <strong>{warehouse.lowStockCount}</strong>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <TableEmptyState
              title="No warehouses yet"
              description="Warehouse locations will appear here once they are available from the API."
            />
          )}
        </article>

        <article className="manager-panel">
          <div className="manager-panel-heading">
            <div>
              <span className="manager-panel-label">Warehouse editor</span>
              <h2>{editingWarehouseId ? "Edit selected warehouse" : "Create new warehouse"}</h2>
            </div>
          </div>

          <form className="manager-inline-form" onSubmit={handleSaveWarehouse}>
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
              {editingWarehouseId ? (
                <button type="button" className="ghost-button" onClick={resetWarehouseForm}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>

          {selectedWarehouse ? (
            <>
              <div className="manager-panel-heading">
                <div>
                  <span className="manager-panel-label">Selected warehouse</span>
                  <h2>{selectedWarehouse.name}</h2>
                </div>
                <div className="manager-form-actions">
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => handleEditWarehouse(selectedWarehouse)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger-button"
                    onClick={() => handleDeleteWarehouse(selectedWarehouse.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>

              <p className="manager-panel-description">{selectedWarehouse.address}</p>

              <div className="manager-summary-strip">
                <div>
                  <span>Tracked products</span>
                  <strong>{selectedWarehouseProducts.length}</strong>
                </div>
                <div>
                  <span>Units on hand</span>
                  <strong>{formatCompactNumber(selectedWarehouse.quantityOnHand)}</strong>
                </div>
                <div>
                  <span>Low-stock alerts</span>
                  <strong>{selectedWarehouse.lowStockCount}</strong>
                </div>
              </div>

              <form className="manager-inline-form" onSubmit={handleAssignProductToWarehouse}>
                <label>
                  Add product to warehouse
                  <select
                    value={warehouseProductId}
                    onChange={(event) => setWarehouseProductId(event.target.value)}
                  >
                    <option value="">Select a product</option>
                    {availableProductsForWarehouse.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.sku || product.su || "No SKU"})
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Quantity
                  <input
                    type="number"
                    min="1"
                    value={warehouseQuantity}
                    onChange={(event) => setWarehouseQuantity(event.target.value)}
                  />
                </label>
                <div className="manager-form-actions">
                  <button type="submit" disabled={isAssigningProduct}>
                    {isAssigningProduct ? "Adding..." : "Add Product"}
                  </button>
                </div>
              </form>

              {selectedWarehouseProducts.length ? (
                <div className="manager-table-shell">
                  <table className="manager-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Stock</th>
                        <th>Image</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedWarehouseProducts.map((product) => (
                        <tr key={product.id ?? product.productId}>
                          <td>
                            <strong>{product.name || "Unnamed product"}</strong>
                          </td>
                          <td>{product.sku || product.su || "No SKU"}</td>
                          <td>{product.stockQuantity || 0}</td>
                          <td>
                            {product.imageUrl ? (
                              <img
                                className="manager-product-thumb"
                                src={product.imageUrl}
                                alt={product.name}
                              />
                            ) : (
                              <span className="manager-muted">No image</span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="ghost-button"
                              onClick={() =>
                                handleRemoveProductFromWarehouse(product.id ?? product.productId)
                              }
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <TableEmptyState
                  title="No products in this warehouse"
                  description="Use the form above to assign catalog products to the selected warehouse."
                />
              )}
            </>
          ) : (
            <TableEmptyState
              title="Select a warehouse"
              description="Choose a warehouse on the left to view its products and manage it."
            />
          )}
        </article>
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

        {inventories.length ? (
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
                {inventories.slice(0, 10).map((inventory) => (
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
            title="Inventory is unavailable"
            description="No inventory rows were returned for the current warehouse manager account."
          />
        )}
      </section>
    );
  }

  function renderOrders(title, rows, emptyTitle, emptyDescription, type) {
    return (
      <section className="manager-panel">
        <div className="manager-panel-heading">
          <div>
            <span className="manager-panel-label">{type}</span>
            <h2>{title}</h2>
          </div>
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

  const salesOrderRows = salesOrders.slice(0, 10).map((order) => ({
    id: order.id,
    code: order.orderCode || `Sales order #${order.id}`,
    partner: order.customerName || "Customer not assigned",
    warehouse:
      order.orderDetails?.[0]?.warehouseName || order.orderDetails?.[0]?.warehouseId || "Mixed",
    totalItems: order.totalItems || 0,
    status: formatStatus(order.status),
    updatedAt: order.updatedAt || order.createdAt || order.orderDate,
  }));

  const purchaseOrderRows = purchaseOrders.slice(0, 10).map((order) => ({
    id: order.id,
    code: order.orderCode || `Purchase order #${order.id}`,
    partner: order.supplierName || "Supplier not assigned",
    warehouse: order.warehouseName || "Unassigned",
    totalItems: order.totalItems || 0,
    status: formatStatus(order.status),
    updatedAt: order.updatedAt || order.createdAt || order.orderDate,
  }));

  const goodsReceiptRows = goodsReceipts.slice(0, 10).map((receipt) => ({
    id: receipt.stockInwardId,
    code: receipt.inwardCode || `Receipt #${receipt.stockInwardId}`,
    partner: receipt.supplierName || "Supplier not assigned",
    warehouse: receipt.warehouseName || "Unassigned",
    totalItems: receipt.totalReceivedQuantity || receipt.totalItems || 0,
    status: formatStatus(receipt.status),
    updatedAt: receipt.createdAt || receipt.inwardDate,
  }));

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
      await loadDashboardData();
    } catch (error) {
      showMessage(error.response?.data?.message || `Error saving warehouse: ${error}`);
    } finally {
      setIsSavingWarehouse(false);
    }
  }

  function handleEditWarehouse(warehouse) {
    setEditingWarehouseId(warehouse.id);
    setSelectedWarehouseId(warehouse.id);
    setWarehouseForm({
      name: warehouse.name || "",
      address: warehouse.address || "",
    });
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

  async function handleAssignProductToWarehouse(event) {
    event.preventDefault();

    if (!selectedWarehouse?.id || !warehouseProductId) {
      showMessage("Select a warehouse and a product first.");
      return;
    }

    setIsAssigningProduct(true);

    try {
      await ApiService.addProductToWarehouse(
        selectedWarehouse.id,
        Number(warehouseProductId),
        Number(warehouseQuantity || 0)
      );
      showMessage("Product added to warehouse successfully.");
      setWarehouseProductId("");
      setWarehouseQuantity("1");
      await loadDashboardData();
    } catch (error) {
      showMessage(
        error.response?.data?.message || `Error assigning product: ${error}`
      );
    } finally {
      setIsAssigningProduct(false);
    }
  }

  async function handleRemoveProductFromWarehouse(productId) {
    if (!selectedWarehouse?.id) {
      return;
    }

    if (!window.confirm("Remove this product from the warehouse?")) {
      return;
    }

    try {
      await ApiService.removeProductFromWarehouse(selectedWarehouse.id, productId);
      showMessage("Product removed from warehouse successfully.");
      await loadDashboardData();
    } catch (error) {
      showMessage(
        error.response?.data?.message || `Error removing product: ${error}`
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
        salesOrderRows,
        "No sales orders found",
        "Sales orders will show up here once outbound transactions are created.",
        "Outbound"
      );
    }

    if (activeSection === "purchaseOrders") {
      return renderOrders(
        "Recent purchase orders",
        purchaseOrderRows,
        "No purchase orders found",
        "Purchase orders will show up here once procurement begins creating orders.",
        "Procurement"
      );
    }

    if (activeSection === "goodsReceipts") {
      return renderOrders(
        "Recent goods receipts",
        goodsReceiptRows,
        "No goods receipts found",
        "Goods receipts will appear here after stock inward documents are issued.",
        "Inbound"
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
      </div>
    </MainLayout>
  );
};

export default ManagerDashboardPage;
