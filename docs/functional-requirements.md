# A. FUNCTIONAL REQUIREMENTS

Warehouse Management System

Prepared from the current project source code, role navigation, backend controllers, and the supplied use case diagram. Sprint, task, and hour values are planning estimates because the repository does not contain an official sprint plan.

## Use Case 1: Log in the warehouse management system

### 1. The Scope of the Work
- This occurs in sprint 1 in the process.
- 4 tasks are needed for this function.
- 20 hours of effort are needed for this function.

### 2. The Scope of the Product: This is the main authentication function that allows each user to enter the system according to the assigned role.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display the login page so that the user can input account email and password.
_ Shall retrieve the user account that matches the submitted email from the database.
_ Shall compare the submitted password with the encrypted password stored in the database.
_ Shall check whether the account is active before allowing access.
_ Shall create an authenticated session token and route the user to the correct role-based dashboard when login succeeds.
_ Shall display a login failure notification when the email, password, or account status is invalid.

#### b. Data Requirement: The login email and password must be valid, the user account must exist, and the account must be active.

## Use Case 2: View profile

### 1. The Scope of the Work
- This occurs in sprint 1 in the process.
- 3 tasks are needed for this function.
- 10 hours of effort are needed for this function.

### 2. The Scope of the Product: This function lets an authenticated user review personal account information in the system.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display the profile page only after the user is authenticated.
_ Shall retrieve the current logged-in user from the database.
_ Shall show profile information including name, email, phone number, and role.
_ Shall prevent unauthenticated users from viewing profile information.

#### b. Data Requirement: A valid session token is required, and the current user record must exist in the database.

## Use Case 3: Change password

### 1. The Scope of the Work
- This occurs in sprint 1 in the process.
- 4 tasks are needed for this function.
- 16 hours of effort are needed for this function.

### 2. The Scope of the Product: This function allows an authenticated user to change the account password securely.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display a password change form for the current authenticated user.
_ Shall require the current password and the new password before submission.
_ Shall verify that the current password matches the stored encrypted password.
_ Shall reject the request when the new password is blank or the same as the current password.
_ Shall encrypt and save the new password when validation succeeds.
_ Shall show a success or failure notification after processing the request.

#### b. Data Requirement: The current password must match the account password, and the new password must be valid and different from the current password.

## Use Case 4: Reset user password

### 1. The Scope of the Work
- This occurs in sprint 1 in the process.
- 5 tasks are needed for this function.
- 20 hours of effort are needed for this function.

### 2. The Scope of the Product: This function supports password recovery and administrator-managed password reset.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall allow an administrator to request a password reset for an existing account.
_ Shall generate a temporary reset token and store its expiry time.
_ Shall validate the reset token before accepting the new password.
_ Shall encrypt and save the new password after a valid reset request.
_ Shall clear the reset token after the password has been reset.
_ Shall show an error notification when the email, token, or new password is invalid.

#### b. Data Requirement: The target email must exist, the reset token must be valid and not expired, and the new password must be provided.

## Use Case 5: View statistical dashboard

### 1. The Scope of the Work
- This occurs in sprint 2 in the process.
- 6 tasks are needed for this function.
- 32 hours of effort are needed for this function.

### 2. The Scope of the Product: This function gives administrators and managers a summarized view of warehouse operations.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display role-based dashboard sections after login.
_ Shall show total users, total products, total orders, and operational summaries when the role is permitted.
_ Shall display statistical charts for products, inventory, purchase orders, sales orders, and stock inwards.
_ Shall retrieve current statistics from backend services instead of using static values.
_ Shall display loading and error states when dashboard data cannot be loaded.

#### b. Data Requirement: Dashboard data must be calculated from current users, products, inventory, purchase orders, sales orders, and stock inward records.

## Use Case 6: Add user account

### 1. The Scope of the Work
- This occurs in sprint 2 in the process.
- 4 tasks are needed for this function.
- 20 hours of effort are needed for this function.

### 2. The Scope of the Product: This function allows an administrator to create accounts for system users.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display the user management page for administrators.
_ Shall display an add-user form with name, email, password, phone number, role, and active status fields.
_ Shall validate required account information before saving.
_ Shall encrypt the password before storing the new user account.
_ Shall save the new user account and refresh the user list when creation succeeds.
_ Shall show a failure notification when the email is duplicated or required data is invalid.

