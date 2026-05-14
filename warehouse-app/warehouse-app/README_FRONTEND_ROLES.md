# Frontend role dashboards

This `warehouse-app` folder contains a React/Vite frontend for these roles:

- `PURCHASE_STAFF` / Purchasing staff
- `WAREHOUSE_STAFF` / Warehouse staff

## Run frontend

```bash
cd warehouse-app
npm install
npm run dev
```

By default the frontend calls the backend at:

```bash
http://localhost:8080
```

To change it, create `.env` in `warehouse-app`:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

## Pages

- `/login`
- `/purchasing-staff`
- `/warehouse-staff`
- `/dashboard` redirects by role after login

## Main files

- `src/pages/PurchasingStaffDashboard.jsx`
- `src/pages/WarehouseStaffDashboard.jsx`
- `src/services/api.js`
- `src/styles.css`
