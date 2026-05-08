import axios from "axios";
import CryptoJS from "crypto-js";

export default class ApiService {
  static BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8081/api";
  static ENCRYPTION_KEY = "phegon-dev-inventory";
  static DEFAULT_EXPIRY_DATE = "2099-12-31T00:00:00";
  static PLACEHOLDER_IMAGE_BASE64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WnSUs0AAAAASUVORK5CYII=";

  static encrypt(data) {
    return CryptoJS.AES.encrypt(data, this.ENCRYPTION_KEY.toString());
  }

  static decrypt(data) {
    const bytes = CryptoJS.AES.decrypt(data, this.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  static saveToken(token) {
    const encryptedToken = this.encrypt(token);
    localStorage.setItem("token", encryptedToken);
  }

  static getToken() {
    const encryptedToken = localStorage.getItem("token");
    if (!encryptedToken) return null;
    return this.decrypt(encryptedToken);
  }

  static saveRole(role) {
    const encryptedRole = this.encrypt(role);
    localStorage.setItem("role", encryptedRole);
  }

  static getRole() {
    const encryptedRole = localStorage.getItem("role");
    if (!encryptedRole) return null;
    return this.decrypt(encryptedRole);
  }

  static clearAuth() {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  }

  static getHeader(contentType = "application/json") {
    const token = this.getToken();
    const headers = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (contentType) {
      headers["Content-Type"] = contentType;
    }

    return headers;
  }

  static withCollectionAlias(payload, key, mapper = (item) => item) {
    const items = Array.isArray(payload?.data) ? payload.data.map(mapper) : [];
    return { ...payload, data: items, [key]: items };
  }

  static withItemAlias(payload, key, mapper = (item) => item) {
    const item = payload?.data ? mapper(payload.data) : null;
    return { ...payload, data: item, [key]: item };
  }

  static normalizeProduct(product) {
    if (!product) return null;

    const purchaseprice = product.purchaseprice ?? product.Purchaseprice ?? null;
    const saleprice = product.saleprice ?? product.Saleprice ?? null;
    const price = product.price ?? saleprice ?? purchaseprice ?? 0;

    return {
      ...product,
      id: product.id ?? product.productId,
      productId: product.productId ?? product.id,
      purchaseprice,
      saleprice,
      price,
      su: product.su ?? product.sku,
    };
  }

  static normalizeCategory(category) {
    if (!category) return null;
    return { ...category };
  }

  static normalizeSupplier(supplier) {
    if (!supplier) return null;
    return { ...supplier };
  }

  static normalizeUser(user) {
    if (!user) return null;
    return { ...user };
  }

  static decodeBase64(base64Value) {
    if (typeof atob === "function") {
      return atob(base64Value);
    }

    if (typeof Buffer !== "undefined") {
      return Buffer.from(base64Value, "base64").toString("binary");
    }

    throw new Error("Unable to decode placeholder image");
  }

  static createPlaceholderImageFile() {
    const binary = this.decodeBase64(this.PLACEHOLDER_IMAGE_BASE64);
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
    return new File([bytes], "placeholder-product.png", { type: "image/png" });
  }

  static isMissingFormDataValue(formData, key) {
    const value = formData.get(key);

    if (value === null || value === undefined) {
      return true;
    }

    if (typeof value === "string") {
      return value.trim() === "";
    }

    if (typeof File !== "undefined" && value instanceof File) {
      return value.size === 0;
    }

    return false;
  }

  static upsertFormDataValue(formData, key, value) {
    if (typeof formData.set === "function") {
      formData.set(key, value);
      return;
    }

    formData.append(key, value);
  }

  static prepareProductFormData(formData, { requireImage = false } = {}) {
    if (typeof FormData === "undefined" || !(formData instanceof FormData)) {
      return formData;
    }

    if (this.isMissingFormDataValue(formData, "expiryDate")) {
      this.upsertFormDataValue(formData, "expiryDate", this.DEFAULT_EXPIRY_DATE);
    }

    if (requireImage && this.isMissingFormDataValue(formData, "imageFile")) {
      this.upsertFormDataValue(
        formData,
        "imageFile",
        this.createPlaceholderImageFile()
      );
    }

    return formData;
  }

  static buildNotes(...parts) {
    return parts
      .map((part) => (typeof part === "string" ? part.trim() : ""))
      .filter(Boolean)
      .join(" | ");
  }

  static toNumber(value) {
    if (value === null || value === undefined || value === "") {
      return null;
    }

    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  static formatStatus(status) {
    if (!status) return "";
    return String(status).replace(/_/g, " ").toUpperCase();
  }

  static matchesTransactionFilter(transaction, filterValue) {
    const normalizedFilter = String(filterValue || "")
      .trim()
      .toLowerCase();

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
      .some((value) =>
        String(value).toLowerCase().includes(normalizedFilter)
      );
  }

  static normalizePurchaseTransaction(request) {
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

    const transaction = {
      id: `purchase-request-${request?.id}`,
      sourceId: request?.id,
      sourceType: "purchase-request",
      transactionType: "PURCHASE REQUEST",
      status: this.formatStatus(request?.status),
      description: request?.requestCode || request?.notes || "Purchase request",
      note: request?.notes || "",
      totalProducts,
      totalPrice,
      createdAt: request?.createdAt || request?.requestDate,
      updatedAt: request?.updatedAt || request?.approvedAt || null,
      product: this.normalizeProduct({
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

    return transaction;
  }

  static normalizeSalesTransaction(order) {
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
      status: this.formatStatus(order?.status),
      description: order?.orderCode || order?.notes || "Sales order",
      note: order?.notes || "",
      totalProducts,
      totalPrice,
      createdAt: order?.createdAt || order?.orderDate,
      updatedAt: order?.updatedAt || null,
      product: this.normalizeProduct({
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

  static parseTransactionIdentifier(transactionId) {
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

  static async resolveWarehouseId(body = {}) {
    const explicitWarehouseId = this.toNumber(body.warehouseId);

    if (explicitWarehouseId) {
      return explicitWarehouseId;
    }

    try {
      const response = await axios.get(`${this.BASE_URL}/warehouses/all`, {
        headers: this.getHeader(),
      });
      const warehouses = Array.isArray(response.data?.data)
        ? response.data.data
        : [];

      if (!warehouses.length) {
        throw new Error("No warehouse found");
      }

      return warehouses[0].id;
    } catch (error) {
      if (error?.response?.status === 403) {
        throw new Error(
          "Backend now requires warehouseId. Add warehouseId to the request or log in with a role that can read warehouses."
        );
      }

      throw new Error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to resolve warehouseId"
      );
    }
  }

  static mapLegacyStatusToPurchaseRequest(status) {
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

  static mapLegacyStatusToSalesOrder(status) {
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

  static async registerUser(registerData) {
    const response = await axios.post(
      `${this.BASE_URL}/auth/register`,
      registerData
    );
    return response.data;
  }

  static async loginUser(loginData) {
    const response = await axios.post(`${this.BASE_URL}/auth/login`, loginData);
    return response.data;
  }

  static async getAllUsers() {
    const response = await axios.get(`${this.BASE_URL}/users/all`, {
      headers: this.getHeader(),
    });
    return this.withCollectionAlias(response.data, "users", this.normalizeUser);
  }

  static async getLoggedInUsesInfo() {
    const response = await axios.get(`${this.BASE_URL}/users/current`, {
      headers: this.getHeader(),
    });
    return this.normalizeUser(response.data);
  }

  static async getUserById(userId) {
    const response = await axios.get(`${this.BASE_URL}/users/id/${userId}`, {
      headers: this.getHeader(),
    });
    return this.withItemAlias(response.data, "user", this.normalizeUser);
  }

  static async updateUser(userId, userData) {
    const response = await axios.put(
      `${this.BASE_URL}/users/update/${userId}`,
      userData,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async deleteUser(userId) {
    const response = await axios.delete(`${this.BASE_URL}/users/delete/${userId}`, {
      headers: this.getHeader(),
    });
    return response.data;
  }

  static async addProduct(formData) {
    const payload = this.prepareProductFormData(formData, { requireImage: true });
    const response = await axios.post(`${this.BASE_URL}/products/add`, payload, {
      headers: {
        ...this.getHeader(null),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  static async updateProduct(formData) {
    const payload = this.prepareProductFormData(formData);
    const response = await axios.put(`${this.BASE_URL}/products/update`, payload, {
      headers: {
        ...this.getHeader(null),
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  static async getAllProducts() {
    const response = await axios.get(`${this.BASE_URL}/products/all`, {
      headers: this.getHeader(),
    });
    return this.withCollectionAlias(
      response.data,
      "products",
      this.normalizeProduct
    );
  }

  static async getProductById(productId) {
    const response = await axios.get(`${this.BASE_URL}/products/${productId}`, {
      headers: this.getHeader(),
    });
    return this.withItemAlias(response.data, "product", this.normalizeProduct);
  }

  static async searchProduct(searchValue) {
    const response = await axios.get(`${this.BASE_URL}/products/search`, {
      params: { input: searchValue },
      headers: this.getHeader(),
    });
    return this.withCollectionAlias(
      response.data,
      "products",
      this.normalizeProduct
    );
  }

  static async deleteProduct(productId) {
    const response = await axios.delete(
      `${this.BASE_URL}/products/delete/${productId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async createCategory(category) {
    const response = await axios.post(
      `${this.BASE_URL}/categories/add`,
      category,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getAllCategory() {
    const response = await axios.get(`${this.BASE_URL}/categories/all`, {
      headers: this.getHeader(),
    });
    return this.withCollectionAlias(
      response.data,
      "categories",
      this.normalizeCategory
    );
  }

  static async getCategoryById(categoryId) {
    const response = await axios.get(
      `${this.BASE_URL}/categories/${categoryId}`,
      {
        headers: this.getHeader(),
      }
    );
    return this.withItemAlias(
      response.data,
      "category",
      this.normalizeCategory
    );
  }

  static async updateCategory(categoryId, categoryData) {
    const response = await axios.put(
      `${this.BASE_URL}/categories/update/${categoryId}`,
      categoryData,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async deleteCategory(categoryId) {
    const response = await axios.delete(
      `${this.BASE_URL}/categories/delete/${categoryId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async addSupplier(supplierData) {
    const response = await axios.post(
      `${this.BASE_URL}/suppliers/add`,
      supplierData,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getAllSuppliers() {
    const response = await axios.get(`${this.BASE_URL}/suppliers/all`, {
      headers: this.getHeader(),
    });
    return this.withCollectionAlias(
      response.data,
      "suppliers",
      this.normalizeSupplier
    );
  }

  static async getSupplierById(supplierId) {
    const response = await axios.get(
      `${this.BASE_URL}/suppliers/${supplierId}`,
      {
        headers: this.getHeader(),
      }
    );
    return this.withItemAlias(
      response.data,
      "supplier",
      this.normalizeSupplier
    );
  }

  static async updateSupplier(supplierId, supplierData) {
    const response = await axios.put(
      `${this.BASE_URL}/suppliers/update/${supplierId}`,
      supplierData,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async deleteSupplier(supplierId) {
    const response = await axios.delete(
      `${this.BASE_URL}/suppliers/delete/${supplierId}`,
      {
        headers: this.getHeader(),
      }
    );
    return response.data;
  }

  static async getAllWarehouses() {
    const response = await axios.get(`${this.BASE_URL}/warehouses/all`, {
      headers: this.getHeader(),
    });
    return this.withCollectionAlias(response.data, "warehouses");
  }

  static async purchaseProduct(body) {
    const warehouseId = await this.resolveWarehouseId(body);
    const requestBody = {
      warehouseId,
      supplierId: this.toNumber(body?.supplierId),
      notes: this.buildNotes(body?.description, body?.note),
      items: [
        {
          productId: this.toNumber(body?.productId),
          requestedQuantity: this.toNumber(body?.quantity),
          supplierIdSuggested: this.toNumber(body?.supplierId),
          note: this.buildNotes(body?.note, body?.description),
        },
      ],
    };

    const response = await axios.post(
      `${this.BASE_URL}/purchase-requests`,
      requestBody,
      {
        headers: this.getHeader(),
      }
    );

    const transaction = this.normalizePurchaseTransaction(response.data?.data);
    return { ...response.data, data: transaction, transaction };
  }

  static async sellProduct(body) {
    const warehouseId = await this.resolveWarehouseId(body);
    const requestBody = {
      notes: this.buildNotes(body?.description, body?.note),
      items: [
        {
          productId: this.toNumber(body?.productId),
          quantityOrdered: this.toNumber(body?.quantity),
          warehouseId,
        },
      ],
    };

    const response = await axios.post(
      `${this.BASE_URL}/sales-orders`,
      requestBody,
      {
        headers: this.getHeader(),
      }
    );

    const transaction = this.normalizeSalesTransaction(response.data?.data);
    return { ...response.data, data: transaction, transaction };
  }

  static async returnToSupplier() {
    throw new Error(
      "Return-to-supplier flow is not exposed by the current backend API."
    );
  }

  static async getAllTransactions(filter) {
    const purchaseParams = { page: 0, size: 100 };
    const salesParams = { page: 0, size: 100 };

    if (filter) {
      purchaseParams.requestCode = filter;
      salesParams.orderCode = filter;
      salesParams.customerName = filter;
    }

    const [purchaseResult, salesResult] = await Promise.allSettled([
      axios.get(`${this.BASE_URL}/purchase-requests`, {
        headers: this.getHeader(),
        params: purchaseParams,
      }),
      axios.get(`${this.BASE_URL}/sales-orders`, {
        headers: this.getHeader(),
        params: salesParams,
      }),
    ]);

    const transactions = [];

    if (purchaseResult.status === "fulfilled") {
      const purchaseRequests = Array.isArray(purchaseResult.value.data?.data)
        ? purchaseResult.value.data.data
        : [];
      transactions.push(
        ...purchaseRequests.map((request) =>
          this.normalizePurchaseTransaction(request)
        )
      );
    }

    if (salesResult.status === "fulfilled") {
      const salesOrders = Array.isArray(salesResult.value.data?.data)
        ? salesResult.value.data.data
        : [];
      transactions.push(
        ...salesOrders.map((order) => this.normalizeSalesTransaction(order))
      );
    }

    if (!transactions.length) {
      const firstError =
        purchaseResult.status === "rejected"
          ? purchaseResult.reason
          : salesResult.reason;
      throw firstError;
    }

    const filteredTransactions = transactions
      .filter((transaction) => this.matchesTransactionFilter(transaction, filter))
      .sort((left, right) => {
        const leftTime = new Date(left.createdAt || 0).getTime();
        const rightTime = new Date(right.createdAt || 0).getTime();
        return rightTime - leftTime;
      });

    return {
      status: 200,
      message: "success",
      data: filteredTransactions,
      transactions: filteredTransactions,
    };
  }

  static async getTransactionById(transactionId) {
    const parsedIdentifier = this.parseTransactionIdentifier(transactionId);

    if (parsedIdentifier.sourceType === "purchase-request") {
      const [requestResponse, detailsResponse] = await Promise.all([
        axios.get(
          `${this.BASE_URL}/purchase-requests/${parsedIdentifier.sourceId}`,
          {
            headers: this.getHeader(),
          }
        ),
        axios.get(
          `${this.BASE_URL}/purchase-requests/${parsedIdentifier.sourceId}/details`,
          {
            headers: this.getHeader(),
          }
        ),
      ]);

      const request = {
        ...(requestResponse.data?.data || {}),
        requestDetails: detailsResponse.data?.data || [],
      };
      const transaction = this.normalizePurchaseTransaction(request);
      return { ...requestResponse.data, data: transaction, transaction };
    }

    if (parsedIdentifier.sourceType === "sales-order") {
      const [orderResponse, detailsResponse] = await Promise.all([
        axios.get(`${this.BASE_URL}/sales-orders/${parsedIdentifier.sourceId}`, {
          headers: this.getHeader(),
        }),
        axios.get(
          `${this.BASE_URL}/sales-orders/${parsedIdentifier.sourceId}/details`,
          {
            headers: this.getHeader(),
          }
        ),
      ]);

      const order = {
        ...(orderResponse.data?.data || {}),
        orderDetails: detailsResponse.data?.data || [],
      };
      const transaction = this.normalizeSalesTransaction(order);
      return { ...orderResponse.data, data: transaction, transaction };
    }

    try {
      return await this.getTransactionById(`purchase-request-${transactionId}`);
    } catch (purchaseError) {
      return this.getTransactionById(`sales-order-${transactionId}`);
    }
  }

  static async updateTransactionStatus(transactionId, status) {
    const parsedIdentifier = this.parseTransactionIdentifier(transactionId);

    if (parsedIdentifier.sourceType === "purchase-request") {
      const response = await axios.patch(
        `${this.BASE_URL}/purchase-requests/${parsedIdentifier.sourceId}/status`,
        null,
        {
          headers: this.getHeader(),
          params: {
            status: this.mapLegacyStatusToPurchaseRequest(status),
          },
        }
      );
      return response.data;
    }

    if (parsedIdentifier.sourceType === "sales-order") {
      const response = await axios.patch(
        `${this.BASE_URL}/sales-orders/${parsedIdentifier.sourceId}/status`,
        null,
        {
          headers: this.getHeader(),
          params: {
            status: this.mapLegacyStatusToSalesOrder(status),
          },
        }
      );
      return response.data;
    }

    try {
      return await this.updateTransactionStatus(
        `purchase-request-${transactionId}`,
        status
      );
    } catch (purchaseError) {
      return this.updateTransactionStatus(`sales-order-${transactionId}`, status);
    }
  }

  static logout() {
    this.clearAuth();
  }

  static isAuthenticated() {
    const token = this.getToken();
    return !!token;
  }

  static isAdmin() {
    const role = this.getRole();
    return role === "ADMIN";
  }
}
