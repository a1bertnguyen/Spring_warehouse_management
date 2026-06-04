# Warehouse Management Use Case Specifications

These use cases are written from the current project implementation and the supplied use case diagram. The system roles are `ADMIN`, `MANAGER`, `PURCHASE_STAFF`, `WAREHOUSE_STAFF`, and `SALE_STAFF`. Account creation and password support are admin-managed in the current UI. Stock take creation appears in the diagram, but the current backend exposes stock take viewing endpoints only.

## Use Case 1

Name: Log in
Identifier: UC01

Inputs:
1. Email
2. Password

Outputs:
1. Notification: "User Logged in Successfully" [If success]
2. Notification: "Unable to log in right now." or validation error [If fail]
3. Authenticated session token and role [If success]

Basic Course

| Actor: User | System |
| --- | --- |
| 1. Access the Login page. | 1.1. Display the login form. |
| 2. Input email and password. | |
| 3. Click Login. | 3.1. Validate required fields. |
| | 3.2. Check the email and password. |
| | 3.3. Check that the account is active. |
| | 3.4. If success, create a JWT session and redirect the user to the dashboard. |
| | 3.5. Else show a login failure message. |

Precondition:
1. The user account must exist.
2. The user account must be active.

Post condition:
1. The user is authenticated and routed to the role-based dashboard.

User story:
As a User of this web page, I want to log in with my email and password so that I can access the warehouse management functions allowed for my role.

## Use Case 2

Name: View profile
Identifier: UC02

Inputs:
1. Current authenticated session

Outputs:
1. Profile information: full name, email, phone number, and role [If success]
2. Notification: "Unable to load your profile right now." [If fail]

Basic Course

| Actor: User | System |
| --- | --- |
| 1. Click the account/profile area in the sidebar. | 1.1. Open the Profile page. |
| | 1.2. Request the current user information. |
| | 1.3. Display personal information and role. |
| | 1.4. If the profile cannot be loaded, show an error message. |

Precondition:
1. The user must be logged in.

Post condition:
1. None.

User story:
As a User of this web page, I want to view my profile so that I can check my personal information and current system role.

## Use Case 3

Name: Change password
Identifier: UC03

Inputs:
1. Current password
2. New password
3. Confirm new password

Outputs:
1. Notification: "Password updated successfully." [If success]
2. Notification: "Unable to update your password right now." or validation error [If fail]

Basic Course

| Actor: User | System |
| --- | --- |
| 1. Access the Profile page. | 1.1. Display the Change Password form. |
| 2. Input current password, new password, and confirmation. | |
| 3. Click Update Password. | 3.1. Check that required fields are present. |
| | 3.2. Check that the new password matches the confirmation. |
| | 3.3. Verify the current password. |
| | 3.4. If success, encrypt and save the new password. |
| | 3.5. Else show an error message. |

Precondition:
1. The user must be logged in.
2. The current password must be correct.
3. The new password must not be the same as the current password.

Post condition:
1. The user's password is updated in the database.

User story:
As a User of this web page, I want to change my password so that I can keep my account secure.

## Use Case 4

Name: Reset user password
Identifier: UC04

Inputs:
1. User email
2. Reset token
3. New password

Outputs:
1. Notification: "Password updated successfully" [If success]
2. Notification: reset token or password reset error [If fail]

Basic Course

| Actor: Admin | System |
| --- | --- |
| 1. Request a password reset for a user email. | 1.1. Check that the email belongs to an existing user. |
| | 1.2. Generate a reset token and expiration time. |
| 2. Submit the reset token and new password. | 2.1. Validate the reset token. |
| | 2.2. Check that the token is not expired. |
| | 2.3. Encrypt and save the new password. |
| | 2.4. Show success or failure message. |

Precondition:
1. The Admin must be logged in.
2. The target user account must exist.
3. The reset token must be valid and not expired.

Post condition:
1. The target user's password is updated.

