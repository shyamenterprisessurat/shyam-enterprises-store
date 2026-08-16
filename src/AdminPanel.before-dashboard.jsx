import { useEffect, useState } from "react";
import { supabase } from "./supabase";

const categories = [
  "Shirts",
  "Blazers",
  "Suits",
  "Trousers",
  "T-Shirts",
];

const defaultForm = {
  name: "",
  category: "Shirts",
  price: "",
  description: "",
  sizes: [],
  image_url: "",
  is_active: true,
};

export default function AdminPanel({ onClose }) {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const loadProducts = async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setMessage(error.message);
      return;
    }

    setProducts(data || []);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const toggleSize = (size) => {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.includes(size)
        ? current.sizes.filter((item) => item !== size)
        : [...current.sizes, size],
    }));
  };

  const uploadImage = async () => {
    if (!imageFile) return form.image_url;

    const extension = imageFile.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}.${extension}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage
      .from("product-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const imageUrl = await uploadImage();

      const productData = {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        description: form.description.trim(),
        sizes: form.sizes,
        image_url: imageUrl || "",
        is_active: form.is_active,
        updated_at: new Date().toISOString(),
      };

      if (editingId) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingId);

        if (error) throw error;

        setMessage("Product updated successfully.");
      } else {
        const { error } = await supabase
          .from("products")
          .insert(productData);

        if (error) throw error;

        setMessage("Product added successfully.");
      }

      setForm(defaultForm);
      setEditingId(null);
      setImageFile(null);
      await loadProducts();
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Unable to save product.");
    } finally {
      setLoading(false);
    }
  };

  const editProduct = (product) => {
    setEditingId(product.id);

    setForm({
      name: product.name || "",
      category: product.category || "Shirts",
      price: product.price || "",
      description: product.description || "",
      sizes: product.sizes || [],
      image_url: product.image_url || "",
      is_active: product.is_active !== false,
    });

    setImageFile(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Product deleted.");
    await loadProducts();
  };

  return (
    <div className="adminOverlay">
      <div className="adminPanel">
        <div className="adminHeader">
          <div>
            <p>SHYAM ENTERPRISES</p>
            <h1>Admin Panel</h1>
          </div>

          <button onClick={onClose}>CLOSE</button>
        </div>

        <form className="adminForm" onSubmit={saveProduct}>
          <h2>{editingId ? "Edit Product" : "Add Product"}</h2>

          <input
            required
            placeholder="Product name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          >
            {categories.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>

          <input
            required
            type="number"
            min="0"
            placeholder="Price"
            value={form.price}
            onChange={(e) =>
              setForm({ ...form, price: e.target.value })
            }
          />

          <textarea
            placeholder="Product description"
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />

          <label className="adminUpload">
            Product photo
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setImageFile(e.target.files?.[0] || null)
              }
            />
          </label>

          <div className="adminSizes">
            <strong>Available Sizes</strong>

            <div>
              {[
                "S",
                "M",
                "L",
                "XL",
                "XXL",
                "38",
                "40",
                "42",
                "44",
              ].map((size) => (
                <button
                  type="button"
                  key={size}
                  className={
                    form.sizes.includes(size) ? "active" : ""
                  }
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <label>
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) =>
                setForm({
                  ...form,
                  is_active: e.target.checked,
                })
              }
            />
            Product visible in store
          </label>

          <button type="submit" disabled={loading}>
            {loading
              ? "SAVING..."
              : editingId
              ? "UPDATE PRODUCT"
              : "ADD PRODUCT"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setForm(defaultForm);
                setImageFile(null);
              }}
            >
              CANCEL EDIT
            </button>
          )}

          {message && <p>{message}</p>}
        </form>

        <div className="adminProducts">
          <h2>Products</h2>

          {products.map((product) => (
            <div className="adminProduct" key={product.id}>
              <img
                src={product.image_url}
                alt={product.name}
              />

              <div>
                <strong>{product.name}</strong>
                <span>{product.category}</span>
                <span>
                  ₹{Number(product.price).toLocaleString("en-IN")}
                </span>
                <small>
                  Sizes: {product.sizes?.join(", ") || "None"}
                </small>
              </div>

              <div>
                <button onClick={() => editProduct(product)}>
                  EDIT
                </button>

                <button onClick={() => deleteProduct(product.id)}>
                  DELETE
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