#### b. Data Requirement: The email must not be duplicated, the password must be provided, and the selected role must be one of the supported system roles.

## Use Case 7: Edit user account

### 1. The Scope of the Work
- This occurs in sprint 2 in the process.
- 4 tasks are needed for this function.
- 16 hours of effort are needed for this function.

### 2. The Scope of the Product: This function allows an administrator to update account information and role assignments.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display the list of user accounts for administrators.
_ Shall allow the administrator to open an edit form for a selected account.
_ Shall allow changes to name, email, phone number, role, active status, and password when permitted.
_ Shall validate the edited information before saving.
_ Shall update the account in the database and refresh the user list when successful.
_ Shall show a failure notification when the account does not exist or submitted data is invalid.

#### b. Data Requirement: The selected user ID must exist, and the updated email must remain unique in the user table.

## Use Case 8: Disable or re-enable user account

### 1. The Scope of the Work
- This occurs in sprint 2 in the process.
- 3 tasks are needed for this function.
- 12 hours of effort are needed for this function.

### 2. The Scope of the Product: This function lets an administrator control whether a user account can access the system.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display the current active status for each user account.
_ Shall allow the administrator to disable an active account.
_ Shall allow the administrator to re-enable a disabled account.
_ Shall prevent disabled accounts from logging in.
_ Shall update the user list after the active status changes.

#### b. Data Requirement: The selected user account must exist, and the active status must be stored as a valid boolean value.

## Use Case 9: Delete user account

### 1. The Scope of the Work
- This occurs in sprint 2 in the process.
- 4 tasks are needed for this function.
- 16 hours of effort are needed for this function.

### 2. The Scope of the Product: This function allows an administrator to remove a user account when it is no longer needed.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display a delete action for administrator-managed accounts.
_ Shall ask for confirmation before deleting an account.
_ Shall remove related activity log records when the user is deleted.
_ Shall reject deletion when other business records still reference the user account.
_ Shall refresh the user list and show a success notification when deletion succeeds.

#### b. Data Requirement: The selected user ID must exist, and the account must not be referenced by protected business records.

## Use Case 10: View activity logs

### 1. The Scope of the Work
- This occurs in sprint 2 in the process.
- 4 tasks are needed for this function.
- 16 hours of effort are needed for this function.

### 2. The Scope of the Product: This function gives administrators an audit view of important user actions.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display the activity log page for administrators only.
_ Shall retrieve activity log entries from the database in a readable order.
_ Shall show log information such as user, action, timestamp, IP address, and details.
_ Shall support reviewing login, logout, and business activity entries.
_ Shall show an error message when activity logs cannot be loaded.

#### b. Data Requirement: Activity log records must include a valid user reference when available, action type, timestamp, IP address, and action details.

## Use Case 11: Manage categories

### 1. The Scope of the Work
- This occurs in sprint 3 in the process.
- 4 tasks are needed for this function.
- 16 hours of effort are needed for this function.

### 2. The Scope of the Product: This function supports product classification for warehouse inventory.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display the category list to authorized users.
_ Shall allow administrators and managers to create a new category.
_ Shall allow administrators and managers to update an existing category.
_ Shall allow administrators and managers to delete or archive a category when permitted.
_ Shall refresh the category list after successful changes.
_ Shall show a failure notification when category data is invalid or the category cannot be changed.

#### b. Data Requirement: The category name must be provided, and category records referenced by products must be handled safely.

## Use Case 12: Manage products

### 1. The Scope of the Work
- This occurs in sprint 3 in the process.
- 8 tasks are needed for this function.
- 40 hours of effort are needed for this function.

### 2. The Scope of the Product: This function manages the product master data used by inventory, purchase, and sales workflows.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display the product list with product details and status.
_ Shall allow administrators and managers to create new products.
_ Shall allow administrators and managers to update product information.
_ Shall allow administrators and managers to delete or archive products when permitted.
_ Shall support product search, import, and export where available.
_ Shall link each product to category and supplier information when provided.
_ Shall show success or failure notifications after each product operation.

#### b. Data Requirement: Product data must include valid product name, SKU when used, prices, stock quantity, low-stock threshold, status, unit, category, and supplier information.

## Use Case 13: Manage suppliers

