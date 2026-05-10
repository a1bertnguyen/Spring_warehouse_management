import * as authService from "./authService";
import * as userService from "./userService";
import * as productService from "./productService";
import * as categoryService from "./categoryService";
import * as supplierService from "./supplierService";
import * as warehouseService from "./warehouseService";
import * as taskService from "./taskService";
import * as inventoryService from "./inventoryService";
import * as purchaseRequestService from "./purchaseRequestService";
import * as purchaseOrderService from "./purchaseOrderService";
import * as salesOrderService from "./salesOrderService";
import * as stockService from "./stockService";
import * as activityLogService from "./activityLogService";
import * as transactionAdapter from "./transactionAdapter";
import {
  clearAuth,
  getAuthSession,
  getExpirationTime,
  getRole,
  getToken,
  getUserId,
  isAdmin,
  isAuthenticated,
  saveAuthSession,
  saveRole,
  saveToken,
} from "./apiClient";

const ApiService = {
  ...authService,
  ...userService,
  ...productService,
  ...categoryService,
  ...supplierService,
  ...warehouseService,
  ...taskService,
  ...inventoryService,
  ...purchaseRequestService,
  ...purchaseOrderService,
  ...salesOrderService,
  ...stockService,
  ...activityLogService,
  ...transactionAdapter,
  saveAuthSession,
  saveToken,
  getToken,
  saveRole,
  getRole,
  getUserId,
  getExpirationTime,
  getAuthSession,
  clearAuth,
  isAuthenticated,
  isAdmin,
  logout() {
    clearAuth();
  },
  getLoggedInUserInfo() {
    return userService.getLoggedInUserInfo();
  },
  getLoggedInUsesInfo() {
    return userService.getLoggedInUserInfo();
  },
};

export default ApiService;