User story:
As an Admin of this web page, I want to reset a user's password so that users can regain access when they cannot manage the password themselves.

## Use Case 5

Name: View statistical dashboard
Identifier: UC05

Inputs:
1. Selected month
2. Selected year
3. Selected metric

Outputs:
1. Total users [If success]
2. Transaction/order statistics [If success]
3. Dashboard charts [If success]
4. Notification: "Some dashboard data could not be loaded." [If fail]

Basic Course

| Actor: Admin | System |
| --- | --- |
| 1. Access the Statistics dashboard. | 1.1. Load users, transactions, and activity data. |
| 2. Select month, year, or metric. | 2.1. Recalculate daily transaction, product movement, and revenue chart data. |
| | 2.2. Display dashboard cards and charts. |
| | 2.3. If a data source fails, show a warning message. |

Precondition:
1. The Admin must be logged in.

Post condition:
1. None.

User story:
As an Admin of this web page, I want to view statistical dashboard data so that I can monitor users, orders, and business activity.

## Use Case 6

Name: Add user account
Identifier: UC06

Inputs:
1. Name
2. Email
3. Phone number
4. Password
5. Role

Outputs:
1. Notification: "User account created successfully." [If success]
2. Notification: "Unable to save this user right now." or validation error [If fail]

Basic Course

| Actor: Admin | System |
| --- | --- |
| 1. Access User Management. | 1.1. Display the Users page. |
| 2. Click Add User. | 2.1. Display the user input form. |
| 3. Input name, email, phone number, password, and role. | |
| 4. Click Save. | 4.1. Validate required fields. |
| | 4.2. Check that the email is not already in use. |
| | 4.3. Create the account with active status. |
| | 4.4. Reload and display the updated user list. |
| | 4.5. Else show a failure message. |

Precondition:
1. The Admin must be logged in.
2. The email must not be duplicated.

Post condition:
1. A new user account is stored in the database.

User story:
As an Admin of this web page, I want to create user accounts with system roles so that staff can access the functions needed for their job.

## Use Case 7

Name: Edit user account
Identifier: UC07

Inputs:
1. Name
2. Email
3. Phone number
4. Role
5. Password [Optional]

Outputs:
1. Notification: "User updated successfully." [If success]
2. Notification: "Unable to save this user right now." or validation error [If fail]

Basic Course

| Actor: Admin | System |
| --- | --- |
| 1. Access User Management. | 1.1. Display the Users page. |
| 2. Click Edit on a user account. | 2.1. Display the user form with existing information. |
| 3. Update name, email, phone number, role, or password. | |
| 4. Click Save. | 4.1. Validate the input information. |
| | 4.2. Save the updated account. |
| | 4.3. Reload and display the updated user list. |
| | 4.4. Else show a failure message. |

Precondition:
1. The Admin must be logged in.
2. The target user account must exist.

Post condition:
1. The user account is updated in the database.

User story:
As an Admin of this web page, I want to update user account information so that employee access and personal information stay correct.

## Use Case 8

Name: Disable or re-enable user account
Identifier: UC08

Inputs:
1. User account
2. Desired active status

Outputs:
1. Notification: "User disabled successfully." [If disabled]
2. Notification: "User re-enabled successfully." [If re-enabled]
3. Notification: "Unable to update this user right now." [If fail]

Basic Course

| Actor: Admin | System |
| --- | --- |
| 1. Access User Management. | 1.1. Display active and disabled users. |
| 2. Click Disable or Enable on a user. | 2.1. Toggle the user's active status. |
| | 2.2. Save the updated status. |
| | 2.3. Reload the user list. |
| | 2.4. Else show a failure message. |

Precondition:
1. The Admin must be logged in.
2. The target user account must exist.

Post condition:
1. The target account is enabled or disabled.

User story:
As an Admin of this web page, I want to disable or re-enable accounts so that I can control staff access without deleting account history.

