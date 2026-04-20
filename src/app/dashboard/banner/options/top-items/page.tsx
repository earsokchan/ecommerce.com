"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../../../../../components/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../../components/ui/dialog";
import { Button } from "../../../../../components/ui/button";

interface Product {
  _id: string;
  name: string;
  price?: number;
  brand?: string;
  category?: string;
  productItems?: { productimages?: string[] }[];
}

export default function AddTopproductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showTopDialog, setShowTopDialog] = useState(false);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [topLoading, setTopLoading] = useState(false);
  const [editTopDialog, setEditTopDialog] = useState(false);
  const [editingTopProduct, setEditingTopProduct] = useState<any>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const editNameRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const API_BASE_URL = "https://api.targetclothe.online";
  const LEGACY_API_BASE_URL = "https://api.targetclothe.online";
  const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imhlbmdzb3Rob24iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzU1NDA1OTEsImV4cCI6MTc3ODEzMjU5MX0.EbwnPvdaXHJC2RPreoGfHD1rF39UtElcgDQkC-ryoxo";

  useEffect(() => {
    setLoading(true);
    fetch(`${LEGACY_API_BASE_URL}/api/products`, {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const fetchTopProducts = async () => {
    setTopLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/top/items`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      const data = await res.json();
      setTopProducts(Array.isArray(data) ? data : []);
    } finally {
      setTopLoading(false);
    }
  };

  const handleOpenTopDialog = () => {
    setShowTopDialog(true);
    fetchTopProducts();
  };

  const handleSelect = (id: string) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedProductIds.size === products.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(new Set(products.map((p) => p._id)));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProductIds.size === 0) return;
    setSubmitting(true);
    setErrorMessage(null);
    try {
      // Send each selected productId to the API
      await Promise.all(
        Array.from(selectedProductIds).map((productId) =>
          fetch(`${LEGACY_API_BASE_URL}/api/top/items`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${TOKEN}`,
            },
            body: JSON.stringify({ productId }),
          })
        )
      );
      setSuccessMessage(`Successfully added ${selectedProductIds.size} product(s) as top products!`);
      setSelectedProductIds(new Set());
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      setErrorMessage("Failed to add products. Please try again.");
      console.error("Error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // Edit Top Product (example: only edit name)
  const handleEditTopProduct = (item: any) => {
    setEditingTopProduct(item);
    setEditTopDialog(true);
  };

  const handleSaveEditTopProduct = async () => {
    if (!editingTopProduct) return;
    const newName = editNameRef.current?.value || editingTopProduct.product?.name;
    try {
      await fetch(`${LEGACY_API_BASE_URL}/api/products/${editingTopProduct.product._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({ name: newName }),
      });
      setEditTopDialog(false);
      setEditingTopProduct(null);
      fetchTopProducts();
    } catch (err) {
      // handle error
    }
  };

  // Delete Top Product
  const handleDeleteTopProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this top product?")) return;
    try {
      await fetch(`${LEGACY_API_BASE_URL}/api/top/items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${TOKEN}`,
        },
      });
      fetchTopProducts();
    } catch (err) {
      // handle error
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8 md:ml-64">
        {/* SUCCESS MESSAGE TOAST */}
        {successMessage && (
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-green-500 text-white rounded-lg shadow-2xl p-4 flex items-center gap-3 max-w-sm">
              <span className="text-2xl">✓</span>
              <div className="flex-1">
                <p className="font-semibold">Success!</p>
                <p className="text-sm text-green-100">{successMessage}</p>
              </div>
              <button
                onClick={() => setSuccessMessage(null)}
                className="ml-4 text-green-200 hover:text-white transition"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ERROR MESSAGE ALERT */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{errorMessage}</p>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-red-600 hover:text-red-800 text-sm mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Top Products Selection</h1>
            <p className="text-gray-600">Select products to add as top products for your store.</p>
          </div>
          <Button
            type="button"
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={handleOpenTopDialog}
          >
            View Top Products
          </Button>
        </div>
        {/* Top Products Dialog */}
        <Dialog open={showTopDialog} onOpenChange={setShowTopDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Top Products</DialogTitle>
            </DialogHeader>
            {topLoading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : topProducts.length === 0 ? (
              <div className="text-center text-gray-500 py-8">No top products found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Image</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Brand</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Price</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProducts.map((item) => (
                      <tr key={item._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                        <td className="px-4 py-3">
                          {item.product?.productItems?.[0]?.productimages?.[0] ? (
                            <img
                              src={item.product.productItems[0].productimages[0]}
                              alt={item.product.name}
                              className="w-12 h-12 rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/50";
                              }}
                            />
                          ) : (
                            <span className="text-gray-400">No Image</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{item.product?.name}</td>
                        <td className="px-4 py-3 text-gray-700">{item.product?.brand}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                            {item.product?.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-green-700 font-bold">
                          ${item.product?.price}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            className="mr-2"
                            onClick={() => handleEditTopProduct(item)}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteTopProduct(item._id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTopDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Edit Top Product Dialog */}
        <Dialog open={editTopDialog} onOpenChange={setEditTopDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Top Product</DialogTitle>
            </DialogHeader>
            {editingTopProduct && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">Product Name</label>
                <input
                  ref={editNameRef}
                  defaultValue={editingTopProduct.product?.name}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
                <DialogFooter>
                  <Button variant="outline" onClick={() => setEditTopDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveEditTopProduct}>
                    Save
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
        <form onSubmit={handleSubmit} className="w-full max-w-5xl mx-auto">
          <div className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm mb-4 flex items-center gap-4 px-4 py-3 rounded-t-lg">
            <input
              type="checkbox"
              checked={selectedProductIds.size === products.length && products.length > 0}
              onChange={handleSelectAll}
              className="w-4 h-4"
              id="select-all"
            />
            <label htmlFor="select-all" className="text-sm font-medium">
              Select All
            </label>
            <button
              type="submit"
              disabled={selectedProductIds.size === 0 || submitting}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {submitting ? "Adding..." : "Add Selected as Top Products"}
            </button>
            <span className="ml-auto text-sm text-gray-500">
              {selectedProductIds.size} selected
            </span>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            {loading ? (
              <div className="text-center text-gray-500 py-12">Loading...</div>
            ) : products.length === 0 ? (
              <div className="text-center text-gray-500 py-12 text-lg">No products found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-center w-10"></th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Image</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Name</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Brand</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700">Category</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-700">Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product._id}
                        className={`border-b border-gray-200 hover:bg-gray-50 transition ${
                          selectedProductIds.has(product._id)
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <td className="px-4 py-3 text-center">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.has(product._id)}
                            onChange={() => handleSelect(product._id)}
                            className="w-4 h-4 cursor-pointer"
                            id={`select-${product._id}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          {product.productItems?.[0]?.productimages?.[0] ? (
                            <img
                              src={product.productItems[0].productimages[0]}
                              alt={product.name}
                              className="w-12 h-12 rounded object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "https://via.placeholder.com/50";
                              }}
                            />
                          ) : (
                            <span className="text-gray-400">No Image</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold text-gray-800">{product.name}</td>
                        <td className="px-4 py-3 text-gray-700">{product.brand}</td>
                        <td className="px-4 py-3">
                          <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-green-700 font-bold">
                          ${product.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
          </div>
        </form>
      </main>
    </div>
  );
}