### 1. The Scope of the Work
- This occurs in sprint 3 in the process.
- 4 tasks are needed for this function.
- 16 hours of effort are needed for this function.

### 2. The Scope of the Product: This function manages supplier records used in purchasing and stock inward workflows.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display supplier records to authorized users.
_ Shall allow administrators, managers, and purchasing staff to create suppliers.
_ Shall allow administrators, managers, and purchasing staff to update supplier information.
_ Shall allow administrators, managers, and purchasing staff to delete or archive suppliers when permitted.
_ Shall refresh supplier information after successful changes.
_ Shall display an error notification when supplier data cannot be saved.

#### b. Data Requirement: Supplier data must include a supplier name and may include contact information and address.

## Use Case 14: Manage warehouses

### 1. The Scope of the Work
- This occurs in sprint 3 in the process.
- 5 tasks are needed for this function.
- 24 hours of effort are needed for this function.

### 2. The Scope of the Product: This function manages warehouse locations where inventory is stored.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display the warehouse list to authorized users.
_ Shall allow administrators and managers to create warehouse records.
_ Shall allow administrators and managers to update warehouse name and address.
_ Shall allow administrators and managers to delete or archive warehouses when permitted.
_ Shall display products assigned to a selected warehouse.
_ Shall show success or failure notifications after warehouse operations.

#### b. Data Requirement: Warehouse data must include a valid warehouse name and address, and referenced warehouse inventory must be preserved safely.

## Use Case 15: Assign product to specific warehouse

### 1. The Scope of the Work
- This occurs in sprint 3 in the process.
- 5 tasks are needed for this function.
- 20 hours of effort are needed for this function.

### 2. The Scope of the Product: This function connects product master data with warehouse inventory locations.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall allow administrators and managers to select a warehouse.
_ Shall display products that are already assigned to the selected warehouse.
_ Shall allow administrators and managers to assign a product to the warehouse.
_ Shall create a warehouse inventory record with an opening quantity when assignment succeeds.
_ Shall allow administrators and managers to remove a product from a warehouse when permitted.
_ Shall prevent duplicate assignment of the same product to the same warehouse.

#### b. Data Requirement: A valid warehouse ID and product ID are required, and the product must not already be assigned to the same warehouse.

## Use Case 16: Manage inventory

### 1. The Scope of the Work
- This occurs in sprint 4 in the process.
- 6 tasks are needed for this function.
- 28 hours of effort are needed for this function.

### 2. The Scope of the Product: This function provides visibility into product quantities, stock status, and warehouse movement history.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display inventory records for authorized roles.
_ Shall allow users to view inventory by warehouse and product.
_ Shall support searching or filtering inventory by product and status.
_ Shall display stock status such as out of stock, low stock, and available.
_ Shall display inventory summary information.
_ Shall allow permitted roles to export inventory data.
_ Shall display inventory movement records for roles that can audit stock changes.

#### b. Data Requirement: Inventory data must include product, warehouse, quantity, low-stock threshold, status, and movement history.

## Use Case 17: Approve purchase request

### 1. The Scope of the Work
- This occurs in sprint 4 in the process.
- 5 tasks are needed for this function.
- 20 hours of effort are needed for this function.

### 2. The Scope of the Product: This function controls approval of requests for products that need to be purchased.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display purchase requests to authorized administrators, managers, and purchasing staff.
_ Shall display request details including warehouse, supplier suggestion, notes, and requested items.
_ Shall allow permitted users to approve or reject a purchase request.
_ Shall prevent unauthorized roles from changing purchase request status.
_ Shall update the request status in the database after approval or rejection.
_ Shall show a success or failure notification after the status change.

#### b. Data Requirement: The purchase request must exist, must contain valid item quantities, and must be in a status that allows approval or rejection.

## Use Case 18: Review sales order

### 1. The Scope of the Work
- This occurs in sprint 4 in the process.
- 5 tasks are needed for this function.
- 20 hours of effort are needed for this function.

### 2. The Scope of the Product: This function lets authorized users review sales orders before shipment or completion.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display sales orders to administrators, managers, sales staff, and warehouse staff.
_ Shall display order details including customer information, warehouse, products, quantities, and prices.
_ Shall allow authorized roles to review stock availability for each sales order item.
_ Shall allow permitted roles to update the sales order status.
_ Shall prevent invalid status transitions where the order cannot proceed.
_ Shall show a success or failure notification after reviewing or updating the order.

