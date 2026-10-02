import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import "./App.css"; // Essential: Import the new enterprise CSS

// --- Global Constants ---
const API_URL = "https://localhost:7297/api/products";
const CATEGORIES = ["Electronics", "Grocery", "Clothing", "Other"];
const LOW_STOCK_THRESHOLD = 5;

// Utility for formatting currency securely
const formatCurrency = (value) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);

export default function App() {
  // --- Application State ---
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Filters & Sorting
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState("default");

  // View & Form State
  const [viewMode, setViewMode] = useState("list"); // 'list' | 'form'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ productName: "", category: "", price: "", stockQuantity: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [productToDelete, setProductToDelete] = useState(null);

  // --- Initial Data Fetch ---
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setProducts(res.data);
      setApiError("");
    } catch (err) {
      setApiError("Connection failed. Ensure the .NET API is running at " + API_URL);
    } finally {
      setLoading(false);
    }
  };

  // --- Helpers ---
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 400); // clear after 4 seconds
  };

  const getCategoryBadgeClass = (category) => {
    const format = category?.toLowerCase();
    if (["electronics", "grocery", "clothing"].includes(format)) {
      return `badge badge-${format}`;
    }
    return "badge badge-other";
  };

  // --- Form Handlers & Validation ---
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ productName: "", category: "", price: "", stockQuantity: "" });
    setFieldErrors({});
    setApiError("");
    setViewMode("form");
  };

  const handleOpenEdit = (product) => {
    setEditingId(product.productId);
    setFormData({
      productName: product.productName,
      category: product.category,
      price: product.price,
      stockQuantity: product.stockQuantity,
    });
    setFieldErrors({});
    setApiError("");
    setViewMode("form");
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.productName.trim()) errors.productName = "Product name is required.";
    if (!formData.category) errors.category = "Please select a category.";
    if (formData.price === "" || Number(formData.price) <= 0) errors.price = "Price must be > 0.";
    if (
      formData.stockQuantity === "" ||
      Number(formData.stockQuantity) < 0 ||
      !Number.isInteger(Number(formData.stockQuantity))
    ) {
      errors.stockQuantity = "Stock must be a positive integer.";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setApiError("");

    const payload = {
      productName: formData.productName.trim(),
      category: formData.category,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity, 10),
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        showSuccess(`"${payload.productName}" updated successfully.`);
      } else {
        await axios.post(API_URL, payload);
        showSuccess(`"${payload.productName}" added to catalog.`);
      }
      setViewMode("list");
      fetchProducts();
    } catch (err) {
      setApiError(err.response?.data?.message || "Server validation failed.");
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    try {
      await axios.delete(`${API_URL}/${productToDelete.productId}`);
      showSuccess(`"${productToDelete.productName}" has been deleted.`);
      fetchProducts();
    } catch (err) {
      setApiError(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setProductToDelete(null);
    }
  };

  // --- Derived State (Performance Optimized with useMemo) ---
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => (selectedCategory === "All" ? true : p.category === selectedCategory))
      .filter((p) => p.productName.toLowerCase().includes(searchTerm.toLowerCase().trim()))
      .sort((a, b) => {
        if (sortOrder === "price-asc") return a.price - b.price;
        if (sortOrder === "price-desc") return b.price - a.price;
        return a.productId - b.productId;
      });
  }, [products, selectedCategory, searchTerm, sortOrder]);

  const kpiMetrics = useMemo(() => {
    return {
      totalValue: products.reduce((sum, p) => sum + p.price * p.stockQuantity, 0),
      lowStock: products.filter((p) => p.stockQuantity < LOW_STOCK_THRESHOLD).length,
      totalUnits: products.reduce((sum, p) => sum + p.stockQuantity, 0),
    };
  }, [products]);

  // --- Render ---
  return (
    <>
      <nav className="navbar" aria-label="Main Navigation">
        <div className="brand-title">
          <span className="brand-badge">📦</span>
          <span>Product Management System</span>
        </div>
        <div className="admin-pill">
          <span>👤</span> Admin Portal
        </div>
      </nav>

      <main className="container">
        {/* Global Notifications */}
        {successMsg && (
          <div className="alert alert-success" role="alert">
            <span>✅</span> {successMsg}
          </div>
        )}
        {apiError && (
          <div className="alert alert-error" role="alert">
            <span>⚠️</span> {apiError}
          </div>
        )}

        {/* KPI Dashboard */}
        <section className="kpi-grid" aria-label="Key Performance Indicators">
          <div className="kpi-card">
            <div>
              <div className="kpi-label">Total Products</div>
              <div className="kpi-value">{products.length}</div>
            </div>
            <div className="kpi-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>🏷️</div>
          </div>
          <div className="kpi-card">
            <div>
              <div className="kpi-label">Total Units</div>
              <div className="kpi-value">{kpiMetrics.totalUnits}</div>
            </div>
            <div className="kpi-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>📊</div>
          </div>
          <div className="kpi-card" style={{ borderColor: kpiMetrics.lowStock > 0 ? "#fecaca" : "var(--border-color)" }}>
            <div>
              <div className="kpi-label" style={{ color: "#dc2626" }}>Low Stock Alerts</div>
              <div className="kpi-value" style={{ color: "#dc2626" }}>{kpiMetrics.lowStock}</div>
            </div>
            <div className="kpi-icon" style={{ background: "#fef2f2", color: "#dc2626" }}>⚠️</div>
          </div>
          <div className="kpi-card">
            <div>
              <div className="kpi-label">Inventory Value</div>
              <div className="kpi-value" style={{ color: "#0f766e" }}>{formatCurrency(kpiMetrics.totalValue)}</div>
            </div>
            <div className="kpi-icon" style={{ background: "#f0fdfa", color: "#0d9488" }}>💰</div>
          </div>
        </section>

        {/* View Routing */}
        {viewMode === "list" ? (
          <section className="surface-card">
            <header className="flex-between" style={{ marginBottom: "1.5rem" }}>
              <div>
                <h2 className="h2-title">Product Catalog</h2>
                <p className="text-muted">Manage inventory, pricing, and categorizations.</p>
              </div>
              <button className="btn btn-primary" onClick={handleOpenAdd}>
                ＋ Add Product
              </button>
            </header>

            {/* Filter & Search Toolbar */}
            <div className="toolbar">
              <div className="flex-gap">
                <label htmlFor="categoryFilter" className="form-label" style={{ margin: 0 }}>Category:</label>
                <select
                  id="categoryFilter"
                  className="select-control"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ width: "auto" }}
                >
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>

              <input
                type="text"
                className="input-control"
                placeholder="🔍 Search products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, minWidth: "200px" }}
                aria-label="Search products"
              />

              <select
                className="select-control"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                style={{ width: "auto" }}
                aria-label="Sort products"
              >
                <option value="default">Sort: Default</option>
                <option value="price-asc">Price: Low to High ↑</option>
                <option value="price-desc">Price: High to Low ↓</option>
              </select>
            </div>

            {/* Data Table */}
            {loading ? (
              <div className="empty-state">⏳ Loading catalog...</div>
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
                <h3 style={{ color: "#334155" }}>No matching products found</h3>
                <p>Adjust your filters or add a new product.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="product-table">
                  <thead>
                    <tr>
                      <th>Product Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock Qty</th>
                      <th style={{ width: "180px", textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => {
                      const isLowStock = product.stockQuantity < LOW_STOCK_THRESHOLD;
                      return (
                        <tr key={product.productId} className={isLowStock ? "row-low-stock" : ""}>
                          <td style={{ fontWeight: 600 }}>{product.productName}</td>
                          <td><span className={getCategoryBadgeClass(product.category)}>{product.category}</span></td>
                          <td style={{ fontWeight: 700 }}>{formatCurrency(product.price)}</td>
                          <td>
                            <div className="flex-gap">
                              <span style={{ fontWeight: 700, color: isLowStock ? "#dc2626" : "inherit" }}>
                                {product.stockQuantity}
                              </span>
                              {isLowStock && <span className="badge-alert">⚠️ Low</span>}
                            </div>
                          </td>
                          <td style={{ textAlign: "right" }}>
                            <div className="flex-gap" style={{ justifyContent: "flex-end" }}>
                              <button className="btn btn-secondary" onClick={() => handleOpenEdit(product)} aria-label={`Edit ${product.productName}`}>
                                ✏️
                              </button>
                              <button className="btn btn-secondary" style={{ color: "#e11d48" }} onClick={() => setProductToDelete(product)} aria-label={`Delete ${product.productName}`}>
                                🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            
            {!loading && (
              <div className="text-muted" style={{ marginTop: "1rem" }}>
                Showing <strong>{filteredProducts.length}</strong> of <strong>{products.length}</strong> products
              </div>
            )}
          </section>
        ) : (
          /* FORM VIEW */
          <section className="surface-card form-container">
            <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
              <h2 className="h2-title">{editingId ? "Edit Product" : "Add New Product"}</h2>
              <p className="text-muted">Ensure all fields are filled out accurately before saving.</p>
            </div>

            <form onSubmit={handleSaveProduct} noValidate>
              <div className="form-group">
                <label htmlFor="productName" className="form-label">Product Name <span className="required-asterisk">*</span></label>
                <input
                  id="productName"
                  type="text"
                  className={`input-control ${fieldErrors.productName ? "input-error" : ""}`}
                  placeholder="e.g., Wireless Mouse"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                />
                {fieldErrors.productName && <div className="error-text">{fieldErrors.productName}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="category" className="form-label">Category <span className="required-asterisk">*</span></label>
                <select
                  id="category"
                  className={`select-control ${fieldErrors.category ? "input-error" : ""}`}
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                {fieldErrors.category && <div className="error-text">{fieldErrors.category}</div>}
              </div>

              <div className="form-row">
                <div>
                  <label htmlFor="price" className="form-label">Price ($) <span className="required-asterisk">*</span></label>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    className={`input-control ${fieldErrors.price ? "input-error" : ""}`}
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                  {fieldErrors.price && <div className="error-text">{fieldErrors.price}</div>}
                </div>
                <div>
                  <label htmlFor="stockQuantity" className="form-label">Stock Quantity <span className="required-asterisk">*</span></label>
                  <input
                    id="stockQuantity"
                    type="number"
                    className={`input-control ${fieldErrors.stockQuantity ? "input-error" : ""}`}
                    placeholder="0"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  />
                  {fieldErrors.stockQuantity && <div className="error-text">{fieldErrors.stockQuantity}</div>}
                </div>
              </div>

              <div className="flex-gap" style={{ justifyContent: "flex-end", marginTop: "2rem" }}>
                <button type="button" className="btn btn-secondary" onClick={() => setViewMode("list")}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  💾 {editingId ? "Update Product" : "Save Product"}
                </button>
              </div>
            </form>
          </section>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-box">
            <button className="modal-close" onClick={() => setProductToDelete(null)} aria-label="Close modal">✕</button>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗑️</div>
            <h3 className="h2-title" style={{ marginBottom: "0.5rem" }}>Confirm Deletion</h3>
            <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
              Are you sure you want to permanently delete <strong>{productToDelete.productName}</strong>? This action cannot be undone.
            </p>
            <div className="flex-gap" style={{ justifyContent: "center" }}>
              <button className="btn btn-secondary" onClick={() => setProductToDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={handleConfirmDelete}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}