## Use Case 9

Name: Delete user account
Identifier: UC09

Inputs:
1. User account
2. Delete confirmation

Outputs:
1. Notification: "User deleted successfully." [If success]
2. Notification: "Unable to delete this user right now." [If fail]

Basic Course

| Actor: Admin | System |
| --- | --- |
| 1. Access User Management. | 1.1. Display the Users page. |
| 2. Click Delete on a user account. | 2.1. Ask for delete confirmation. |
| 3. Confirm deletion. | 3.1. Validate that the account can be deleted. |
| | 3.2. Delete the user account. |
| | 3.3. Reload the user list. |
| | 3.4. Else show a failure message. |

Precondition:
1. The Admin must be logged in.
2. The target user account must exist.
3. The operation must not remove the last Admin account.

Post condition:
1. The user account is removed from the database.

User story:
As an Admin of this web page, I want to delete user accounts so that obsolete accounts no longer appear in the system.

## Use Case 10

Name: View activity logs
Identifier: UC10

Inputs:
1. Search keyword
2. Start date
3. End date

Outputs:
1. Activity log list [If success]
2. Login chart and login history [If success]
3. Notification: "Some dashboard data could not be loaded." [If fail]

Basic Course

| Actor: Admin | System |
| --- | --- |
| 1. Access Activity Log. | 1.1. Load activity logs. |
| 2. Input search keyword or date range. | 2.1. Filter the log list. |
| | 2.2. Display timestamp, actor, action, and note. |
| | 2.3. Display login activity chart where available. |

Precondition:
1. The Admin must be logged in.

Post condition:
1. None.

User story:
As an Admin of this web page, I want to view activity logs so that I can audit login events and user activity.

## Use Case 11

Name: Manage categories
Identifier: UC11

Inputs:
1. Category name
2. Category id [For update or delete]

Outputs:
1. Notification: "Category successfully added" [If add success]
2. Notification: "Category successfully updated" [If update success]
3. Notification: "Category successfully deleted" or archive message [If delete success]
4. Notification with category error [If fail]

Basic Course

| Actor: Warehouse manager | System |
| --- | --- |
| 1. Access Categories. | 1.1. Display the category list. |
| 2. Add, edit, or delete a category. | 2.1. Validate the category name. |
| | 2.2. Save the new category, update the existing category, or delete/archive it. |
| | 2.3. Reload and display the category list. |
| | 2.4. Else show a failure message. |

Precondition:
1. The Warehouse manager must be logged in.
2. The category must exist for edit or delete operations.

Post condition:
1. Category data is created, updated, deleted, or archived.

User story:
As a Warehouse manager of this web page, I want to manage product categories so that products can be organized correctly.

## Use Case 12

Name: Manage products
Identifier: UC12

Inputs:
1. Product name
2. SKU
3. Category
4. Supplier
5. Purchase price
6. Sale price
7. Unit
8. Low stock threshold
9. Status
10. Product image [Optional]
11. Excel file [For import]

Outputs:
1. Notification: "Product added successfully." [If add success]
2. Notification: "Product updated successfully." [If update success]
3. Notification: "Product deleted successfully." or archive message [If delete success]
4. Notification: "Products imported successfully." [If import success]
5. Product export file [If export success]
6. Notification with product error [If fail]

Basic Course

| Actor: Warehouse manager | System |
| --- | --- |
| 1. Access Products. | 1.1. Display products with category, supplier, stock, and status. |
| 2. Search, add, edit, delete, import, or export products. | 2.1. Validate the submitted product information. |
| | 2.2. Check product references such as category and supplier. |
| | 2.3. Save, update, delete/archive, import, or export product data. |
| | 2.4. Reload the product list or download the export file. |
| | 2.5. Else show a failure message. |

Precondition:
1. The Warehouse manager must be logged in.
2. The product must exist for edit or delete operations.
3. SKU must be unique for imported or newly created products.

