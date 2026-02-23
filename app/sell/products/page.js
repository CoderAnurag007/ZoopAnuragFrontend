"use client";

import React, { useState, useCallback, useEffect } from "react";
import styles from "../../styles/products.module.css";
import axios from "axios";

const LOW_STOCK_THRESHOLD = 5;

const getStockBadgeClass = (stock) => {
  if (stock <= 0) return styles.stockOut;
  if (stock <= LOW_STOCK_THRESHOLD) return styles.stockLow;
  return styles.stockOk;
};

const initialProducts = [
  {
    id: "1",
    name: "Wireless Earbuds Pro",
    sku: "SKU-001",
    description: "Premium noise-cancelling wireless earbuds.",
    price: "2499",
    imageUrl:
      "https://images.unsplash.com/photo-1598331668826-20cecc596b86?w=200&h=200&fit=crop",
    category: "Electronics",
    stock: 42,
  },
  {
    id: "2",
    name: "Organic Cotton T-Shirt",
    sku: "SKU-002",
    description: "Soft unisex organic cotton tee.",
    price: "899",
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
    category: "Apparel",
    stock: 3,
  },
  {
    id: "3",
    name: "Stainless Steel Bottle",
    sku: "SKU-003",
    description: "1L insulated bottle, BPA-free.",
    price: "1299",
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542e6b42?w=200&h=200&fit=crop",
    category: "Lifestyle",
    stock: 0,
  },
];

const emptyProduct = () => ({
  id: "",
  name: "",
  sku: "",
  description: "",
  price: "",
  imageUrl: "",
  category: "",
  stock: 0,
});

