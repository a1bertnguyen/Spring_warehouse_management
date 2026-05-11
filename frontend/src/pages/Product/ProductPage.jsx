import React, { useEffect, useMemo, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import ApiService from "../../services/ApiService";
import { PATHS, buildEditProductPath } from "../../constants/paths";
import { useNavigate, useSearchParams } from "react-router-dom";
import PaginationComponent from "../../components/common/PaginationComponent";

const ITEMS_PER_PAGE = 10;

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const warehouseId = searchParams.get("warehouseId");
  const warehouseName = searchParams.get("warehouseName") || "";

  useEffect(() => {
    loadProducts();
    setCurrentPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warehouseId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  async function loadProducts() {
    try {
      const productData = warehouseId
        ? await ApiService.getProductsByWarehouse(warehouseId)
        : await ApiService.getAllProducts();

      if (productData.status === 200 || Array.isArray(productData.products)) {
        setProducts(productData.products || []);
      }
    } catch (error) {
      showMessage(error.response?.data?.message || "Error Getting Products: " + error);
    }
  }

  const filteredProducts = useMemo(
    () =>
      products.filter((product) => {
        const normalizedSearch = String(searchTerm || "").trim().toLowerCase();

        if (!normalizedSearch) {
          return true;
        }

        return [
          product.name,
          product.sku,
          product.su,
          product.categoryName,
          product.description,
        ]
          .filter(Boolean)
          .some((field) => String(field).toLowerCase().includes(normalizedSearch));
      }),
    [products, searchTerm]
  );

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

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this Product?")) {
      try {
        await ApiService.deleteProduct(productId);
        showMessage("Product successfully deleted");
        await loadProducts();
      } catch (error) {
        showMessage(error.response?.data?.message || "Error Deleting a product: " + error);
      }
    }
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => {
      setMessage("");
    }, 4000);
  };

  return (
    <MainLayout>
      {message && <div className="message">{message}</div>}

      <div className="product-page">
        <div className="product-header product-header-stack">
          <div>
            <h1>{warehouseName ? `${warehouseName} Products` : "Products"}</h1>
            {warehouseName ? (
              <p className="page-subtitle">Showing products assigned to this warehouse.</p>
            ) : (
              <p className="page-subtitle">Search and manage your product catalog.</p>
            )}
          </div>

          <div className="page-toolbar">
            <input
              className="page-search-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search products"
            />
            {warehouseId ? (
              <button
                className="secondary-page-button"
                onClick={() => navigate(PATHS.product)}
              >
                Clear Warehouse Filter
              </button>
            ) : null}
            <button className="add-product-btn" onClick={() => navigate(PATHS.addProduct)}>
              Add Product
            </button>
          </div>
        </div>

        {paginatedProducts.length ? (
          <div className="product-list">
            {paginatedProducts.map((product) => (
              <div key={product.id} className="product-item">
                <img className="product-image" src={product.imageUrl} alt={product.name} />

                <div className="product-info">
                  <h3 className="name">{product.name}</h3>
                  <p className="sku">SKU: {product.sku || product.su || "No SKU"}</p>
                  <p className="price">Price: {product.price}</p>
                  <p className="quantity">Quantity: {product.stockQuantity}</p>
                </div>

                <div className="product-actions">
                  <button
                    className="edit-btn"
                    onClick={() => navigate(buildEditProductPath(product.id))}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteProduct(product.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="page-empty-state">
            <strong>No products found</strong>
            <p>Try another search term or choose a different warehouse.</p>
          </div>
        )}
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