#### b. Data Requirement: Sales order data must include valid customer information, product lines, warehouse IDs, ordered quantities, prices, and current order status.

## Use Case 19: Approve stock inward

### 1. The Scope of the Work
- This occurs in sprint 4 in the process.
- 5 tasks are needed for this function.
- 20 hours of effort are needed for this function.

### 2. The Scope of the Product: This function controls approval and completion of received goods before inventory is increased.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display stock inward records to authorized roles.
_ Shall display inward details including warehouse, purchase order, notes, received products, quantities, and prices.
_ Shall allow administrators, managers, and warehouse staff to update stock inward status.
_ Shall increase inventory quantities when stock inward is completed.
_ Shall reject invalid status changes or invalid received quantities.
_ Shall show a success or failure notification after the stock inward update.

#### b. Data Requirement: The stock inward record must exist, must reference a valid warehouse and purchase order when applicable, and item quantities must be valid.

## Use Case 20: View suppliers

### 1. The Scope of the Work
- This occurs in sprint 4 in the process.
- 3 tasks are needed for this function.
- 8 hours of effort are needed for this function.

### 2. The Scope of the Product: This function helps purchasing staff select and review supplier information during procurement.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display a supplier list for purchasing staff and other authorized roles.
_ Shall allow users to view supplier detail information.
_ Shall support supplier selection when creating purchase requests or purchase orders.
_ Shall show an error notification when supplier data cannot be loaded.

#### b. Data Requirement: Supplier records must include an ID, supplier name, and available contact or address information.

## Use Case 21: Create purchase order from purchase request

### 1. The Scope of the Work
- This occurs in sprint 4 in the process.
- 6 tasks are needed for this function.
- 28 hours of effort are needed for this function.

### 2. The Scope of the Product: This function converts approved purchase demand into an actionable purchase order.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall allow administrators, managers, and purchasing staff to create purchase orders.
_ Shall allow the user to select an approved purchase request when creating the order.
_ Shall copy relevant request items into the purchase order.
_ Shall allow supplier and notes to be confirmed before saving.
_ Shall create purchase order details for each ordered product.
_ Shall update the related purchase request status after conversion where applicable.
_ Shall show a success or failure notification after purchase order creation.

#### b. Data Requirement: A valid purchase request, supplier, product items, ordered quantities, and estimated or negotiated prices are required.

## Use Case 22: Edit and send purchase order

### 1. The Scope of the Work
- This occurs in sprint 4 in the process.
- 5 tasks are needed for this function.
- 22 hours of effort are needed for this function.

### 2. The Scope of the Product: This function lets purchasing users maintain purchase orders and move them through procurement statuses.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display existing purchase orders to authorized purchasing roles.
_ Shall allow permitted users to edit supplier, notes, and order status.
_ Shall display purchase order details before saving changes.
_ Shall validate the selected purchase order status.
_ Shall save changes to the purchase order in the database.
_ Shall show a success or failure notification after updating the purchase order.

#### b. Data Requirement: The purchase order must exist, the supplier must be valid, and the status must be one of the supported purchase order statuses.

## Use Case 23: Create stock inward form

### 1. The Scope of the Work
- This occurs in sprint 4 in the process.
- 6 tasks are needed for this function.
- 30 hours of effort are needed for this function.

### 2. The Scope of the Product: This function records incoming goods from purchase orders before final approval and inventory update.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall allow authorized roles to open a stock inward creation form.
_ Shall allow the user to select warehouse and purchase order information.
_ Shall allow received product quantities and purchase prices to be entered.
_ Shall validate that received quantities are positive and linked to valid products.
_ Shall create a stock inward record awaiting approval.
_ Shall show a success or failure notification after the stock inward form is submitted.

#### b. Data Requirement: The stock inward form requires a valid warehouse, optional purchase order, product items, received quantities, unit prices, and notes when provided.

## Use Case 24: Create purchase request

### 1. The Scope of the Work
- This occurs in sprint 5 in the process.
- 5 tasks are needed for this function.
- 24 hours of effort are needed for this function.