export default function ProductsPage() {
  const [products, setProducts] = useState(initialProducts);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyProduct());

  const openAdd = useCallback(() => {
    setEditingId(null);
    setForm(emptyProduct());
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((product) => {
    setEditingId(product.id);
    setForm({ ...product });
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
    setForm(emptyProduct());
  }, []);
  const [loading, setLoading] = useState(false);

  const getProducts = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
        {
          headers: {
            Authorization: `Bearer ${
              document.cookie
                .split("; ")
                .find((row) => row.startsWith("token="))
                ?.split("=")[1]
            }`,
          },
        },
      );
      setProducts(response.data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!form.name?.trim()) return;

    const payload = {
      ...form,
      price: form.price?.toString().replace(/\D/g, "") || "0",
      stock: Math.max(0, parseInt(form.stock, 10) || 0),
    };

    if (editingId) {
      // setProducts((prev) =>
      //   prev.map((p) => (p.id === editingId ? { ...payload, id: p.id } : p)),
      // );
      try {
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products/${editingId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${
                document.cookie
                  .split("; ")
                  .find((row) => row.startsWith("token="))
                  ?.split("=")[1]
              }`,
            },
          },
        );
        setProducts((prev) =>
          prev.map((p) => (p.id === editingId ? { ...payload, id: p.id } : p)),
        );
      } catch (error) {
        console.error("Error updating product:", error);
      }
      setLoading(false);
    } else {
      // setProducts((prev) => [...prev, { ...payload, id: String(Date.now()) }]);
      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/api/products`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${
                document.cookie
                  .split("; ")
                  .find((row) => row.startsWith("token="))
                  ?.split("=")[1]
              }`,
            },
          },
        );
        setProducts((prev) => [...prev, response.data.product]);
      } catch (error) {
        console.error("Error creating product:", error);
      }
    }
    closeModal();
    setLoading(false);
  };

  const handleDelete = (id) => {
    if (
      typeof window !== "undefined" &&
      window.confirm("Delete this product?")
    ) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      if (editingId === id) closeModal();
    }
  };

  const updateStock = (id, newStock) => {
    const num = Math.max(0, parseInt(newStock, 10));
    if (Number.isNaN(num)) return;
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: num } : p)),
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.headerText}>
            <span className={styles.badge}>Catalog</span>
            <h1 className={styles.title}>Products</h1>
            <p className={styles.subtitle}>
              Add, edit, and manage inventory for your products.
            </p>
          </div>
          <button type="button" className={styles.btnAdd} onClick={openAdd}>
            <span>+</span> Add product
          </button>
        </header>

        <div className={styles.tableWrap}>
          {products.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>📦</div>
              <div className={styles.emptyTitle}>No products yet</div>
              <p>Add your first product to start selling.</p>
              <button
                type="button"
                className={styles.btnAdd}
                onClick={openAdd}
                style={{ marginTop: "1rem" }}
              >
                + Add product
              </button>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.th}>Product</th>
                  <th className={styles.th}>Price</th>
                  <th className={styles.th}>Inventory</th>
                  <th className={styles.th} style={{ width: 120 }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className={styles.tr}>
                    <td className={styles.td}>
                      <div className={styles.productCell}>
                        <img
                          src={p.imageUrl || "https://via.placeholder.com/48"}
                          alt=""
                          className={styles.productImage}
                        />
                        <div>
                          <div className={styles.productName}>{p.name}</div>
                          <div className={styles.productSku}>
                            {p.sku || "—"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.price}>
                        ₹{Number(p.price).toLocaleString("en-IN")}
                      </span>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.stockWrap}>
                        <input
                          type="number"
                          min={0}
                          className={styles.stockInput}
                          value={p.stock}
                          onChange={(e) => updateStock(p.id, e.target.value)}
                        />
                        <span
                          className={`${styles.stockBadge} ${getStockBadgeClass(
                            p.stock,
                          )}`}
                        >
                          {p.stock <= 0
                            ? "Out"
                            : p.stock <= LOW_STOCK_THRESHOLD
                              ? "Low"
                              : "In stock"}
                        </span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={`${styles.btnIcon} ${styles.btnEdit}`}
                          onClick={() => openEdit(p)}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          className={`${styles.btnIcon} ${styles.btnDelete}`}
                          onClick={() => handleDelete(p.id)}
                          title="Delete"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && (
        <div
          className={styles.overlay}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 id="modal-title" className={styles.modalTitle}>
                {editingId ? "Edit product" : "Add product"}
              </h2>
              <button
                type="button"
                className={styles.modalClose}
                onClick={closeModal}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="name">
                    Product name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    className={styles.input}
                    placeholder="e.g. Wireless Earbuds Pro"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="description">
                    Description
                  </label>
                  <textarea
                    id="description"
                    className={styles.textarea}
                    placeholder="Short description for the product"
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
                <div className={styles.row2}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="price">
                      Price (₹)
                    </label>
                    <input
                      id="price"
                      type="text"
                      className={styles.input}
                      placeholder="999"
                      value={form.price}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          price: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="stock">
                      Stock
                    </label>
                    <input
                      id="stock"
                      type="number"
                      min={0}
                      className={styles.input}
                      placeholder="0"
                      value={form.stock}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          stock: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className={styles.row2}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="sku">
                      SKU
                    </label>
                    <input
                      id="sku"
                      type="text"
                      className={styles.input}
                      placeholder="SKU-001"
                      value={form.sku}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, sku: e.target.value }))
                      }
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="category">
                      Category
                    </label>
                    <input
                      id="category"
                      type="text"
                      className={styles.input}
                      placeholder="Electronics"
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="imageUrl">
                    Image URL
                  </label>
                  <input
                    id="imageUrl"
                    type="url"
                    className={styles.input}
                    placeholder="https://..."
                    value={form.imageUrl}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, imageUrl: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className={styles.modalFooter}>
                <button
                  type="button"
                  className={styles.btnSecondary}
                  onClick={closeModal}
                >
                  Cancel
                </button>
                {editingId && (
                  <button
                    type="button"
                    className={styles.btnDanger}
                    onClick={() => {
                      handleDelete(editingId);
                      closeModal();
                    }}
                  >
                    Delete
                  </button>
                )}
                <button type="submit" className={styles.btnSubmit}>
                  {editingId ? "Save changes" : "Add product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