Post condition:
1. Product data is created, updated, deleted/archived, imported, or exported.

User story:
As a Warehouse manager of this web page, I want to manage products so that warehouse inventory can reference accurate product data.

## Use Case 13

Name: Manage suppliers
Identifier: UC13

Inputs:
1. Supplier name
2. Contact information
3. Address

Outputs:
1. Notification: "Supplier Saved Successfully" [If add success]
2. Notification: "Supplier Was Successfully Updated" [If update success]
3. Notification: "Supplier Was Successfully Deleted" [If delete success]
4. Notification with supplier error [If fail]

Basic Course

| Actor: Warehouse manager or Purchasing staff | System |
| --- | --- |
| 1. Access Suppliers. | 1.1. Display supplier list. |
| 2. Add, edit, view, or delete supplier data. | 2.1. Validate supplier name and contact information. |
| | 2.2. Save, update, or delete supplier data. |
| | 2.3. Reload the supplier list. |
| | 2.4. Else show a failure message. |

Precondition:
1. The actor must be logged in with manager, admin, or purchasing permission.
2. The supplier must exist for edit or delete operations.

Post condition:
1. Supplier data is created, updated, or deleted.

User story:
As a Warehouse manager or Purchasing staff member, I want to manage suppliers so that purchase orders can use correct supplier information.

## Use Case 14

Name: Manage warehouses
Identifier: UC14

Inputs:
1. Warehouse name
2. Warehouse address
3. Warehouse id [For update or delete]

Outputs:
1. Notification: "Warehouse created successfully." [If add success]
2. Notification: "Warehouse updated successfully." [If update success]
3. Notification: "Warehouse deleted successfully." or archive message [If delete success]
4. Notification with warehouse error [If fail]

Basic Course

| Actor: Warehouse manager | System |
| --- | --- |
| 1. Access Warehouses. | 1.1. Display the warehouse list and warehouse inventory signals. |
| 2. Create, edit, or delete a warehouse. | 2.1. Validate warehouse name and address. |
| | 2.2. Save, update, delete, or archive warehouse data. |
| | 2.3. Reload warehouse and inventory data. |
| | 2.4. Else show a failure message. |

Precondition:
1. The Warehouse manager must be logged in.
2. The warehouse must exist for edit or delete operations.

Post condition:
1. Warehouse data is created, updated, deleted, or archived.

User story:
As a Warehouse manager of this web page, I want to manage warehouses so that inventory can be tracked by physical location.

## Use Case 15

Name: Adjust product in specific warehouse
Identifier: UC15

Inputs:
1. Warehouse id
2. Product id
3. Opening quantity [Optional]

Outputs:
1. Notification: "Product assigned to warehouse successfully." [If success]
2. Notification: "Product removed from warehouse successfully." [If removal success]
3. Notification with assignment/removal error [If fail]

Basic Course

| Actor: Warehouse manager | System |
| --- | --- |
| 1. Access Products or Warehouses. | 1.1. Display available products and warehouse inventory. |
| 2. Select a warehouse and a product. | |
| 3. Assign or remove the product from the warehouse. | 3.1. Validate warehouse and product. |
| | 3.2. Create or remove the inventory relationship. |
| | 3.3. Update warehouse product view. |
| | 3.4. Else show a failure message. |

Precondition:
1. The Warehouse manager must be logged in.
2. The selected warehouse and product must exist.

Post condition:
1. The product is assigned to or removed from the selected warehouse inventory.

User story:
As a Warehouse manager of this web page, I want to adjust products in a specific warehouse so that each warehouse shows the correct product catalog and stock baseline.

## Use Case 16

Name: Manage inventory
Identifier: UC16

Inputs:
1. Warehouse filter
2. Product search keyword
3. Stock status filter
4. Date range [For movement history]

