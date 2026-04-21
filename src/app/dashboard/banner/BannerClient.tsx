"use client";

import React, { useEffect, useState } from "react";
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
import {
  createBanner,
  deleteBanner,
  updateBanner,
  type Banner,
} from "./actions";

interface BannerClientProps {
  initialBanners: Banner[];
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(String(reader.result ?? ""));
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image file"));
    };

    reader.readAsDataURL(file);
  });
}

export default function BannerClient({ initialBanners }: BannerClientProps) {
  const [banners, setBanners] = useState<Banner[]>(initialBanners);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isAddBannerOpen, setIsAddBannerOpen] = useState(false);
  const [editBannerId, setEditBannerId] = useState<string | null>(null);
  const [bannerSlot, setBannerSlot] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(() => setSuccessMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [successMessage]);

  const resetForm = () => {
    setBannerSlot("");
    setBannerImage(null);
    setImagePreview("");
    setEditBannerId(null);
    setError(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setBannerImage(file);
    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setError(null);
      setIsSubmitting(true);

      if (!bannerSlot.trim()) {
        setError("Please enter a banner slot");
        return;
      }

      const imageUrl = bannerImage ? await readFileAsDataUrl(bannerImage) : imagePreview;

      if (!imageUrl && !editBannerId) {
        setError("Please select a banner image");
        return;
      }

      const savedBanner = editBannerId
        ? await updateBanner(editBannerId, {
            slot: bannerSlot.trim(),
            imageUrl: imageUrl || imagePreview,
          })
        : await createBanner({
            slot: bannerSlot.trim(),
            imageUrl,
          });

      if (editBannerId) {
        setBanners((prev) => prev.map((banner) => (banner._id === savedBanner._id ? savedBanner : banner)));
        setSuccessMessage("Banner updated successfully!");
      } else {
        setBanners((prev) => [...prev, savedBanner]);
        setSuccessMessage("Banner created successfully!");
      }

      resetForm();
      setIsAddBannerOpen(false);
    } catch (err) {
      console.error("Error saving banner:", err);
      setError(err instanceof Error ? err.message : "Failed to save banner");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBanner = (banner: Banner) => {
    setBannerSlot(banner.slot);
    setImagePreview(banner.imageUrl);
    setEditBannerId(banner._id);
    setIsAddBannerOpen(true);
  };

  const handleDeleteBanner = async (id: string) => {
    if (!confirm("Are you sure you want to delete this banner?")) {
      return;
    }

    try {
      setError(null);
      await deleteBanner(id);
      setBanners((prev) => prev.filter((banner) => banner._id !== id));
      setSuccessMessage("Banner deleted successfully!");
    } catch (err) {
      console.error("Error deleting banner:", err);
      setError(err instanceof Error ? err.message : "Failed to delete banner");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 md:ml-64">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Banners</h1>
          <p className="text-gray-600">Manage website banners efficiently</p>
        </div>

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

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">Banner List</h2>
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

          {banners.length === 0 ? (
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
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{banner.slot}</h3>
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

      <Dialog open={isAddBannerOpen} onOpenChange={setIsAddBannerOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editBannerId ? "Edit Banner" : "Add New Banner"}</DialogTitle>
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