### 2. The Scope of the Product: This function lets warehouse and purchasing users request additional stock when products are needed.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall allow authorized users to create a purchase request.
_ Shall allow the user to select warehouse, supplier suggestion, products, requested quantities, and notes.
_ Shall support checking product quantity or stock status before creating the request.
_ Shall validate requested quantities before submission.
_ Shall save the purchase request with pending approval status.
_ Shall show a success or failure notification after the request is submitted.

#### b. Data Requirement: A valid warehouse, product list, requested quantities, optional supplier suggestion, and optional notes are required.

## Use Case 25: Check and complete stock inward

### 1. The Scope of the Work
- This occurs in sprint 5 in the process.
- 6 tasks are needed for this function.
- 32 hours of effort are needed for this function.

### 2. The Scope of the Product: This function lets warehouse staff verify received goods and complete stock inward records.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display stock inward records assigned to authorized warehouse users.
_ Shall show expected products and quantities for checking.
_ Shall allow the user to confirm received quantities and product information.
_ Shall allow permitted users to change the stock inward status to completed when checking succeeds.
_ Shall increase product quantity in the related warehouse when the stock inward is completed.
_ Shall show an error notification when quantities or statuses are invalid.

#### b. Data Requirement: The stock inward record must be approved or otherwise ready for completion, and received quantities must match valid product and warehouse records.

## Use Case 26: Manage sales order fulfillment

### 1. The Scope of the Work
- This occurs in sprint 5 in the process.
- 6 tasks are needed for this function.
- 32 hours of effort are needed for this function.

### 2. The Scope of the Product: This function supports warehouse processing of customer sales orders from stock check to shipment completion.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display sales orders that require warehouse action.
_ Shall allow warehouse staff to view order items and required quantities.
_ Shall check that warehouse inventory can fulfill the ordered quantity.
_ Shall allow permitted users to update order status such as awaiting shipment, shipped, completed, or cancelled.
_ Shall decrease inventory quantities when fulfillment is completed where applicable.
_ Shall record inventory movement for stock leaving the warehouse.
_ Shall show success or failure notifications after fulfillment actions.

#### b. Data Requirement: Sales order fulfillment requires a valid sales order, product lines, warehouse IDs, available inventory quantity, and a valid target status.

## Use Case 27: View stock take

### 1. The Scope of the Work
- This occurs in sprint 5 in the process.
- 3 tasks are needed for this function.
- 12 hours of effort are needed for this function.

### 2. The Scope of the Product: This function gives authorized users visibility into stock take records and physical inventory checks.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display stock take records to administrators, managers, and warehouse staff.
_ Shall allow the user to open stock take details.
_ Shall display counted products and related stock take information.
_ Shall prevent unauthorized users from viewing stock take data.
_ Shall show an error notification when stock take records cannot be loaded.

#### b. Data Requirement: Stock take viewing requires existing stock take records, valid product references, warehouse information, and counted quantity data.

## Use Case 28: Create sales order

### 1. The Scope of the Work
- This occurs in sprint 5 in the process.
- 6 tasks are needed for this function.
- 28 hours of effort are needed for this function.

### 2. The Scope of the Product: This function lets sales users create customer orders that will later be fulfilled by the warehouse.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall allow administrators, managers, and sales staff to create a sales order.
_ Shall collect customer name, email, phone, shipping address, and notes.
_ Shall allow the user to add products, warehouse, ordered quantity, and sale price.
_ Shall validate required customer and order item information before saving.
_ Shall save the sales order with an initial stock-check status.
_ Shall show a success or failure notification after sales order creation.

#### b. Data Requirement: Customer information, product IDs, warehouse IDs, ordered quantities, unit sale prices, and notes when provided must be valid.

## Use Case 29: Track sales order request

### 1. The Scope of the Work
- This occurs in sprint 5 in the process.
- 4 tasks are needed for this function.
- 16 hours of effort are needed for this function.

### 2. The Scope of the Product: This function allows sales users to follow customer order progress after the order is created.

### 3. Functional and Data Requirements
#### a. Functional Requirement
_ Shall display sales orders and their current statuses to authorized users.
_ Shall allow the user to view details for a selected sales order.
_ Shall show fulfillment progress through statuses such as pending stock check, awaiting shipment, shipped, completed, and cancelled.
_ Shall allow creation of a new sales order from the sales order area.
_ Shall refresh order data after status changes are made by permitted roles.

#### b. Data Requirement: The sales order request must exist and must contain valid customer data, item data, warehouse data, and current order status.