Outputs:
1. Inventory list [If success]
2. Inventory summary [If success]
3. Inventory movement list [If success]
4. Excel inventory export [If export success]
5. Notification with inventory error [If fail]

Basic Course

| Actor: Warehouse manager | System |
| --- | --- |
| 1. Access Inventory. | 1.1. Load inventory rows and summary. |
| 2. Search by product, SKU, warehouse, or status. | 2.1. Filter inventory rows. |
| 3. Open movement history or export inventory. | 3.1. Load inventory movements or create an Excel export file. |
| | 3.2. Display filtered data or download the export. |
| | 3.3. Else show a failure message. |

Precondition:
1. The Warehouse manager must be logged in.

Post condition:
1. None, unless an export file is downloaded.

User story:
As a Warehouse manager of this web page, I want to manage inventory views and stock movements so that I can monitor stock health and product movement history.

## Use Case 17

Name: Approve purchase request
Identifier: UC17

Inputs:
1. Purchase request id
2. Next status: approved or rejected

Outputs:
1. Notification: "Status updated to Approved." [If approved]
2. Notification: "Status updated to Rejected." [If rejected]
3. Notification: "Unable to update the document status." [If fail]

Basic Course

| Actor: Warehouse manager | System |
| --- | --- |
| 1. Access Purchase Requests. | 1.1. Display pending purchase requests. |
| 2. Open request details. | 2.1. Display requested products, quantities, requester, and warehouse. |
| 3. Click Approve or Reject. | 3.1. Validate the status transition. |
| | 3.2. Save the new request status. |
| | 3.3. Reload purchase request data. |
| | 3.4. Else show a failure message. |

Precondition:
1. The Warehouse manager must be logged in.
2. The purchase request must exist.
3. The purchase request status must allow manager approval.

Post condition:
1. The purchase request is approved or rejected.

User story:
As a Warehouse manager of this web page, I want to approve or reject purchase requests so that purchasing staff can convert only valid restock requests into supplier orders.

## Use Case 18

Name: Review sales order
Identifier: UC18

Inputs:
1. Sales order id
2. Next status: awaiting shipment or cancelled

Outputs:
1. Notification: "Status updated to Awaiting Shipment." [If approved]
2. Notification: "Status updated to Cancelled." [If rejected/cancelled]
3. Notification: "Unable to update the document status." [If fail]

Basic Course

| Actor: Warehouse manager | System |
| --- | --- |
| 1. Access Sales Orders. | 1.1. Display pending sales orders. |
| 2. Open sales order details. | 2.1. Display customer, warehouse, products, and quantities. |
| 3. Approve or cancel the order. | 3.1. Validate the sales order status transition. |
| | 3.2. Save the updated status. |
| | 3.3. Reload sales order data. |
| | 3.4. Else show a failure message. |

Precondition:
1. The Warehouse manager must be logged in.
2. The sales order must exist.
3. The sales order must be waiting for stock check.

Post condition:
1. The sales order is moved to warehouse fulfillment or cancelled.

User story:
As a Warehouse manager of this web page, I want to review sales orders so that only valid customer orders move into shipment handling.

## Use Case 19

Name: Approve stock inward
Identifier: UC19

Inputs:
1. Stock inward id
2. Next status: APPROVED or CANCELLED

Outputs:
1. Notification: "Status updated to Approved." [If approved]
2. Notification: "Status updated to Cancelled." [If cancelled]
3. Notification: "Unable to update the document status." [If fail]

Basic Course

| Actor: Warehouse manager | System |
| --- | --- |
| 1. Access Stock Inwards. | 1.1. Display draft stock inward records. |
| 2. Open stock inward details. | 2.1. Display supplier, warehouse, purchase order, and received items. |
| 3. Approve or cancel the stock inward. | 3.1. Validate manager permission and status transition. |
| | 3.2. Save the updated status. |
| | 3.3. Reload stock inward data. |
| | 3.4. Else show a failure message. |

