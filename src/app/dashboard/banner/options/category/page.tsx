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

interface Category {
  _id: string;
  category: string;
  __v?: number;
}

export default function CategoryPage() {
  const API_BASE_URL = "https://api.targetclothe.online";
  const categoryApi = `${API_BASE_URL}/api/categories`;

  const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imhlbmdzb3Rob24iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzU1NDA1OTEsImV4cCI6MTc3ODEzMjU5MX0.EbwnPvdaXHJC2RPreoGfHD1rF39UtElcgDQkC-ryoxo";

  // Helper function to get headers with token
  const getHeaders = () => ({
    Authorization: `Bearer ${TOKEN}`,
    "Content-Type": "application/json",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dialog States
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [categoryName, setCategoryName] = useState("");

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(categoryApi, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Create/Update Category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsSubmitting(true);

      if (!categoryName.trim()) {
        setError("Please enter a category name");
        setIsSubmitting(false);
        return;
      }

      const url = editCategoryId
        ? `${categoryApi}/${editCategoryId}`
        : categoryApi;
      const method = editCategoryId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify({ category: categoryName.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save category");
      }

      const savedCategory = await response.json();

      if (editCategoryId) {
        setCategories((prev) =>
          prev.map((c) => (c._id === editCategoryId ? savedCategory : c))
        );
        setSuccessMessage("Category updated successfully!");
      } else {
        setCategories((prev) => [...prev, savedCategory]);
        setSuccessMessage("Category created successfully!");
      }

      resetForm();
      setIsAddCategoryOpen(false);

      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Error saving category:", err);
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setCategoryName("");
    setEditCategoryId(null);
    setError(null);
  };

  const handleEditCategory = (category: Category) => {
    setCategoryName(category.category);
    setEditCategoryId(category._id);
    setIsAddCategoryOpen(true);
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      setError(null);
      const response = await fetch(`${categoryApi}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to delete category");
      setCategories((prev) => prev.filter((c) => c._id !== id));
      setSuccessMessage("Category deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(err instanceof Error ? err.message : "Failed to delete category");
    }
  };

  // Statistics
  const totalCategories = categories.length;

  // --- UI ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 md:ml-64">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Categories</h1>
          <p className="text-gray-600">Manage product categories efficiently</p>
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



        {/* Categories Table Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              Category List
            </h2>
            <Button
              onClick={() => {
                resetForm();
                setIsAddCategoryOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              + Add Category
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No categories found</p>
              <Button
                onClick={() => {
                  resetForm();
                  setIsAddCategoryOpen(true);
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create First Category
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
                      Category Name
                    </th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">
                      Category ID
                    </th>
                    <th className="px-6 py-3 text-center font-semibold text-gray-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category, idx) => (
                    <tr
                      key={category._id}
                      className="border-b border-gray-200 hover:bg-gray-50 transition"
                    >
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                          {idx + 1}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {category.category}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded border border-gray-300">
                          {category._id}
                        </code>
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category._id)}
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

      {/* Add/Edit Category Dialog */}
      <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editCategoryId ? "Edit Category" : "Add New Category"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddCategory} className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name *</Label>
              <Input
                id="categoryName"
                placeholder="e.g., Hoodie, T-Shirt, Jacket"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                required
                autoFocus
              />
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
                  setIsAddCategoryOpen(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!categoryName.trim() || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    {editCategoryId ? "Updating..." : "Creating..."}
                  </>
                ) : editCategoryId ? (
                  "✓ Update Category"
                ) : (
                  "✓ Create Category"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}