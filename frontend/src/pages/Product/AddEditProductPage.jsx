import React, { useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import ApiService from "../../services/ApiService";
import { PATHS } from "../../constants/paths";
import { useNavigate, useParams } from "react-router-dom";

const STATUS_OPTIONS = [
  { value: "active", label: "Đang hoạt động" },
  { value: "inactive", label: "Ngừng hoạt động" },
];

const INITIAL_FORM = {
  sku: "",
  name: "",
  description: "",
  purchaseprice: "",
  saleprice: "",
  status: "active",
  supplierId: "",
  categoryId: "",
  unit: "",
  lowStockThreshold: "",
};

const AddEditProductPage = () => {
  const { productId } = useParams("");
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadFormData() {
      try {
        const [categoriesData, suppliersData] = await Promise.all([
          ApiService.getAllCategory(),
          ApiService.getAllSuppliers(),
        ]);

        setCategories(categoriesData?.categories || []);
        setSuppliers(suppliersData?.suppliers || []);
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Không thể tải danh mục hoặc nhà cung cấp."
        );
      }
    }

    async function loadProduct() {
      if (!productId) {
        return;
      }

      setIsEditing(true);

      try {
        const productData = await ApiService.getProductById(productId);
        const product = productData?.product;

        if (!product) {
          showMessage(productData?.message || "Không tìm thấy sản phẩm.");
          return;
        }

        setForm({
          sku: product.sku || product.su || "",
          name: product.name || "",
          description: product.description || "",
          purchaseprice: product.purchaseprice ?? "",
          saleprice: product.saleprice ?? "",
          status: product.status || "active",
          supplierId: product.supplierId ?? "",
          categoryId: product.categoryId ?? "",
          unit: product.unit || "",
          lowStockThreshold: product.lowStockThreshold ?? "",
        });
        setImageUrl(product.imageUrl || "");
      } catch (error) {
        showMessage(
          error.response?.data?.message || "Không thể tải thông tin sản phẩm."
        );
      }
    }

    loadFormData();
    loadProduct();
  }, [productId]);

  function showMessage(nextMessage) {
    setMessage(nextMessage);
    window.setTimeout(() => {
      setMessage("");
    }, 4000);
  }

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setForm((currentValue) => ({
      ...currentValue,
      [name]: value,
    }));
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setImageFile(file);

    const reader = new FileReader();
    reader.onloadend = () => setImageUrl(reader.result?.toString() || "");
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("sku", form.sku.trim());
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("purchaseprice", form.purchaseprice);
    formData.append("saleprice", form.saleprice);
    formData.append("status", form.status);
    formData.append("supplierId", form.supplierId);
    formData.append("categoryId", form.categoryId);
    formData.append("unit", form.unit.trim());
    formData.append("lowStockThreshold", form.lowStockThreshold || 0);

    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        formData.append("productId", productId);
        await ApiService.updateProduct(formData);
        showMessage("Cập nhật sản phẩm thành công.");
      } else {
        await ApiService.addProduct(formData);
        showMessage("Thêm sản phẩm thành công.");
      }

      navigate(PATHS.product);
    } catch (error) {
      showMessage(
        error.response?.data?.message || "Không thể lưu sản phẩm lúc này."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MainLayout>
      {message ? <div className="message">{message}</div> : null}

      <div className="product-form-page product-form-page-modern">
        <div className="product-form-heading">
          <h1>{isEditing ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}</h1>
          <p>Điền đầy đủ thông tin sản phẩm để đồng bộ danh mục và luồng kho.</p>
        </div>

        <form onSubmit={handleSubmit} className="product-form-layout">
          <div className="product-form-grid">
            <div className="form-group">
              <label htmlFor="sku">Mã sản phẩm</label>
              <input
                id="sku"
                name="sku"
                type="text"
                value={form.sku}
                onChange={handleFieldChange}
                placeholder="VD: SP-001"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="name">Tên sản phẩm</label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleFieldChange}
                placeholder="Nhập tên sản phẩm"
                required
              />
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleFieldChange}
                placeholder="Mô tả ngắn về sản phẩm"
                rows={5}
              />
            </div>

            <div className="form-group">
              <label htmlFor="purchaseprice">Giá mua</label>
              <input
                id="purchaseprice"
                name="purchaseprice"
                type="number"
                min="0"
                step="0.01"
                value={form.purchaseprice}
                onChange={handleFieldChange}
                placeholder="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="saleprice">Giá bán</label>
              <input
                id="saleprice"
                name="saleprice"
                type="number"
                min="0"
                step="0.01"
                value={form.saleprice}
                onChange={handleFieldChange}
                placeholder="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="status">Trạng thái</label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleFieldChange}
                required
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="supplierId">Nhà cung cấp</label>
              <select
                id="supplierId"
                name="supplierId"
                value={form.supplierId}
                onChange={handleFieldChange}
                required
              >
                <option value="">Chọn nhà cung cấp</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="categoryId">Danh mục</label>
              <select
                id="categoryId"
                name="categoryId"
                value={form.categoryId}
                onChange={handleFieldChange}
                required
              >
                <option value="">Chọn danh mục</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="unit">Đơn vị tính</label>
              <input
                id="unit"
                name="unit"
                type="text"
                value={form.unit}
                onChange={handleFieldChange}
                placeholder="VD: Cái"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lowStockThreshold">Tồn kho tối thiểu</label>
              <input
                id="lowStockThreshold"
                name="lowStockThreshold"
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={handleFieldChange}
                placeholder="0"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageFile">Hình ảnh sản phẩm</label>
              <input id="imageFile" type="file" accept="image/*" onChange={handleImageChange} />
            </div>

            {imageUrl ? (
              <div className="form-group">
                <label>Xem trước</label>
                <img src={imageUrl} alt="preview" className="image-preview" />
              </div>
            ) : null}
          </div>

          <div className="product-form-actions">
            <button
              type="button"
              className="secondary-page-button"
              onClick={() => navigate(PATHS.product)}
            >
              Quay lại
            </button>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? "Đang lưu..."
                : isEditing
                  ? "Cập nhật sản phẩm"
                  : "Thêm sản phẩm"}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default AddEditProductPage;