Precondition:
1. The Warehouse manager must be logged in.
2. The stock inward record must exist.
3. The stock inward must be in DRAFT status.

Post condition:
1. The stock inward is approved for warehouse receiving or cancelled.

User story:
As a Warehouse manager of this web page, I want to approve stock inward documents so that warehouse staff can complete only approved receiving records.

## Use Case 20

Name: View suppliers
Identifier: UC20

Inputs:
1. Supplier search keyword

Outputs:
1. Supplier list [If success]
2. Notification with supplier loading error [If fail]

Basic Course

| Actor: Purchasing staff | System |
| --- | --- |
| 1. Access Suppliers. | 1.1. Display supplier records. |
| 2. Search supplier information. | 2.1. Filter suppliers by name, contact information, or address. |
| | 2.2. Display matching supplier records. |

Precondition:
1. The Purchasing staff member must be logged in.

Post condition:
1. None.

User story:
As a Purchasing staff member, I want to view suppliers so that I can choose suitable suppliers for purchase orders.

## Use Case 21

Name: Create purchase order from purchase request
Identifier: UC21

Inputs:
1. Approved purchase request id
2. Supplier id [Optional]
3. Notes [Optional]

Outputs:
1. Notification: "Purchase order created. Choose the supplier if needed, then send it to the supplier." [If success]
2. Notification with purchase order creation error [If fail]

Basic Course

| Actor: Purchasing staff | System |
| --- | --- |
| 1. Access Purchase Requests. | 1.1. Display purchase requests and their statuses. |
| 2. Select an approved purchase request. | 2.1. Display request details. |
| 3. Click Create Purchase Order. | 3.1. Check that the request is approved. |
| | 3.2. Check that the request has not already been converted. |
| | 3.3. Create the purchase order. |
| | 3.4. Set the purchase request status to converted. |
| | 3.5. Open the purchase order editor. |

Precondition:
1. The Purchasing staff member must be logged in.
2. The purchase request must exist.
3. The purchase request must be approved.
4. The purchase request must not already be converted.

Post condition:
1. A purchase order is created and linked to the purchase request.

User story:
As a Purchasing staff member, I want to create purchase orders from approved requests so that supplier procurement can start from manager-approved demand.

## Use Case 22

Name: Edit and send purchase order
Identifier: UC22

Inputs:
1. Purchase order id
2. Supplier id
3. Notes
4. Next status

Outputs:
1. Notification: "Purchase order updated successfully." [If saved]
2. Notification: "Purchase order sent successfully." [If sent]
3. Notification: "Unable to update the purchase order." [If fail]

Basic Course

| Actor: Purchasing staff | System |
| --- | --- |
| 1. Access Purchase Orders. | 1.1. Display purchase orders and statuses. |
| 2. Open a purchase order for editing. | 2.1. Load purchase order details. |
| 3. Select supplier and update notes. | 3.1. Validate supplier information. |
| 4. Save or send the purchase order. | 4.1. Validate that the purchase order can still be edited or sent. |
| | 4.2. Save supplier, notes, and status. |
| | 4.3. Reload purchase order data. |
| | 4.4. Else show a failure message. |

Precondition:
1. The Purchasing staff member must be logged in.
2. The purchase order must exist.
3. The purchase order must not be received, rejected, or cancelled for editing.

Post condition:
1. The purchase order is updated or sent to supplier workflow.

User story:
As a Purchasing staff member, I want to edit and send purchase orders so that suppliers receive correct order information.

## Use Case 23

Name: Create stock inward form
Identifier: UC23

Inputs:
1. Stock inward code
2. Warehouse id
3. Purchase order id
4. Product id
5. Received quantity
6. Unit price [Optional]
7. Notes [Optional]

Outputs:
1. Notification: "Stock inward created successfully." [If success]
2. Notification: "Unable to create stock inward with the current payload." [If fail]

Basic Course

