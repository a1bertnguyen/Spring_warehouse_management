import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import ApiService from "../../services/ApiService";
import { PATHS, buildEditProductPath } from "../../constants/paths";
import { useNavigate, useSearchParams } from "react-router-dom";
import PaginationComponent from "../../components/common/PaginationComponent";

const ITEMS_PER_PAGE = 10;

const STATUS_OPTIONS = [
  { value: "all", label: "All Statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
];

function formatStatusLabel(status) {
  if (!status) {
    return "Unknown";
  }

  return status === "active" ? "Active" : "Inactive";
}

function formatCurrency(value) {
  const amount = Number(value || 0);

  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState("all");
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [appliedStatusFilter, setAppliedStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const warehouseId = searchParams.get("warehouseId");
  const warehouseName = searchParams.get("warehouseName") || "";

  useEffect(() => {
    loadProducts();
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId]);

  async function loadProducts() {
    try {
      const productData = warehouseId
        ? await ApiService.getProductsByWarehouse(warehouseId)
        : await ApiService.getAllProducts();

      if (productData.status === 200 || Array.isArray(productData.products)) {
        setProducts(productData.products || []);
      }
    } catch (error) {
      showMessage(error.response?.data?.message || `Error loading products: ${error}`);
    }
  }

  const filteredProducts = useMemo(() => {
    const normalizedSearch = String(appliedSearchTerm || "").trim().toLowerCase();

    return products.filter((product) => {
      const matchesText =
        !normalizedSearch ||
        [
          product.sku,
          product.su,
          product.name,
          product.description,
        ]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(normalizedSearch));

      const normalizedStatus = String(product.status || "").toLowerCase();
      const matchesStatus =
        appliedStatusFilter === "all" ||
        normalizedStatus === appliedStatusFilter.toLowerCase();

      return matchesText && matchesStatus;
    });
  }, [appliedSearchTerm, appliedStatusFilter, products]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));

  const paginatedProducts = useMemo(
    () =>
      filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE),
    [currentPage, filteredProducts]
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function handleDeleteProduct(productId) {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      await ApiService.deleteProduct(productId);
      showMessage("Product deleted successfully.");
      await loadProducts();
    } catch (error) {
      showMessage(error.response?.data?.message || `Error deleting product: ${error}`);
    }
  }

  async function handleExportExcel() {
    setIsExporting(true);

    try {
      const blob = await ApiService.exportProducts({
        search: appliedSearchTerm || undefined,
        status: appliedStatusFilter !== "all" ? appliedStatusFilter : undefined,
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "products.xlsx";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      showMessage(error.response?.data?.message || "Unable to export the product list.");
    } finally {
      setIsExporting(false);
    }
  }

  function handleApplyFilters() {
    setAppliedSearchTerm(searchInput);
    setAppliedStatusFilter(statusInput);
    setCurrentPage(1);
  }

  function showMessage(nextMessage) {
    setMessage(nextMessage);
    window.setTimeout(() => {
      setMessage("");
    }, 4000);
  }

  return (
    <MainLayout>
      {message ? <div className="message">{message}</div> : null}

      <div className="product-page product-page-table">
        <div className="product-page-shell">
          <div className="product-page-banner">
            <h1>{warehouseName ? `${warehouseName} Product List` : "Product List"}</h1>
          </div>

          <div className="product-filter-card">
            <div className="product-filter-grid">
              <div className="form-group">
                <label htmlFor="product-search">Search</label>
                <input
                  id="product-search"
                  className="page-search-input product-search-input"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleApplyFilters();
                    }
                  }}
                  placeholder="Search by product code or name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="product-status">Status</label>
                <select
                  id="product-status"
                  value={statusInput}
                  onChange={(event) => setStatusInput(event.target.value)}
                  className="product-filter-select"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className="product-filter-button"
                onClick={handleApplyFilters}
              >
                Filter Products
              </button>
            </div>
          </div>

          <div className="product-table-toolbar">
            <div className="product-table-actions-left">
              <button
                type="button"
                className="add-product-btn"
                onClick={() => navigate(PATHS.addProduct)}
              >
                + Add Product
              </button>

              {warehouseId ? (
                <button
                  type="button"
                  className="secondary-page-button"
                  onClick={() => navigate(PATHS.product)}
                >
                  Clear Warehouse Filter
                </button>
              ) : null}
            </div>

            <div className="product-table-actions-right">
              <button
                type="button"
                className="product-export-btn"
                onClick={handleExportExcel}
                disabled={isExporting}
              >
                {isExporting ? "Exporting..." : "Export Excel"}
              </button>
            </div>
          </div>

          {paginatedProducts.length ? (
            <div className="product-table-shell">
              <table className="product-table">
                <thead>
                  <tr>
                    <th>No.</th>
                    <th>Code</th>
                    <th>Product Name</th>
                    <th>Purchase Price</th>
                    <th>Sale Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                      <td>{product.sku || product.su || "N/A"}</td>
                      <td>{product.name || "Unnamed product"}</td>
                      <td>{formatCurrency(product.purchaseprice)}</td>
                      <td>{formatCurrency(product.saleprice)}</td>
                      <td>
                        <span
                          className={
                            product.status === "inactive"
                              ? "product-status-pill inactive"
                              : "product-status-pill active"
                          }
                        >
                          {formatStatusLabel(product.status)}
                        </span>
                      </td>
                      <td>
                        <div className="product-row-actions">
                          <button
                            type="button"
                            className="product-edit-btn"
                            onClick={() => navigate(buildEditProductPath(product.id))}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="product-delete-btn"
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="page-empty-state">
              <strong>No products found</strong>
              <p>Try another search term, status, or warehouse selection.</p>
            </div>
          )}
        </div>
      </div>

      <PaginationComponent
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </MainLayout>
  );
};

export default ProductPage;
