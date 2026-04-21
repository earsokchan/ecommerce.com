"use client";

import React, { useState, FormEvent } from "react";
import Sidebar from "../../../components/sidebar";
import { useLang } from "../../providers/lang_provider";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

interface ProductPageProps {
  initialProducts: Product[];
  initialCategories: Array<{ _id: string; category: string }>;
  initialBrands: Array<{ _id: string; item_brand: string }>;
}

const MAX_PRODUCT_IMAGES = 4;

interface ProductSize {
  size: string;
  quantity: number;
}

interface ProductColorVariant {
  color: string;
  imagecolor: string; // URL from API
  productimages: string[]; // URLs from API
  sizes: ProductSize[];
}

export interface Product {
  _id?: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number | null;
  category: string;
  brand: string;
  productItems: ProductColorVariant[];
  status?: string;
  createdAt?: string;
}

// File data for each color variant
interface ColorFileData {
  colorFile: File | null;
  productFiles: File[];
}

export default function ProductPage({
  initialProducts,
  initialCategories,
  initialBrands,
}: ProductPageProps) {
  const { t } = useLang();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading] = useState(false);
  const [categories] = useState<Array<{ _id: string; category: string }>>(initialCategories);
  const [brands] = useState<Array<{ _id: string; item_brand: string }>>(initialBrands);
  const categoriesLoading = false;
  const brandsLoading = false;
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Product Dialog States
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editProductId, setEditProductId] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState({
    name: "",
    description: "",
    price: "",
    discountPrice: "",
    category: "",
    brand: "",
    productItems: [] as ProductColorVariant[],
    status: "active", // Add status field
  });

  // File storage map: index -> {colorFile, productFiles}
  const [colorFileDataMap, setColorFileDataMap] = useState<Map<number, ColorFileData>>(new Map());

  // Temporary color variant input states
  const [tempColor, setTempColor] = useState("");
  const [tempColorImageFile, setTempColorImageFile] = useState<File | null>(null);
  const [tempColorImagePreview, setTempColorImagePreview] = useState<string>("");
  const [tempProductImageFiles, setTempProductImageFiles] = useState<File[]>([]);
  const [tempProductImagePreviews, setTempProductImagePreviews] = useState<string[]>([]);
  const [tempExistingImageUrls, setTempExistingImageUrls] = useState<string[]>([]);
  const [tempSize, setTempSize] = useState("");
  const [tempSizeQty, setTempSizeQty] = useState("");
  const [tempColorSizes, setTempColorSizes] = useState<ProductSize[]>([]);
  const [editingColorIdx, setEditingColorIdx] = useState<number | null>(null);
  const [editingSizeIdx, setEditingSizeIdx] = useState<number | null>(null);

  // Product Details Dialog State
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);

  // BULK SELECTION STATES
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [showBulkDiscountDialog, setShowBulkDiscountDialog] = useState(false);
  const [bulkDiscountValue, setBulkDiscountValue] = useState("");
  const [bulkDiscountPercentage, setBulkDiscountPercentage] = useState("");

  // Create/Update Product
  const handleAddProduct = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      setIsSubmitting(true);
      
      if (productInfo.productItems.length === 0) {
        setError(t("Please add at least one color variant"));
        setIsSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.append("name", productInfo.name);
      formData.append("description", productInfo.description);
      formData.append("price", productInfo.price);
      formData.append("discountPrice", productInfo.discountPrice || "");
      formData.append("category", productInfo.category);
      formData.append("brand", productInfo.brand);
      formData.append("status", productInfo.status);

      // Build product items structure with ONLY API URLs (no blob/data URLs)
      const productItemsForAPI = productInfo.productItems.map((item, itemIdx) => {
        const fileData = colorFileDataMap.get(itemIdx);
        const newImageCount = (fileData?.productFiles?.length || 0);
        
        return {
          color: item.color,
          imagecolor: typeof item.imagecolor === "string" && !item.imagecolor.startsWith("blob:") && !item.imagecolor.startsWith("data:")
            ? item.imagecolor 
            : "",
          productimages: (item.productimages || []).filter(
            (img) => typeof img === "string" && !img.startsWith("blob:") && !img.startsWith("data:")
          ),
          sizes: item.sizes,
          imageCount: newImageCount,
        };
      });

      formData.append("productItems", JSON.stringify(productItemsForAPI));

      // Append only NEW files in correct order
      productInfo.productItems.forEach((item, itemIdx) => {
        const fileData = colorFileDataMap.get(itemIdx);

        // Only append color image file if it's new
        if (fileData?.colorFile) {
          formData.append("images", fileData.colorFile);
        }

        // Only append new product image files
        if (fileData?.productFiles && fileData.productFiles.length > 0) {
          fileData.productFiles.forEach((file) => {
            formData.append("images", file);
          });
        }
      });

      const parsedPrice = Number(productInfo.price);
      const parsedDiscountPrice =
        productInfo.discountPrice.trim() === ""
          ? null
          : Number(productInfo.discountPrice);

      // TODO: Replace with database query (CREATE or UPDATE)
      // Use server action or API route to save product with FormData
      const baseProduct: Product = {
        ...productInfo,
        price: Number.isFinite(parsedPrice) ? parsedPrice : 0,
        discountPrice: Number.isFinite(parsedDiscountPrice)
          ? parsedDiscountPrice
          : null,
      };

      const savedProduct: Product = editProductId
        ? { ...baseProduct, _id: editProductId }
        : { ...baseProduct, _id: Date.now().toString() };
      
      if (editProductId) {
        setProducts((prev) =>
          prev.map((p) => (p._id === editProductId ? savedProduct : p))
        );
        setSuccessMessage(t("Product updated successfully!"));
      } else {
        setProducts((prev) => [...prev, savedProduct]);
        setSuccessMessage(t("Product created successfully!"));
      }
      
      resetProductForm();
      setIsAddProductOpen(false);
      
      // Clear success message after 4 seconds
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetProductForm = () => {
    setProductInfo({
      name: "",
      description: "",
      price: "",
      discountPrice: "",
      category: "",
      brand: "",
      productItems: [],
      status: "active", // Reset status to active
    });
    setColorFileDataMap(new Map());
    setEditProductId(null);
    setTempColor("");
    setTempColorImageFile(null);
    setTempColorImagePreview("");
    setTempProductImageFiles([]);
    setTempProductImagePreviews([]);
    setTempExistingImageUrls([]);
    setTempSize("");
    setTempSizeQty("");
    setTempColorSizes([]);
    setEditingColorIdx(null);
    setEditingSizeIdx(null);
    setError(null);
  };

  const handleEditProduct = (product: Product) => {
    setProductInfo({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discountPrice: product.discountPrice?.toString() || "",
      category: product.category,
      brand: product.brand,
      productItems: product.productItems,
      status: product.status || "active", // Load status from product
    });
    setEditProductId(product._id || null);
    setColorFileDataMap(new Map());
    setIsAddProductOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm(t("Are you sure you want to delete this product?"))) return;
    try {
      setError(null);
      // TODO: Replace with database query (DELETE)
      // Use server action or API route to delete product
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      setError(err instanceof Error ? err.message : "Failed to delete product");
    }
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowDetailsDialog(true);
  };

  // BULK SELECTION HANDLERS
  const toggleProductSelection = (productId: string) => {
    setSelectedProductIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (selectedProductIds.size === filteredProducts.length) {
      setSelectedProductIds(new Set());
    } else {
      setSelectedProductIds(
        new Set(filteredProducts.map((p) => p._id).filter(Boolean) as string[])
      );
    }
  };

  const handleBulkUpdateDiscount = async () => {
    if (selectedProductIds.size === 0) {
      setError(t("Please select at least one product"));
      return;
    }

    if (!bulkDiscountPercentage || isNaN(parseFloat(bulkDiscountPercentage))) {
      setError(t("Please enter a valid discount percentage"));
      return;
    }

    const discountPercent = parseFloat(bulkDiscountPercentage);
    if (discountPercent < 0 || discountPercent > 100) {
      setError(t("Discount percentage must be between 0 and 100"));
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);

      const updates = Array.from(selectedProductIds).map((id) => {
        const product = products.find((p) => p._id === id);
        if (!product) return null;

        // Calculate discount price: price - (price * percentage / 100)
        const discountPrice = product.price * (1 - discountPercent / 100);

        return {
          id,
          discountPrice: Math.round(discountPrice * 100) / 100, // Round to 2 decimals
        };
      }).filter(Boolean);

      for (const update of updates) {
        if (!update) continue;
        
        // TODO: Replace with database query (UPDATE discount price)
        // Use server action or API route to update product discount
        const updatedProduct = products.find(p => p._id === update.id);
        if (updatedProduct) {
          updatedProduct.discountPrice = update.discountPrice;
          setProducts((prev) =>
            prev.map((p) => (p._id === update.id ? { ...updatedProduct } : p))
          );
        }
      }

      setSuccessMessage(t(`Applied ${bulkDiscountPercentage}% discount to ${selectedProductIds.size} product(s)`));
      setSelectedProductIds(new Set());
      setShowBulkDiscountDialog(false);
      setBulkDiscountPercentage("");
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Error updating discount:", err);
      setError(err instanceof Error ? err.message : "Failed to update discount");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkSwapPrices = async () => {
    if (selectedProductIds.size === 0) {
      setError(t("Please select at least one product"));
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);

      for (const productId of selectedProductIds) {
        const product = products.find((p) => p._id === productId);
        if (!product) continue;

        // TODO: Replace with database query (UPDATE - remove discount)
        // Use server action or API route to remove discount price
        const updatedProduct = { ...product, discountPrice: null };
        setProducts((prev) =>
          prev.map((p) => (p._id === productId ? updatedProduct : p))
        );
      }

      setSuccessMessage(t(`Removed discount for ${selectedProductIds.size} product(s)`));
      setSelectedProductIds(new Set());
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error("Error removing discount:", err);
      setError(err instanceof Error ? err.message : "Failed to remove discount");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Color Image File Management
  const handleColorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setTempColorImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempColorImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProductImage = (index: number) => {
    // If index is in existing URLs, remove from there
    if (index < tempExistingImageUrls.length) {
      setTempExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
    } else {
      // Otherwise remove from new files
      const newFileIdx = index - tempExistingImageUrls.length;
      setTempProductImageFiles((prev) => prev.filter((_, i) => i !== newFileIdx));
      setTempProductImagePreviews((prev) => prev.filter((_, i) => i !== newFileIdx));
    }
  };

  const handleProductImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentTotal = tempExistingImageUrls.length + tempProductImageFiles.length;
    const remainingSlots = MAX_PRODUCT_IMAGES - currentTotal;
    
    if (remainingSlots <= 0) {
      setError(t("Maximum 4 images allowed per color"));
      return;
    }
    
    const filesToAdd = files.slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      setError(t(`Only ${remainingSlots} more image(s) can be added. Maximum is 4 per color.`));
    }
    
    setTempProductImageFiles((prev) => [...prev, ...filesToAdd]);
    
    filesToAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTempProductImagePreviews((prev) => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const addColorSize = () => {
    if (tempSize.trim() && tempSizeQty.trim()) {
      if (editingSizeIdx !== null) {
        // Update existing size
        setTempColorSizes((prev) => {
          const updated = [...prev];
          updated[editingSizeIdx] = { size: tempSize, quantity: Number(tempSizeQty) };
          return updated;
        });
        setEditingSizeIdx(null);
      } else {
        // Add new size
        setTempColorSizes((prev) => [
          ...prev,
          { size: tempSize, quantity: Number(tempSizeQty) },
        ]);
      }
      setTempSize("");
      setTempSizeQty("");
    }
  };

  const startEditSize = (index: number) => {
    const size = tempColorSizes[index];
    setTempSize(size.size);
    setTempSizeQty(size.quantity.toString());
    setEditingSizeIdx(index);
  };

  const cancelEditSize = () => {
    setTempSize("");
    setTempSizeQty("");
    setEditingSizeIdx(null);
  };

  const removeColorSize = (index: number) => {
    setTempColorSizes((prev) => prev.filter((_, i) => i !== index));
  };

  // Color Management
  const addColor = () => {
    if (tempColor.trim() && tempColorImageFile && tempColorSizes.length > 0) {
      const previewColorUrl = URL.createObjectURL(tempColorImageFile);
      const previewProductUrls = tempProductImageFiles.map((file) =>
        URL.createObjectURL(file)
      );

      // Add to product items with preview URLs
      const newIndex = productInfo.productItems.length;
      setProductInfo((prev) => ({
        ...prev,
        productItems: [
          ...prev.productItems,
          {
            color: tempColor,
            imagecolor: previewColorUrl,
            productimages: previewProductUrls,
            sizes: tempColorSizes,
          },
        ],
      }));

      // Store actual files in map
      setColorFileDataMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(newIndex, {
          colorFile: tempColorImageFile,
          productFiles: tempProductImageFiles,
        });
        return newMap;
      });

      // Reset temps
      setTempColor("");
      setTempColorImageFile(null);
      setTempColorImagePreview("");
      setTempProductImageFiles([]);
      setTempProductImagePreviews([]);
      setTempColorSizes([]);
      setEditingColorIdx(null);
    } else {
      setError(t("Please select color image, add at least one size, and optionally add product images"));
    }
  };

  const removeColor = (index: number) => {
    setProductInfo((prev) => ({
      ...prev,
      productItems: prev.productItems.filter((_, i) => i !== index),
    }));
    
    // Rebuild file map with correct indices
    setColorFileDataMap((prev) => {
      const newMap = new Map<number, ColorFileData>();
      let newIdx = 0;
      prev.forEach((value, key) => {
        if (key !== index) {
          newMap.set(newIdx, value);
          newIdx++;
        }
      });
      return newMap;
    });
    
    setEditingColorIdx(null);
  };

  const startEditColor = (index: number) => {
    const color = productInfo.productItems[index];
    setTempColor(color.color);
    setTempColorImagePreview(color.imagecolor);
    setTempExistingImageUrls(color.productimages || []);
    setTempProductImagePreviews([]);
    setTempProductImageFiles([]);
    setTempColorImageFile(null);
    setTempColorSizes(color.sizes || []);
    setEditingColorIdx(index);
  };

  const updateColor = () => {
    if (editingColorIdx !== null && tempColor.trim() && (tempColorImageFile || tempColorImagePreview)) {
      const colorImageUrl = tempColorImageFile
        ? URL.createObjectURL(tempColorImageFile)
        : tempColorImagePreview;
      
      // Combine existing URLs with new preview URLs
      const allProductImages = [
        ...tempExistingImageUrls,
        ...tempProductImagePreviews,
      ];

      setProductInfo((prev) => {
        const newItems = [...prev.productItems];
        newItems[editingColorIdx] = {
          color: tempColor,
          imagecolor: colorImageUrl,
          productimages: allProductImages,
          sizes: tempColorSizes,
        };
        return { ...prev, productItems: newItems };
      });

      // Update file map - store NEW color file and NEW product files
      setColorFileDataMap((prev) => {
        const newMap = new Map(prev);
        newMap.set(editingColorIdx, {
          colorFile: tempColorImageFile,
          productFiles: tempProductImageFiles,
        });
        return newMap;
      });

      // Reset temps
      setTempColor("");
      setTempColorImageFile(null);
      setTempColorImagePreview("");
      setTempProductImageFiles([]);
      setTempProductImagePreviews([]);
      setTempExistingImageUrls([]);
      setTempColorSizes([]);
      setEditingColorIdx(null);
    }
  };

  // Filter products by category
  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category.toLowerCase() === selectedCategory.toLowerCase())
    : products;

  // Get unique categories from products
  const productCategories = Array.from(
    new Set(products.map((p) => p.category))
  ).filter(Boolean);

  // Statistics
  const totalProducts = filteredProducts.length;
  const totalValue = filteredProducts.reduce((sum, p) => sum + Number(p.price), 0);
  const discountedProducts = filteredProducts.filter((p) => p.discountPrice).length;

  function handleToggleStatus(arg0: string, status: string | undefined): void {
    throw new Error("Function not implemented.");
  }

  function removeExistingImage(idx: number): void {
    setTempExistingImageUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  function removeNewImage(idx: number): void {
    setTempProductImagePreviews((prev) => prev.filter((_, i) => i !== idx));
    setTempProductImageFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  // --- UI ---
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-8 md:ml-64">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{t("Products")}</h1>
          <p className="text-gray-600">{t("Manage your products efficiently")}</p>
        </div>

        {/* Success Popup Toast */}
        {successMessage && (
          <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top-4 duration-300">
            <div className="bg-green-500 text-white rounded-lg shadow-2xl p-4 flex items-center gap-3 max-w-sm">
              <span className="text-2xl">✓</span>
              <div className="flex-1">
                <p className="font-semibold">{t("Success!")}</p>
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
              {t("Dismiss")}
            </button>
          </div>
        )}

        {/* Category Section */}
        <div className="bg-white rounded-lg shadow mb-8 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">{t("Categories")}</h2>
            <Button
              onClick={() => {
                resetProductForm();
                setIsAddProductOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {t("+ Add Product")}
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {productCategories.map((cat) => (
              <div
                key={cat}
                className={`border-2 border-gray-200 rounded-lg p-4 shadow-sm bg-white hover:shadow-lg transition cursor-pointer ${
                  selectedCategory === cat
                    ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50"
                    : ""
                }`}
                onClick={() => handleSelectCategory(cat)}
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3">{cat}</h3>
                <p className="text-sm text-gray-600">
                  {products.filter((p) => p.category.toLowerCase() === cat.toLowerCase()).length} {t("Products")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Product Statistics */}
        {(selectedCategory || filteredProducts.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <p className="text-gray-600 text-sm mb-2">{t("Total Products")}</p>
              <p className="text-3xl font-bold text-gray-800">{totalProducts}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg shadow p-6">
              <p className="text-blue-700 text-sm mb-2">{t("Total Value")}</p>
              <p className="text-3xl font-bold text-blue-600">${totalValue.toFixed(2)}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg shadow p-6">
              <p className="text-purple-700 text-sm mb-2">{t("On Discount")}</p>
              <p className="text-3xl font-bold text-purple-600">{discountedProducts}</p>
            </div>
          </div>
        )}

        {/* Product Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-800">
              {t("Product List")}
              {selectedCategory && ` - ${selectedCategory}`}
              {selectedProductIds.size > 0 && (
                <span className="ml-4 text-lg text-blue-600 font-medium">
                  ({selectedProductIds.size} {t("selected")})
                </span>
              )}
            </h2>

            {/* BULK ACTION BUTTONS */}
            {selectedProductIds.size > 0 && (
              <div className="flex gap-2">
                <Button
                  onClick={() => setShowBulkDiscountDialog(true)}
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                >
                  💰 {t("Set Discount")}
                </Button>
                <Button
                  onClick={handleBulkSwapPrices}
                  disabled={isSubmitting}
                  className="bg-orange-600 hover:bg-orange-700 text-white disabled:bg-gray-400"
                  title={t("Remove discount price from selected products")}
                >
                  {isSubmitting ? "⏳" : "🔄"} {t("Remove Discount")}
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">{t("Loading products...")}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">{t("No products found")}</p>
            </div>
          ) : (
            <div className="rounded-lg border bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    {/* SELECT ALL CHECKBOX */}
                    <TableHead className="w-10 text-center">
                      <input
                        type="checkbox"
                        checked={
                          filteredProducts.length > 0 &&
                          selectedProductIds.size === filteredProducts.length
                        }
                        onChange={toggleSelectAll}
                        className="w-4 h-4 cursor-pointer"
                        title={t("Select all")}
                      />
                    </TableHead>

                    <TableHead>{t("Image")}</TableHead>
                    <TableHead>{t("Product Name")}</TableHead>
                    <TableHead>{t("Brand")}</TableHead>
                    <TableHead>{t("Category")}</TableHead>
                    <TableHead className="text-right">{t("Price")}</TableHead>
                    <TableHead className="text-right">{t("Discount")}</TableHead>
                    <TableHead className="text-center">{t("Colors")}</TableHead>
                    <TableHead className="text-center">{t("Sizes")}</TableHead>
                    <TableHead className="text-center">{t("Status")}</TableHead>
                    <TableHead className="text-center">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow
                      key={product._id}
                      className={`${
                        selectedProductIds.has(product._id || "")
                          ? "bg-blue-100"
                          : ""
                      }`}
                    >
                      {/* CHECKBOX */}
                      <TableCell className="text-center">
                        <input
                          type="checkbox"
                          checked={selectedProductIds.has(product._id || "")}
                          onChange={() =>
                            toggleProductSelection(product._id || "")
                          }
                          className="w-4 h-4 cursor-pointer"
                        />
                      </TableCell>

                      {/* Image */}
                      <TableCell>
                        {product.productItems?.[0]?.productimages?.[0] && (
                          <img
                            src={product.productItems[0].productimages[0]}
                            alt={product.name}
                            className="w-12 h-12 rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "https://via.placeholder.com/50";
                            }}
                          />
                        )}
                      </TableCell>

                      {/* Product Name */}
                      <TableCell>
                        <p className="font-medium text-gray-800 max-w-xs truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">{product.description.slice(0, 40)}...</p>
                      </TableCell>

                      {/* Brand */}
                      <TableCell>{product.brand}</TableCell>

                      {/* Category */}
                      <TableCell>
                        <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          {product.category}
                        </span>
                      </TableCell>

                      {/* Price */}
                      <TableCell className="text-right">
                        <p className="font-bold text-gray-900">${product.price}</p>
                      </TableCell>

                      {/* Discount Price */}
                      <TableCell className="text-right">
                        {product.discountPrice ? (
                          <span className="text-green-600 font-medium">${product.discountPrice}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>

                      {/* Colors Count */}
                      <TableCell className="text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-800 rounded-full text-sm font-semibold">
                          {product.productItems?.length || 0}
                        </span>
                      </TableCell>

                      {/* Sizes Display - Grouped by Color */}
                      <TableCell className="text-center">
                        {product.productItems && product.productItems.length > 0 ? (
                          <div className="space-y-2">
                            {product.productItems.map((colorItem, colorIdx) => (
                              <div key={colorIdx} className="text-xs">
                                <p className="font-semibold text-gray-700 mb-1">
                                  {colorItem.color}
                                </p>
                                <div className="flex flex-wrap gap-1 justify-center">
                                  {colorItem.sizes && colorItem.sizes.length > 0 ? (
                                    colorItem.sizes.map((size, sizeIdx) => (
                                      <span
                                        key={sizeIdx}
                                        className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-gray-200 text-gray-800 rounded text-xs font-semibold hover:bg-gray-300 transition"
                                        title={`${size.size}: ${size.quantity} units`}
                                      >
                                        {size.size}
                                        <span className="font-bold text-gray-700">
                                          {size.quantity}
                                        </span>
                                      </span>
                                    ))
                                  ) : (
                                    <span className="text-gray-400 text-xs">-</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell className="text-center">
                        <span
                          className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-semibold cursor-pointer transition ${
                            product.status === "active"
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                          onClick={() => handleToggleStatus(product._id || "", product.status)}
                          title={t("Click to toggle status")}
                        >
                          {product.status === "active" ? t("Active") : t("Disabled")}
                        </span>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleViewDetails(product)}
                            className="px-2 py-1 text-xs bg-green-500 hover:bg-green-600 text-white rounded transition"
                            title={t("View")}
                          >
                            👁️
                          </button>
                          <button
                            onClick={() => handleEditProduct(product)}
                            className="px-2 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded transition"
                            title={t("Edit")}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => product._id && handleDeleteProduct(product._id)}
                            className="px-2 py-1 text-xs bg-red-500 hover:bg-red-600 text-white rounded transition"
                            title={t("Delete")}
                          >
                            🗑️
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      {/* --- Add/Edit Product Dialog --- */}
<Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
  <DialogContent className="max-w-3xl max-h-[95vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>
        {editProductId ? t("Edit Product") : t("Add New Product")}
      </DialogTitle>
    </DialogHeader>

    <form onSubmit={handleAddProduct} className="space-y-4">

      {/* BASIC INFORMATION */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-3">
          {t("Basic Information")}
        </h3>

        <div className="space-y-3">
          {/* PRODUCT NAME */}
          <div>
            <Label htmlFor="name">{t("Product Name")} *</Label>
            <Input
              id="name"
              placeholder={t("Enter product name")}
              value={productInfo.name}
              onChange={(e) =>
                setProductInfo((prev) => ({ ...prev, name: e.target.value }))
              }
              required
            />
          </div>

          {/* DESCRIPTION */}
          <div>
            <Label htmlFor="description">{t("Description")}</Label>
            <textarea
              id="description"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t("Enter product description")}
              value={productInfo.description}
              onChange={(e) =>
                setProductInfo((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
            />
          </div>

          {/* PRICE + DISCOUNT */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="price">{t("Price ($)")} *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                placeholder={t("Enter price")}
                value={productInfo.price}
                onChange={(e) =>
                  setProductInfo((prev) => ({ ...prev, price: e.target.value }))
                }
                required
              />
            </div>

            <div>
              <Label htmlFor="discountPrice">{t("Discount Price ($)")}</Label>
              <Input
                id="discountPrice"
                type="number"
                step="0.01"
                placeholder={t("Optional")}
                value={productInfo.discountPrice}
                onChange={(e) =>
                  setProductInfo((prev) => ({
                    ...prev,
                    discountPrice: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          {/* CATEGORY + BRAND */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">{t("Category")} *</Label>
              <select
                id="category"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={productInfo.category}
                onChange={(e) =>
                  setProductInfo((prev) => ({
                    ...prev,
                    category: e.target.value,
                  }))
                }
                required
              >
                <option value="">{categoriesLoading ? t("Loading...") : t("Select a category")}</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.category}>
                    {cat.category}
                  </option>
                ))}
                {/* Show current value if not in list */}
                {productInfo.category && !categories.some(c => c.category === productInfo.category) && (
                  <option value={productInfo.category}>{productInfo.category}</option>
                )}
              </select>
            </div>

            <div>
              <Label htmlFor="brand">{t("Brand")} *</Label>
              <select
                id="brand"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={productInfo.brand}
                onChange={(e) =>
                  setProductInfo((prev) => ({
                    ...prev,
                    brand: e.target.value,
                  }))
                }
                required
              >
                <option value="">{brandsLoading ? t("Loading...") : t("Select a brand")}</option>
                {brands.map((brand) => (
                  <option key={brand._id} value={brand.item_brand}>
                    {brand.item_brand}
                  </option>
                ))}
                {/* Show current value if not in list */}
                {productInfo.brand && !brands.some(b => b.item_brand === productInfo.brand) && (
                  <option value={productInfo.brand}>{productInfo.brand}</option>
                )}
              </select>
            </div>
          </div>

          {/* STATUS — SHOW ONLY WHEN EDITING */}
          {editProductId && (
            <div>
              <Label htmlFor="status">{t("Status")} *</Label>
              <select
                id="status"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={productInfo.status}
                onChange={(e) =>
                  setProductInfo((prev) => ({
                    ...prev,
                    status: e.target.value,
                  }))
                }
              >
                <option value="active">{t("Active")}</option>
                <option value="disable">{t("Disabled")}</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* COLORS & VARIANTS */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="font-semibold text-purple-900 mb-3">
          {t("Product Colors & Variants")}
        </h3>

        {/* COLOR INPUT FORM */}
        <div className="bg-white border border-purple-200 rounded-lg p-4 mb-4 space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-gray-800">
              {editingColorIdx !== null ? t("Edit Color") : t("Add New Color")}
            </h4>

            {editingColorIdx !== null && (
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {t("Editing")}
              </span>
            )}
          </div>

{/* COLOR NAME + COLOR IMAGE */}
<div className="grid grid-cols-2 gap-3">
  {/* Color Name */}
  <div>
    <Label className="text-sm">{t("Color Name")} *</Label>
    <Input
      placeholder={t("e.g., Red, Blue, Black")}
      value={tempColor}
      onChange={(e) => setTempColor(e.target.value)}
    />
  </div>

  {/* Color Image */}
  <div>
    <Label className="text-sm">{t("Color Image")} *</Label>

    {/* Hidden input */}
    <input
      id="color-image-upload"
      type="file"
      accept="image/*"
      onChange={handleColorImageChange}
      className="hidden"
    />

    {/* Preview & Selector */}
    <div className="grid grid-cols-1 gap-2 mt-1">
      {tempColorImagePreview ? (
        <div className="relative h-24 border rounded-lg bg-gray-100 overflow-hidden">
          <img
            src={tempColorImagePreview}
            className="w-full h-full object-cover"
          />
          {/* Delete Button */}
          <button
            type="button"
            onClick={() => setTempColorImagePreview("")}
            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      ) : (
        <label
          htmlFor="color-image-upload"
          className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50"
        >
          <span className="text-gray-400 text-xl">＋</span>
        </label>
      )}
    </div>
  </div>
</div>


          {/* Preview */}
          {tempColorImagePreview && (
            <div className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg">
              <img
                src={tempColorImagePreview}
                alt={tempColor}
                className="w-12 h-12 rounded border border-gray-300 object-cover"
              />
              <div className="text-sm">
                <p className="font-medium text-gray-800">
                  {tempColor || t("Color name")}
                </p>
                <p className="text-xs text-gray-500">{t("Preview")}</p>
              </div>
            </div>
          )}

{/* PRODUCT IMAGES */}
<div className="border-t pt-3">
  <Label className="text-sm font-medium mb-2 block">
    {t("Product Images for this Color")}
    <span className="text-gray-500 ml-2">
      ({tempExistingImageUrls.length + tempProductImagePreviews.length}/{MAX_PRODUCT_IMAGES})
    </span>
  </Label>

  {/* Hidden real input */}
  <input
    id="color-images-upload"
    type="file"
    accept="image/*"
    multiple
    onChange={handleProductImagesChange}
    className="hidden"
  />

  {/* === 4 COLUMN SLOT SELECTOR === */}
  <div className="grid grid-cols-4 gap-3">
    {/* EXISTING IMAGES */}
    {tempExistingImageUrls.map((url, idx) => (
      <div
        key={`ex-${idx}`}
        className="relative h-24 border rounded-lg bg-gray-100 overflow-hidden"
      >
        <img src={url} className="w-full h-full object-cover" />

        {/* Delete Button */}
        <button
          type="button"
          onClick={() => removeExistingImage(idx)}
          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    ))}

    {/* NEW PREVIEWS */}
    {tempProductImageFiles.map((file, idx) => (
      <div
        key={`new-${idx}`}
        className="relative h-24 border rounded-lg bg-gray-100 overflow-hidden"
      >
        <img src={tempProductImagePreviews[idx]} className="w-full h-full object-cover" />

        <button
          type="button"
          onClick={() => removeNewImage(idx)}
          className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
        >
          ✕
        </button>
      </div>
    ))}

    {/* EMPTY SLOTS */}
    {Array.from({
      length:
        MAX_PRODUCT_IMAGES -
        (tempExistingImageUrls.length + tempProductImageFiles.length),
    }).map((_, i) => (
      <label
        key={`empty-${i}`}
        htmlFor="color-images-upload"
        className="h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-50"
      >
        <span className="text-gray-400 text-xl">＋</span>
      </label>
    ))}
  </div>
</div>


          {/* SIZES */}
          <div className="border-t pt-3">
            <Label className="text-sm font-medium mb-2 block">
              {t("Available Sizes & Stock")}
            </Label>

            <div className="flex gap-2 mb-2">
              <Input
                placeholder={t("Size (S, M, L, XL, etc)")}
                value={tempSize}
                onChange={(e) => setTempSize(e.target.value)}
                className="flex-1"
              />

              <Input
                placeholder={t("Quantity")}
                type="number"
                value={tempSizeQty}
                onChange={(e) => setTempSizeQty(e.target.value)}
                className="w-24"
              />

              <Button
                type="button"
                onClick={addColorSize}
                variant="outline"
                size="sm"
                className="whitespace-nowrap"
              >
                {editingSizeIdx !== null ? t("✓ Update Size") : t("+ Add Size")}
              </Button>

              {editingSizeIdx !== null && (
                <Button
                  type="button"
                  onClick={cancelEditSize}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap bg-red-50 hover:bg-red-100"
                >
                  {t("Cancel")}
                </Button>
              )}
            </div>

            {/* Display sizes */}
            {tempColorSizes.length > 0 && (
              <div className="space-y-2">
                {tempColorSizes.map((sz, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between bg-gray-100 p-2 rounded border-2 transition ${
                      editingSizeIdx === idx
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-purple-500 text-white text-xs rounded-full font-bold">
                        {idx + 1}
                      </span>
                      <span className="font-medium text-gray-800">
                        {sz.size}
                      </span>
                      <span className="text-xs text-gray-600">
                        ({sz.quantity} {t("units")})
                      </span>
                    </div>

                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => startEditSize(idx)}
                        className="text-blue-600 hover:text-blue-800 font-bold px-2"
                        title={t("Edit")}
                      >
                        ✏️
                      </button>
                      <button
                        type="button"
                        onClick={() => removeColorSize(idx)}
                        className="text-red-600 hover:text-red-800 font-bold px-2"
                        title={t("Delete")}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* SAVE / CANCEL COLOR */}
          <div className="flex gap-2 pt-3 border-t">
            <Button
              type="button"
              onClick={editingColorIdx !== null ? updateColor : addColor}
              disabled={
                !tempColor.trim() ||
                (!tempColorImageFile && !tempColorImagePreview)
              }
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-400"
            >
              {editingColorIdx !== null
                ? t("✓ Update Color")
                : t("✓ Add Color")}
            </Button>

            {editingColorIdx !== null && (
              <Button
                type="button"
                onClick={() => {
                  setTempColor("");
                  setTempColorImageFile(null);
                  setTempColorImagePreview("");
                  setTempProductImageFiles([]);
                  setTempProductImagePreviews([]);
                  setTempColorSizes([]);
                  setEditingColorIdx(null);
                }}
                variant="outline"
              >
                {t("Cancel")}
              </Button>
            )}
          </div>
        </div>

        {/* LIST OF ADDED COLORS */}
        {productInfo.productItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800 text-sm">
              {t("Added Colors")} ({productInfo.productItems.length})
            </h4>

            {productInfo.productItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 bg-white p-3 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition"
              >
                <img
                  src={item.imagecolor}
                  alt={item.color}
                  className="w-12 h-12 rounded-lg border border-gray-300 object-cover"
                />

                <div className="flex-1">
                  <p className="font-medium text-gray-800">{item.color}</p>
                  <p className="text-xs text-gray-600">
                    🖼️ {item.productimages?.length || 0} {t("images")} • 📏{" "}
                    {item.sizes?.length || 0} {t("sizes")}
                  </p>
                </div>

                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => startEditColor(idx)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded transition"
                    title={t("Edit")}
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    onClick={() => removeColor(idx)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                    title={t("Delete")}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* FOOTER BUTTONS */}
      <DialogFooter className="gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            resetProductForm();
            setIsAddProductOpen(false);
          }}
          className="flex-1"
          disabled={isSubmitting}
        >
          {t("Cancel")}
        </Button>

        <Button
          type="submit"
          disabled={
            !productInfo.name?.trim() ||
            !productInfo.price ||
            productInfo.productItems.length === 0 ||
            isSubmitting
          }
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white disabled:bg-gray-400"
        >
          {isSubmitting ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              {editProductId ? t("Updating...") : t("Creating...")}
            </>
          ) : editProductId ? (
            t("✓ Update Product")
          ) : (
            t("✓ Create Product")
          )}
        </Button>
      </DialogFooter>

      {/* VALIDATION */}
      {productInfo.productItems.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ {t("Please add at least one color variant to save the product")}
          </p>
        </div>
      )}
    </form>
  </DialogContent>
</Dialog>


      {/* --- Product Details Dialog --- */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t("Product Details")}</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6">
              {/* Main Product Image */}
              {selectedProduct.productItems?.[0]?.productimages && selectedProduct.productItems[0].productimages.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                      <img
                        src={selectedProduct.productItems[0].productimages[0]}
                        alt={selectedProduct.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {selectedProduct.productItems[0].productimages.length > 1 && (
                      <div className="flex gap-2 flex-wrap">
                        {selectedProduct.productItems[0].productimages.map((img, idx) => (
                          <div
                            key={idx}
                            className="h-16 w-16 bg-gray-200 rounded overflow-hidden border-2 border-gray-300"
                          >
                            <img
                              src={img}
                              alt={`Product ${idx}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="space-y-4">
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        {selectedProduct.name}
                      </h2>
                      <p className="text-gray-600">{selectedProduct.description}</p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-gray-700">
                        <span className="font-semibold">{t("Brand")}:</span> {selectedProduct.brand}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">{t("Category")}:</span> {selectedProduct.category}
                      </p>
                      <p className="text-gray-700">
                        <span className="font-semibold">{t("Created")}:</span>{" "}
                        {new Date(selectedProduct.createdAt || "").toLocaleDateString('en-US')}
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-blue-600">
                          ${selectedProduct.price}
                        </span>
                        {selectedProduct.discountPrice && (
                          <span className="text-lg text-gray-500 line-through">
                            ${selectedProduct.discountPrice}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Colors Section */}
              {selectedProduct.productItems && selectedProduct.productItems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("Available Colors")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {selectedProduct.productItems.map((item, idx) => (
                        <div key={idx} className="text-center">
                          <div className="h-32 bg-gray-200 rounded-lg overflow-hidden mb-2 border-2 border-gray-300">
                            <img
                              src={item.imagecolor}
                              alt={item.color}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="font-medium text-gray-800">{item.color}</p>
                          {item.productimages && (
                            <p className="text-xs text-gray-500">{item.productimages.length} {t("images")}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sizes Section */}
              {selectedProduct.productItems?.[0]?.sizes && selectedProduct.productItems[0].sizes.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{t("Sizes & Stock")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-2 text-left font-semibold text-gray-700">
                              {t("Size")}
                            </th>
                            <th className="px-4 py-2 text-right font-semibold text-gray-700">
                              {t("Stock Quantity")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedProduct.productItems[0].sizes.map((size, idx) => (
                            <tr
                              key={idx}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 font-medium text-gray-800">
                                {size.size}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span
                                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                                    size.quantity > 0
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {size.quantity}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Summary Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">{t("Total Images")}</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedProduct.productItems?.reduce((sum, item) => sum + (item.productimages?.length || 0), 0) || 0}
                  </p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">{t("Color Variants")}</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {selectedProduct.productItems?.length || 0}
                  </p>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">{t("Available Sizes")}</p>
                  <p className="text-2xl font-bold text-green-600">
                    {selectedProduct.productItems?.reduce((sum, item) => sum + (item.sizes?.length || 0), 0) || 0}
                  </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">{t("Total Stock")}</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {selectedProduct.productItems?.reduce((sum, item) => sum + (item.sizes?.reduce((s, sz) => s + sz.quantity, 0) || 0), 0) || 0}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              {t("Close")}
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => {
                setShowDetailsDialog(false);
                if (selectedProduct) {
                  handleEditProduct(selectedProduct);
                }
              }}
            >
              {t("Edit Product")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- BULK DISCOUNT UPDATE DIALOG --- */}
      <Dialog open={showBulkDiscountDialog} onOpenChange={setShowBulkDiscountDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Apply Discount Percentage")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                {t("You are updating")} <span className="font-bold">{selectedProductIds.size}</span> {t("product(s)")}
              </p>
            </div>

            <div>
              <Label htmlFor="bulkDiscountPercent">{t("Discount Percentage (%)")} *</Label>
              <div className="relative">
                <Input
                  id="bulkDiscountPercent"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder={t("e.g., 20 for 20% off")}
                  value={bulkDiscountPercentage}
                  onChange={(e) => setBulkDiscountPercentage(e.target.value)}
                />
                <span className="absolute right-3 top-2.5 text-gray-500 font-semibold">%</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {t("Enter a value between 0 and 100")}
              </p>
            </div>

            {/* PREVIEW */}
            {bulkDiscountPercentage && !isNaN(parseFloat(bulkDiscountPercentage)) && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-800 mb-3">{t("Price Preview")}:</p>
                <div className="space-y-2">
                  {Array.from(selectedProductIds).slice(0, 3).map((id) => {
                    const product = products.find((p) => p._id === id);
                    if (!product) return null;
                    
                    const discountPercent = parseFloat(bulkDiscountPercentage);
                    const newDiscountPrice = product.price * (1 - discountPercent / 100);
                    
                    return (
                      <div key={id} className="flex justify-between items-center text-xs">
                        <span className="text-gray-700">{product.name.substring(0, 20)}...</span>
                        <div className="flex gap-2">
                          <span className="text-gray-500 line-through">${product.price.toFixed(2)}</span>
                          <span className="font-bold text-green-700">${newDiscountPrice.toFixed(2)}</span>
                        </div>
                      </div>
                    );
                  })}
                  {selectedProductIds.size > 3 && (
                    <p className="text-xs text-gray-600 pt-2 border-t">
                      +{selectedProductIds.size - 3} {t("more product(s)")}
                    </p>
                  )}
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ {t("This will apply the discount percentage to all selected products")}
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowBulkDiscountDialog(false);
                setBulkDiscountPercentage("");
              }}
              disabled={isSubmitting}
            >
              {t("Cancel")}
            </Button>

            <Button
              onClick={handleBulkUpdateDiscount}
              disabled={isSubmitting || !bulkDiscountPercentage}
              className="bg-purple-600 hover:bg-purple-700 text-white disabled:bg-gray-400"
            >
              {isSubmitting ? (
                <>
                  <span className="inline-block animate-spin mr-2">⏳</span>
                  {t("Applying...")}
                </>
              ) : (
                t("✓ Apply Discount")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}