| Actor: Purchasing staff | System |
| --- | --- |
| 1. Access Create Stock Inward. | 1.1. Display the stock inward form. |
| 2. Select warehouse and ordered purchase order. | 2.1. Load purchase order detail lines. |
| 3. Input stock inward code, received quantities, prices, and notes. | |
| 4. Submit the form. | 4.1. Validate warehouse, purchase order, and at least one line item. |
| | 4.2. Check that the purchase order is in ordered status. |
| | 4.3. Create a DRAFT stock inward record. |
| | 4.4. Show success or failure message. |

Precondition:
1. The Purchasing staff member must be logged in.
2. The selected purchase order must exist.
3. The selected purchase order must be in ordered status.
4. At least one received item must have quantity greater than zero.

Post condition:
1. A DRAFT stock inward record is created and awaits manager approval.

User story:
As a Purchasing staff member, I want to create a stock inward form so that incoming supplier goods can be approved and received by the warehouse.

## Use Case 24

Name: Create purchase request
Identifier: UC24

Inputs:
1. Warehouse id
2. Product id
3. Requested quantity
4. Notes [Optional]

Outputs:
1. Notification: "Purchase request created successfully." [If success]
2. Notification: "Unable to create the purchase request." [If fail]

Basic Course

| Actor: Warehouse staff | System |
| --- | --- |
| 1. Access Purchase Requests from the warehouse dashboard. | 1.1. Display warehouses and inventory rows. |
| 2. Select a warehouse. | 2.1. Display products in the selected warehouse. |
| 3. Enter requested quantities for products. | |
| 4. Click Create Purchase Request. | 4.1. Validate warehouse and quantities. |
| | 4.2. Create the purchase request in pending approval status. |
| | 4.3. Reload purchase request data. |
| | 4.4. Else show a failure message. |

Precondition:
1. The Warehouse staff member must be logged in.
2. A warehouse must be selected.
3. At least one requested quantity must be greater than zero.

Post condition:
1. A purchase request is created and awaits manager approval.

User story:
As a Warehouse staff member, I want to create purchase requests for low-stock products so that the purchasing process can replenish inventory.

## Use Case 25

Name: Check and complete stock inward
Identifier: UC25

Inputs:
1. Stock inward id
2. Next status: COMPLETED

Outputs:
1. Notification: "Stock inward [code] marked as completed." [If success]
2. Notification: "Unable to complete this stock inward." [If fail]

Basic Course

| Actor: Warehouse staff | System |
| --- | --- |
| 1. Access Stock Inwards. | 1.1. Display approved stock inward records. |
| 2. Open stock inward details. | 2.1. Display supplier, warehouse, purchase order, and received item lines. |
| 3. Check received quantities. | |
| 4. Click Complete. | 4.1. Validate warehouse staff permission and status transition. |
| | 4.2. Increase warehouse inventory quantities. |
| | 4.3. Record inventory movements. |
| | 4.4. Sync product stock totals. |
| | 4.5. Update stock inward and purchase order receipt status. |
| | 4.6. Else show a failure message. |

Precondition:
1. The Warehouse staff member must be logged in.
2. The stock inward must exist.
3. The stock inward must be APPROVED.

Post condition:
1. The stock inward is completed.
2. Inventory quantities are increased.
3. Inventory movement history is recorded.

User story:
As a Warehouse staff member, I want to check and complete stock inward records so that received goods are added to warehouse inventory.

## Use Case 26

Name: Manage sales order fulfillment
Identifier: UC26

Inputs:
1. Sales order id
2. Next status: shipped or completed

Outputs:
1. Notification: "Sales order [code] marked as shipped." [If shipped]
2. Notification: "Sales order [code] marked as completed." [If completed]
3. Notification: "Unable to update the sales order status." or "Unable to complete the sales order." [If fail]

Basic Course

