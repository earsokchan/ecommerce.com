"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Sidebar from "../../../components/sidebar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

interface Banner {
  _id: string;
  slot: string;
  imageUrl: string;
  __v?: number;
}

export default function BannerPage() {
  const API_BASE_URL = "https://api.targetclothe.online";
  const bannerApi = `${API_BASE_URL}/api/banners`;

  const TOKEN =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6Imhlbmdzb3Rob24iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzU1NDA1OTEsImV4cCI6MTc3ODEzMjU5MX0.EbwnPvdaXHJC2RPreoGfHD1rF39UtElcgDQkC-ryoxo";

  // Helper function to get headers with token
  const getHeaders = () => ({
    Authorization: `Bearer ${TOKEN}`,
  });

  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dialog States
  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false);
  const [editBannerId, setEditBannerId] = useState<string | null>(null);
  const [bannerSlot, setBannerSlot] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // Fetch Banners
  const fetchBanners = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(bannerApi, {
        headers: getHeaders(),
      });
      if (!response.ok) throw new Error("Failed to fetch banners");
      const data = await response.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch banners");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Handle Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create/Update Banner
  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsSubmitting(true);

      if (!bannerSlot.trim()) {
        setError("Please enter a banner slot");
        setIsSubmitting(false);
        return;
      }

      if (!bannerImage && !editBannerId) {
        setError("Please select a banner image");
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("slot", bannerSlot.trim());
      if (bannerImage) {
        formData.append("image", bannerImage);
      }

      const method = editBannerId ? "PUT" : "POST";
      const endpoint = editBannerId ? `${bannerApi}/${editBannerId}` : bannerApi;

      const response = await fetch(endpoint, {
        method,
        body: formData,
        headers: getHeaders(),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Failed to save banner";

        try {
          if (contentType?.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorData.error || errorMessage;
          } else {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } catch (parseErr) {
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
        }

        throw new Error(errorMessage);
      }

      const result = await response.json();

      if (editBannerId) {
        setBanners((prev) =>
          prev.map((b) => (b._id === result._id ? result : b))
        );
        setSuccessMessage("Banner updated successfully!");
      } else {
        setBanners((prev) => [...prev, result]);
        setSuccessMessage("Banner created successfully!");
      }

      resetForm();
      setIsAddBannerOpen(false);

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Error saving banner:", err);
      setError(err instanceof Error ? err.message : "Failed to save banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setBannerSlot("");
    setBannerImage(null);
    setImagePreview("");
    setEditBannerId(null);
    setError(null);
  };

  const handleEditBanner = (banner: Banner) => {
    setBannerSlot(banner.slot);
    setImagePreview(banner.imageUrl);
    setEditBannerId(banner._id);
    setIsAddBannerOpen(true);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      setError(null);
      const response = await fetch(`${bannerApi}/${id}`, {
        method: "DELETE",
        headers: getHeaders(),
      });

      if (!response.ok) {
        const contentType = response.headers.get("content-type");
        let errorMessage = "Failed to delete banner";

        try {
          if (contentType?.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          }
        } catch (parseErr) {
          errorMessage = `Server error: ${response.status}`;
        }

        throw new Error(errorMessage);
      }

      setBanners((prev) => prev.filter((b) => b._id !== id));
      setSuccessMessage("Banner deleted successfully!");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Error deleting banner:", err);
      setError(err instanceof Error ? err.message : "Failed to delete banner");
    }
  };

  // --- UI ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 md:ml-64">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Banners</h1>
          <p className="text-gray-600">Manage website banners efficiently</p>
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

        {/* Banners Grid Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              Banner List
            </h2>
            <Button
              onClick={() => {
                resetForm();
                setIsAddBannerOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              + Add Banner
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading banners...</p>
            </div>
          ) : banners.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No banners found</p>
              <Button
                onClick={() => {
                  resetForm();
                  setIsAddBannerOpen(true);
                }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Create First Banner
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {banners.map((banner) => (
                <div
                  key={banner._id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition"
                >
                  <div className="relative w-full h-48 bg-gray-100">
                    <Image
                      src={banner.imageUrl}
                      alt={banner.slot}
                      fill
                      unoptimized
                      className="object-cover"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = "https://via.placeholder.com/300x200?text=Image+Not+Found";
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {banner.slot}
                    </h3>
                    <code className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded border border-gray-300 block mb-4 truncate">
                      {banner._id}
                    </code>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditBanner(banner)}
                        className="flex-1 px-3 py-2 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                        title="Edit"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBanner(banner._id)}
                        className="flex-1 px-3 py-2 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition"
                        title="Delete"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Banner Dialog */}
      <Dialog open={isAddBannerOpen} onOpenChange={setIsAddBannerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editBannerId ? "Edit Banner" : "Add New Banner"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddBanner} className="space-y-4">
            <div>
              <Label htmlFor="bannerSlot">Banner Slot *</Label>
              <Input
                id="bannerSlot"
                placeholder="e.g., 1, 2, 3, 4, 5, 6"
                value={bannerSlot}
                onChange={(e) => setBannerSlot(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div>
              <Label htmlFor="bannerImage">Banner Image {!editBannerId && "*"}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                {imagePreview ? (
                  <div className="relative w-full h-40 mb-4">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      unoptimized
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 mb-4">No image selected</p>
                )}
                <Input
                  id="bannerImage"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 1920x600px or wider
                </p>
              </div>
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
                  setIsAddBannerOpen(false);
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={!bannerSlot.trim() || (!bannerImage && !editBannerId) || isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    {editBannerId ? "Updating..." : "Creating..."}
                  </>
                ) : editBannerId ? (
                  "✓ Update Banner"
                ) : (
                  "✓ Create Banner"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}