"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  images?: string;
}

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
    images: "[]",
  });
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user.role !== "admin") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchProducts();
    }
  }, [status, session, router]);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      const imgs = product.images ? JSON.parse(product.images) : [];
      setAdditionalImages(imgs);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        stock: product.stock.toString(),
        image: product.image || "",
        images: product.images || "[]",
      });
    } else {
      setEditingProduct(null);
      setAdditionalImages([]);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        image: "",
        images: "[]",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const url = editingProduct
        ? `/api/products/${editingProduct.id}`
        : "/api/products";
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage(editingProduct ? "Product updated successfully" : "Product added successfully");
        closeModal();
        fetchProducts();
        setTimeout(() => setMessage(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Operation failed");
      }
    } catch (error) {
      setError("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage("Product deleted successfully");
        fetchProducts();
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError("Failed to delete product");
      }
    } catch (error) {
      setError("An error occurred");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        setFormData(prev => ({ ...prev, image: result.url }));
        setMessage("Image uploaded successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(result.error || "Failed to upload image");
      }
    } catch (error) {
      setError("An error occurred while uploading");
    } finally {
      setUploading(false);
    }
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError("");

    try {
      const data = new FormData();
      data.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const result = await response.json();

      if (response.ok) {
        const newImages = [...additionalImages, result.url];
        setAdditionalImages(newImages);
        setFormData(prev => ({ ...prev, images: JSON.stringify(newImages) }));
        setMessage("Additional image uploaded!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(result.error || "Failed to upload image");
      }
    } catch (error) {
      setError("An error occurred while uploading");
    } finally {
      setUploading(false);
    }
  };

  const removeAdditionalImage = (index: number) => {
    const newImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(newImages);
    setFormData(prev => ({ ...prev, images: JSON.stringify(newImages) }));
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8 animate-slide-up">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
              📦 Manage Products
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">Add, edit, or remove products from your store</p>
          </div>
          <button
            onClick={() => openModal()}
            className="w-full sm:w-auto bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-blue-700 font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center gap-2"
          >
            <span className="text-xl">➕</span>
            Add New Product
          </button>
        </div>

        {message && (
          <div className="mb-6 animate-bounce-in">
            <div className="bg-gradient-to-r from-green-400 to-green-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg">
              <p className="flex items-center text-sm sm:text-base">
                <span className="text-xl sm:text-2xl mr-2">✅</span>
                {message}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 animate-bounce-in">
            <div className="bg-gradient-to-r from-red-400 to-red-500 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg">
              <p className="flex items-center text-sm sm:text-base">
                <span className="text-xl sm:text-2xl mr-2">❌</span>
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Products Grid - Mobile */}
        <div className="block lg:hidden space-y-4">
          {products.map((product, index) => (
            <div 
              key={product.id} 
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover-lift animate-slide-up"
              style={{animationDelay: `${index * 0.1}s`}}
            >
              <div className="flex gap-4 p-4">
                <img
                  src={product.image || "https://via.placeholder.com/100"}
                  alt={product.name}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">{product.description}</p>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                      ${product.price.toFixed(2)}
                    </span>
                    <span className="bg-gray-100 px-2 py-1 rounded-full text-xs font-semibold">
                      📦 {product.stock}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openModal(product)}
                      className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 text-sm font-semibold transition-all"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm font-semibold transition-all"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Products Table - Desktop */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-2xl overflow-hidden animate-scale-in">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-bold">🖼️ Image</th>
                  <th className="px-6 py-4 text-left font-bold">📝 Name</th>
                  <th className="px-6 py-4 text-left font-bold">💬 Description</th>
                  <th className="px-6 py-4 text-left font-bold">💰 Price</th>
                  <th className="px-6 py-4 text-left font-bold">📦 Stock</th>
                  <th className="px-6 py-4 text-left font-bold">⚙️ Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product, index) => (
                  <tr 
                    key={product.id} 
                    className="hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all animate-slide-in-left"
                    style={{animationDelay: `${index * 0.05}s`}}
                  >
                    <td className="px-6 py-4">
                      <img
                        src={product.image || "https://via.placeholder.com/100"}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-xl shadow-md hover:scale-110 transition-transform"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-800">{product.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">{product.description}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                        ${product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                        product.stock > 10 ? 'bg-green-100 text-green-700' :
                        product.stock > 0 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal(product)}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 font-semibold transition-all hover:scale-105 shadow-md"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold transition-all hover:scale-105 shadow-md"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="text-center py-16">
              <div className="text-7xl mb-4">📦</div>
              <p className="text-gray-600 text-lg">No products yet. Add your first product!</p>
            </div>
          )}
        </div>

        {/* Empty State - Mobile */}
        {products.length === 0 && (
          <div className="lg:hidden text-center py-16 bg-white rounded-2xl shadow-lg">
            <div className="text-7xl mb-4">📦</div>
            <p className="text-gray-600">No products yet. Add your first product!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                {editingProduct ? "✏️ Edit Product" : "➕ Add New Product"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 text-3xl transition-all hover:scale-110"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="bg-gradient-to-r from-red-400 to-red-500 text-white px-4 py-3 rounded-xl mb-4">
                <p className="flex items-center text-sm">
                  <span className="text-xl mr-2">❌</span>
                  {error}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Product Name */}
              <div>
                <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
                  <span className="text-lg">📝</span>
                  Product Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
                  <span className="text-lg">💬</span>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                  rows={3}
                  required
                />
              </div>

              {/* Price and Stock */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    Price
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
                    <span className="text-lg">📦</span>
                    Stock
                  </label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-all"
                    required
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
                  <span className="text-lg">🖼️</span>
                  Main Product Image
                </label>
                {formData.image && (
                  <div className="mb-4">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-xl shadow-md"
                    />
                  </div>
                )}
                <label className="cursor-pointer">
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl hover:from-purple-700 hover:to-blue-700 font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2">
                    <span className="text-xl">📷</span>
                    {uploading ? "Uploading..." : "Upload Main Image"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>

              {/* Additional Images */}
              <div>
                <label className="block text-gray-700 font-bold mb-2 flex items-center gap-2">
                  <span className="text-lg">🖼️</span>
                  Additional Images (Gallery)
                </label>
                
                {/* Additional Images Grid */}
                {additionalImages.length > 0 && (
                  <div className="mb-4 grid grid-cols-4 gap-3">
                    {additionalImages.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Additional ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg shadow-md"
                        />
                        <button
                          type="button"
                          onClick={() => removeAdditionalImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 text-xs font-bold"
                        >
                          ✕
                        </button>
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white px-2 py-0.5 rounded text-xs">
                          {index + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <label className="cursor-pointer">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center gap-2">
                    <span className="text-xl">➕</span>
                    {uploading ? "Uploading..." : "Add More Images"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAdditionalImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">Upload multiple images for the product gallery. They will auto-slide every 4 seconds.</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 sm:py-4 rounded-xl hover:from-green-700 hover:to-blue-700 font-bold text-base sm:text-lg transition-all shadow-lg hover:shadow-xl hover:scale-105"
                >
                  {editingProduct ? "💾 Update Product" : "➕ Add Product"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 bg-gray-200 text-gray-800 py-3 sm:py-4 rounded-xl hover:bg-gray-300 font-bold text-base sm:text-lg transition-all"
                >
                  ❌ Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
