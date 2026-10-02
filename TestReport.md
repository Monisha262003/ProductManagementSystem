# 🧪 Acceptance Criteria Test Report

**Project:** Product / Store Management System
**Environment:** Local Development (IIS Express / Node.js)
**Stack:** .NET 8 Web API, React, SQL Server

| ID | Feature / Acceptance Criteria | Status | Notes / Observations |
|:---|:---|:---:|:---|
| **1** | **Database & API Connectivity** | | |
| 1.1 | API successfully connects to SQL Server database. | ✅ PASS | Connection string mapped correctly; EF Core retrieves data. |
| 1.2 | Swagger UI loads and endpoints are accessible. | ✅ PASS | Tested locally at `https://localhost:7172/swagger`. |
| 1.3 | React frontend successfully fetches data from API. | ✅ PASS | Axios handles GET requests without CORS errors. |
| **2** | **Product Management (CRUD)** | | |
| 2.1 | User can add a new product with price and stock. | ✅ PASS | Product successfully persists to the database. |
| 2.2 | User can edit existing product details. | ✅ PASS | Updates reflect immediately in the UI and DB. |
| 2.3 | User can delete a product. | ✅ PASS | Product is removed from the data grid and database. |
| **3** | **Customer Management (CRUD)** | | |
| 3.1 | User can register a new customer with contact details. | ✅ PASS | Customer initials correctly generate in the UI. |
| 3.2 | User can edit or delete a customer profile. | ✅ PASS | Modals/forms successfully process PUT and DELETE requests. |
| **4** | **Order Processing & Inventory Logic** | | |
| 4.1 | User can create an order linking a Customer and Product. | ✅ PASS | Foreign keys accurately map in `Orders` and `OrderDetails`. |
| 4.2 | **Business Logic:** Placing an order reduces product stock. | ✅ PASS | Verified stock quantity decreases mathematically upon checkout. |
| 4.3 | **Business Logic:** Cancelling an order restores stock. | ✅ PASS | Deleting an order detail adds the exact quantity back to inventory. |
| **5** | **UI / UX Features** | | |
| 5.1 | Low stock items (< 5 units) display visual warnings. | ✅ PASS | UI highlights rows in red and displays "Low Stock" badge. |
| 5.2 | Users can search and filter products by category. | ✅ PASS | Client-side filtering works instantly. |
| 5.3 | Application supports toggling Light/Dark theme. | ✅ PASS | CSS variables dynamically switch without page reload. |

**Summary:** All core functionalities, business logic constraints, and UI requirements have been tested and are working as expected. No critical bugs identified.