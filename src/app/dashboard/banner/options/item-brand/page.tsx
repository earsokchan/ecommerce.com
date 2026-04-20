"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "../../../../../components/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../../../components/ui/dialog";
import { Button } from "../../../../../components/ui/button";
import { Input } from "../../../../../components/ui/input";
import { Label } from "../../../../../components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../../../components/ui/card";

interface ItemBrand {
  _id: string;
  item_brand: string;
  image?: string;
  __v?: number;
}

export default function ItemBrandPage() {
  const API_BASE_URL = "https://api.targetclothe.online";
  const itemBrandApi = `${API_BASE_URL}/api/item/brands`;

  const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imhlbmdzb3Rob24iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzU1NDA1OTEsImV4cCI6MTc3ODEzMjU5MX0.EbwnPvdaXHJC2RPreoGfHD1rF39UtElcgDQkC-ryoxo";

  // Helper function to get headers with token
  const getHeaders = () => ({
    Authorization: `Bearer ${TOKEN}`,
  });

  const [itemBrands, setItemBrands] = useState<ItemBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dialog States
  const [isAddItemBrandOpen, setIsAddItemBrandOpen] = useState(false);
  const [editItemBrandId, setEditItemBrandId] = useState<string | null>(null);
  const [itemBrandName, setItemBrandName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Fetch Item Brands
  const fetchItemBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(itemBrandApi, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch item brands");
      const data = await response.json();
      setItemBrands(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching item brands:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch item brands");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItemBrands();
  }, []);

  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create/Update Item Brand
  const handleAddItemBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsSubmitting(true);

      if (!itemBrandName.trim()) {
        setError("Please enter an item brand name");
        setIsSubmitting(false);
        return;
      }

      const url = editItemBrandId
        ? `${itemBrandApi}/${editItemBrandId}`
        : itemBrandApi;
      const method = editItemBrandId ? "PUT" : "POST";

      // Use FormData to handle file upload
      const formData = new FormData();
      formData.append("item_brand", itemBrandName.trim());
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await fetch(url, {
        method,
        body: formData,
        headers: getHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save item brand");
      }

      const savedItemBrand = await response.json();

      if (editItemBrandId) {
        setItemBrands((prev) =>
          prev.map((b) => (b._id === editItemBrandId ? savedItemBrand : b))
        );
        setSuccessMessage("Item brand updated successfully!");
      } else {
        setItemBrands((prev) => [...prev, savedItemBrand]);
        setSuccessMessage("Item brand created successfully!");
      }

      resetForm();
      setIsAddItemBrandOpen(false);

      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Error saving item brand:", err);
      setError(err instanceof Error ? err.message : "Failed to save item brand");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setItemBrandName("");
    setImageFile(null);
    setImagePreview(null);
    setEditItemBrandId(null);
    setError(null);
  };

  const handleEditItemBrand = (itemBrand: ItemBrand) => {
    setItemBrandName(itemBrand.item_brand);
    setEditItemBrandId(itemBrand._id);
    setImagePreview(itemBrand.image || null);
    setImageFile(null);
    setIsAddItemBrandOpen(true);
  };

  const handleDeleteItemBrand = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item brand?")) return;
    try {
      setError(null);
      const response = await fetch(`${itemBrandApi}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete item brand");
      setItemBrands((prev) => prev.filter((b) => b._id !== id));
      setSuccessMessage("Item brand deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Error deleting item brand:", err);
      setError(err instanceof Error ? err.message : "Failed to delete item brand");
    }
  };

  // Statistics
  const totalItemBrands = itemBrands.length;

  // --- UI ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-4 sm:p-8 md:ml-64">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Item Brands</h1>
          <p className="text-gray-600">Manage product item brands efficiently</p>
        </div>

        {/* Success Popup Toast */}
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

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 text-sm mt-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Item Brands Table Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              Item Brand List
            </h2>
            <Button
              onClick={() => {
                resetForm();
                setIsAddItemBrandOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              + Add Item Brand
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading item brands...</p>
            </div>
          ) : itemBrands.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No item brands found</p>
              <Button
                onClick={() => {
                  resetForm();
                  setIsAddItemBrandOpen(true);
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create First Item Brand
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">
                      #
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">
                      Image
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">
                      Item Brand Name
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">
                      Item Brand ID
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {itemBrands.map((itemBrand, idx) => (
                    <tr
                      key={itemBrand._id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {idx + 1}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {itemBrand.image ? (
                          <img
                            src={itemBrand.image}
                            alt={itemBrand.item_brand}
                            className="w-12 h-12 object-cover rounded border border-gray-300"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-gray-400">
                            No Image
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {itemBrand.item_brand}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded border border-gray-300">
                          {itemBrand._id}
                        </code>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditItemBrand(itemBrand)}
                            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteItemBrand(itemBrand._id)}
                            className="px-3 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition"
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
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Item Brand Dialog */}
      <Dialog open={isAddItemBrandOpen} onOpenChange={setIsAddItemBrandOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editItemBrandId ? "Edit Item Brand" : "Add New Item Brand"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddItemBrand} className="space-y-4">
            <div>
              <Label htmlFor="itemBrandName">Item Brand Name *</Label>
              <Input
                id="itemBrandName"
                placeholder="e.g., Nike, Adidas, Puma"
                value={itemBrandName}
                onChange={(e) => setItemBrandName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="brandImage">Brand Image</Label>
              <Input
                id="brandImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {imagePreview && (
                <div className="mt-3 flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
           

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetForm();
                  setIsAddItemBrandOpen(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!itemBrandName.trim() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    {editItemBrandId ? "Updating..." : "Creating..."}
                  </>
                ) : editItemBrandId ? (
                  "✓ Update Item Brand"
                ) : (
                  "✓ Create Item Brand"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}