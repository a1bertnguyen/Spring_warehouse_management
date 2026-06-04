// Learning note: SellPage creates sales orders from warehouse inventory. It
// loads warehouses first, then inventory for the selected warehouse.
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { PATHS } from "../../constants/paths";
import ApiService from "../../services/ApiService";
import "./SellPage.css";

const EMPTY_FORM = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  shippingAddress: "",
  notes: "",
};

function getWarehouseId(warehouse) {
  return warehouse?.warehouseId ?? warehouse?.id;
}

function formatDate(value = new Date()) {
  return new Intl.DateTimeFormat("en-GB").format(value);
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

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

function getStatusTone(status, quantityOnHand) {
  const normalizedStatus = String(status || "").toUpperCase();

  if (quantityOnHand <= 0 || normalizedStatus === "OUT_OF_STOCK") {
    return "danger";
  }

  if (normalizedStatus === "LOW_STOCK") {
    return "warning";
  }

  return "success";
}

const SellPage = () => {
  const navigate = useNavigate();
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState("");
  const [inventoryRows, setInventoryRows] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [quantities, setQuantities] = useState({});
  const [productSearch, setProductSearch] = useState("");
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState("success");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchWarehouses() {
      setIsLoading(true);

      try {
        const warehouseResponse = await ApiService.getAllWarehouses();
        const nextWarehouses = warehouseResponse?.warehouses || [];

        if (isMounted) {
          setWarehouses(nextWarehouses);
          setSelectedWarehouseId(
            nextWarehouses.length ? String(getWarehouseId(nextWarehouses[0])) : ""
          );
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Unable to load warehouses.",
          "danger"
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchWarehouses();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchInventory() {
      if (!selectedWarehouseId) {
        setInventoryRows([]);
        return;
      }

      setIsLoading(true);

      try {
        const inventoryResponse = await ApiService.getInventoriesByWarehouse(
          selectedWarehouseId
        );

        if (isMounted) {
          setInventoryRows(inventoryResponse?.inventories || []);
          setQuantities({});
        }
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Unable to load warehouse inventory.",
          "danger"
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchInventory();

    return () => {
      isMounted = false;
    };
  }, [selectedWarehouseId]);

  const selectedWarehouse = useMemo(
    () =>
      warehouses.find(
        (warehouse) => String(getWarehouseId(warehouse)) === selectedWarehouseId
      ),
    [selectedWarehouseId, warehouses]
  );

  const filteredInventoryRows = useMemo(() => {
    const search = productSearch.trim().toLowerCase();

    if (!search) {
      return inventoryRows;
    }

    return inventoryRows.filter((row) =>
      [row.productName, row.productSku, row.status]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(search))
    );
  }, [inventoryRows, productSearch]);

  const selectedItems = useMemo(
    () =>
      inventoryRows
        .map((row) => {
          const quantityOrdered = Number(quantities[row.inventoryId] || 0);

          return {
            ...row,
            quantityOrdered,
            lineTotal: quantityOrdered * Number(row.saleprice || 0),
          };
        })
        .filter((row) => row.quantityOrdered > 0),
    [inventoryRows, quantities]
  );

  const orderTotal = useMemo(
    () => selectedItems.reduce((total, item) => total + item.lineTotal, 0),
    [selectedItems]
  );

  function showMessage(nextMessage, tone = "success") {
    setMessage(nextMessage);
    setMessageTone(tone);
    window.setTimeout(() => {
      setMessage("");
    }, 4000);
  }

  function handleFormChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
  }

  function handleQuantityChange(row, value) {
    const parsedValue = Math.max(0, Number(value || 0));
    const cappedValue = Math.min(parsedValue, Number(row.quantityOnHand || 0));

    setQuantities((currentQuantities) => ({
      ...currentQuantities,
      [row.inventoryId]: cappedValue,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.customerName.trim()) {
      showMessage("Customer name is required.", "danger");
      return;
    }

    if (!selectedItems.length) {
      showMessage("Add at least one available product to the order.", "danger");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        customerName: form.customerName.trim(),
        customerEmail: form.customerEmail.trim() || null,
        customerPhone: form.customerPhone.trim() || null,
        shippingAddress: form.shippingAddress.trim() || null,
        notes: form.notes.trim() || null,
        items: selectedItems.map((item) => ({
          productId: item.productId,
          warehouseId: item.warehouseId,
          quantityOrdered: item.quantityOrdered,
          unitSalePrice: Number(item.saleprice || 0),
        })),
      };

      const response = await ApiService.createSalesOrder(payload);
      showMessage(response?.message || "Sales order created successfully.");
      setForm(EMPTY_FORM);
      setQuantities({});
      navigate(PATHS.dashboardSalesOrders, {
        state: { message: response?.message || "Sales order created successfully." },
      });
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Unable to create sales order.",
        "danger"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MainLayout>
      <div className="sales-order-page">
        {message && (
          <div className={`sales-order-message tone-${messageTone}`}>
            {message}
          </div>
        )}

        <section className="sales-order-shell">
          <div className="sales-order-banner">
            <span>Sales Staff Dashboard</span>
            <h1>Create Sales Order</h1>
            <p>
              Create the customer order, send it to warehouse manager approval,
              and keep the outbound flow ready for shipment.
            </p>
          </div>

          <form className="sales-order-layout" onSubmit={handleSubmit}>
            <section className="sales-order-card sales-order-form-card">
              <div className="sales-order-card-heading">
                <div>
                  <span>Order Information</span>
                  <h2>Customer details</h2>
                </div>
                <strong>{formatDate()}</strong>
              </div>

              <div className="sales-order-form-grid">
                <label>
                  Customer Name <span>*</span>
                  <input
                    name="customerName"
                    value={form.customerName}
                    onChange={handleFormChange}
                    placeholder="Enter customer name"
                    required
                  />
                </label>

                <label>
                  Customer Email
                  <input
                    name="customerEmail"
                    type="email"
                    value={form.customerEmail}
                    onChange={handleFormChange}
                    placeholder="customer@example.com"
                  />
                </label>

                <label>
                  Customer Phone
                  <input
                    name="customerPhone"
                    value={form.customerPhone}
                    onChange={handleFormChange}
                    placeholder="Enter phone number"
                  />
                </label>

                <label>
                  Shipping Address
                  <input
                    name="shippingAddress"
                    value={form.shippingAddress}
                    onChange={handleFormChange}
                    placeholder="Enter delivery address"
                  />
                </label>

                <label className="sales-order-field-wide">
                  Notes
                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleFormChange}
                    placeholder="Add internal notes for warehouse review"
                  />
                </label>
              </div>
            </section>

            <section className="sales-order-card sales-order-picker-card">
              <div className="sales-order-card-heading">
                <div>
                  <span>Warehouse</span>
                  <h2>Select stock source</h2>
                </div>
              </div>

              <label className="sales-order-select-label">
                Warehouse <span>*</span>
                <select
                  value={selectedWarehouseId}
                  onChange={(event) => setSelectedWarehouseId(event.target.value)}
                  required
                >
                  <option value="">Select warehouse</option>
                  {warehouses.map((warehouse) => (
                    <option
                      key={getWarehouseId(warehouse)}
                      value={String(getWarehouseId(warehouse))}
                    >
                      {warehouse.name}
                    </option>
                  ))}
                </select>
              </label>

              <div className="sales-order-search-row">
                <input
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Search products by name, SKU, or status"
                />
                <button type="button" onClick={() => setProductSearch("")}>
                  Clear
                </button>
              </div>

              <div className="sales-order-summary-strip">
                <div>
                  <span>Warehouse</span>
                  <strong>{selectedWarehouse?.name || "Not selected"}</strong>
                </div>
                <div>
                  <span>Items</span>
                  <strong>{selectedItems.length}</strong>
                </div>
                <div>
                  <span>Estimated Total</span>
                  <strong>{formatCurrency(orderTotal)}</strong>
                </div>
              </div>
            </section>

            <section className="sales-order-card sales-order-table-card">
              <div className="sales-order-card-heading">
                <div>
                  <span>Products In Warehouse</span>
                  <h2>Choose order quantities</h2>
                </div>
                <p>{filteredInventoryRows.length} products</p>
              </div>

              {isLoading ? (
                <div className="sales-order-loading">Loading products...</div>
              ) : filteredInventoryRows.length ? (
                <div className="sales-order-table-shell">
                  <table className="sales-order-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>SKU</th>
                        <th>Stock</th>
                        <th>Unit Price</th>
                        <th>Status</th>
                        <th>Order Qty</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventoryRows.map((row, index) => {
                        const quantityOnHand = Number(row.quantityOnHand || 0);
                        const statusTone = getStatusTone(row.status, quantityOnHand);

                        return (
                          <tr key={row.inventoryId || `${row.productId}-${index}`}>
                            <td>{index + 1}</td>
                            <td>
                              <strong>{row.productName || "Unnamed product"}</strong>
                              <span>{row.warehouseName}</span>
                            </td>
                            <td>{row.productSku || "N/A"}</td>
                            <td>{quantityOnHand}</td>
                            <td>{formatCurrency(row.saleprice)}</td>
                            <td>
                              <span className={`sales-order-badge tone-${statusTone}`}>
                                {formatStatus(row.status)}
                              </span>
                            </td>
                            <td>
                              <input
                                className="sales-order-quantity-input"
                                type="number"
                                min="0"
                                max={quantityOnHand}
                                value={quantities[row.inventoryId] || ""}
                                onChange={(event) =>
                                  handleQuantityChange(row, event.target.value)
                                }
                                disabled={quantityOnHand <= 0}
                                placeholder="0"
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="sales-order-empty-state">
                  <strong>No products found</strong>
                  <p>Choose another warehouse or adjust the product search.</p>
                </div>
              )}
            </section>

            <div className="sales-order-footer">
              <div>
                <span>Next Status</span>
                <strong>Pending Stock Check</strong>
              </div>
              <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Sales Order"}
              </button>
            </div>
          </form>
        </section>
      </div>
    </MainLayout>
  );
};

export default SellPage;