| Actor: Warehouse staff | System |
| --- | --- |
| 1. Access Sales Orders. | 1.1. Display sales orders ready for warehouse handling. |
| 2. Open sales order details. | 2.1. Display customer, warehouse, product, and quantity information. |
| 3. Mark the order as shipped or completed. | 3.1. Validate the status transition. |
| | 3.2. If completing the order, reduce inventory quantities and record movement history. |
| | 3.3. Save the updated sales order status. |
| | 3.4. Reload sales order and inventory data. |
| | 3.5. Else show a failure message. |

Precondition:
1. The Warehouse staff member must be logged in.
2. The sales order must exist.
3. The sales order status must allow warehouse fulfillment.
4. Inventory must be sufficient when the completion step applies inventory deduction.

Post condition:
1. The sales order status is updated.
2. Inventory is adjusted when the order is completed.

User story:
As a Warehouse staff member, I want to manage sales order fulfillment so that customer orders are shipped and inventory stays accurate.

## Use Case 27

Name: View stock take
Identifier: UC27

Inputs:
1. Stock take id [Optional]

Outputs:
1. Stock take list [If success]
2. Stock take details with system quantity, counted quantity, and discrepancy [If success]
3. Notification: stock take not found or loading error [If fail]

Basic Course

| Actor: Warehouse staff | System |
| --- | --- |
| 1. Access Stock Take records. | 1.1. Display stock take list. |
| 2. Open a stock take record. | 2.1. Display stock take details and discrepancies. |
| | 2.2. If the stock take does not exist, show an error message. |

Precondition:
1. The Warehouse staff member must be logged in.
2. The stock take must exist for detail view.

Post condition:
1. None.

User story:
As a Warehouse staff member, I want to view stock take records so that I can compare counted inventory against system inventory.

## Use Case 28

Name: Create sales order
Identifier: UC28

Inputs:
1. Customer name [Optional]
2. Customer email [Optional]
3. Customer phone [Optional]
4. Shipping address [Optional]
5. Notes [Optional]
6. Product id
7. Warehouse id
8. Quantity ordered
9. Unit sale price [Optional]

Outputs:
1. Notification: "Sales order created successfully." [If success]
2. Notification: "Unable to create sales order." [If fail]

Basic Course

| Actor: Sales staff | System |
| --- | --- |
| 1. Access the sales order creation page or sales dashboard. | 1.1. Display warehouse and inventory options. |
| 2. Select warehouse and products. | 2.1. Load available inventory for the selected warehouse. |
| 3. Input customer and order information. | |
| 4. Click Create Sales Order. | 4.1. Validate customer email format when provided. |
| | 4.2. Validate product, warehouse, and quantity. |
| | 4.3. Create the sales order in pending stock check status. |
| | 4.4. Redirect to the sales order list and show success. |
| | 4.5. Else show a failure message. |

Precondition:
1. The Sales staff member must be logged in.
2. At least one order item must be provided.
3. Quantity ordered must be greater than zero.

Post condition:
1. A sales order is created and awaits manager stock check.

User story:
As a Sales staff member, I want to create customer sales orders so that warehouse staff can prepare and fulfill customer demand.

## Use Case 29

Name: Track sales order request
Identifier: UC29

Inputs:
1. Search keyword
2. Status filter

Outputs:
1. Sales order list [If success]
2. Sales order details [If success]
3. Notification with loading error [If fail]

Basic Course

| Actor: Sales staff | System |
| --- | --- |
| 1. Access Sales Orders. | 1.1. Display sales orders created by the logged-in sales staff member. |
| 2. Search or filter orders by code, customer, warehouse, or status. | 2.1. Filter matching sales orders. |
| 3. Open order details. | 3.1. Display order lines, quantities, status, and customer information. |

Precondition:
1. The Sales staff member must be logged in.

Post condition:
1. None.

User story:
As a Sales staff member, I want to track my sales order requests so that I can follow each order until warehouse fulfillment is complete.
