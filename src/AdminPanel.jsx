import { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabase";
import {
  BarChart3,
  Box,
  CheckCircle2,
  ChevronRight,
  ImagePlus,
  LayoutDashboard,
  LogOut,
  Package,
  Pencil,
  Plus,
  Save,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";

const categories = [
  "Shirts",
  "Blazers",
  "Suits",
  "Trousers",
  "T-Shirts",
];

const sizes = [
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "38",
  "40",
  "42",
  "44",
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
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

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

  const activeProducts = useMemo(
    () => products.filter((product) => product.is_active !== false),
    [products]
  );

  const hiddenProducts = useMemo(
    () => products.filter((product) => product.is_active === false),
    [products]
  );

  const totalValue = useMemo(
    () =>
      products.reduce(
        (sum, product) => sum + Number(product.price || 0),
        0
      ),
    [products]
  );

  const toggleSize = (size) => {
    setForm((current) => ({
      ...current,
      sizes: current.sizes.includes(size)
        ? current.sizes.filter((item) => item !== size)
        : [...current.sizes, size],
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setImageFile(file);

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
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

  const resetForm = () => {
    setForm(defaultForm);
    setEditingId(null);
    setImageFile(null);
    setImagePreview("");
  };

  const saveProduct = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage("Please enter a product name.");
      return;
    }

    if (!form.price || Number(form.price) < 0) {
      setMessage("Please enter a valid price.");
      return;
    }

    if (!form.sizes.length) {
      setMessage("Please select at least one size.");
      return;
    }

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

      resetForm();
      await loadProducts();

      setActiveTab("products");
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
    setImagePreview(product.image_url || "");
    setMessage("");
    setActiveTab("add");
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;

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

  const toggleProductStatus = async (product) => {
    const { error } = await supabase
      .from("products")
      .update({
        is_active: !product.is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", product.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadProducts();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    onClose();
  };

  return (
    <div className="adminOverlay">
      <div className="adminDashboard">

        <aside className="adminSidebar">
          <div className="adminBrand">
            <span>SHYAM</span>
            <small>ENTERPRISES</small>
          </div>

          <div className="adminWelcome">
            <span>STORE MANAGEMENT</span>
            <strong>Admin</strong>
          </div>

          <nav className="adminNav">
            <button
              className={activeTab === "dashboard" ? "active" : ""}
              onClick={() => setActiveTab("dashboard")}
            >
              <LayoutDashboard size={18} />
              Dashboard
            </button>

            <button
              className={activeTab === "products" ? "active" : ""}
              onClick={() => setActiveTab("products")}
            >
              <Package size={18} />
              Products
            </button>

            <button
              className={activeTab === "add" ? "active" : ""}
              onClick={() => {
                resetForm();
                setActiveTab("add");
                setMessage("");
              }}
            >
              <Plus size={18} />
              Add Product
            </button>
          </nav>

          <div className="adminSidebarBottom">
            <button onClick={logout}>
              <LogOut size={17} />
              Logout
            </button>

            <button onClick={onClose}>
              <X size={17} />
              Exit Admin
            </button>
          </div>
        </aside>

        <main className="adminMain">

          <header className="adminTopbar">
            <div>
              <span>SHYAM ENTERPRISES</span>
              <h1>
                {activeTab === "dashboard"
                  ? "Dashboard"
                  : activeTab === "products"
                  ? "Products"
                  : editingId
                  ? "Edit Product"
                  : "Add Product"}
              </h1>
            </div>

            <div className="adminTopActions">
              <button
                className="adminMobileExit"
                onClick={onClose}
              >
                <X size={18} />
              </button>

              <button
                className="adminQuickAdd"
                onClick={() => {
                  resetForm();
                  setActiveTab("add");
                }}
              >
                <Plus size={17} />
                ADD PRODUCT
              </button>
            </div>
          </header>

          {activeTab === "dashboard" && (
            <section className="adminContent">

              <div className="adminIntro">
                <div>
                  <span>WELCOME BACK</span>
                  <h2>Store Overview</h2>
                  <p>
                    Manage your Shyam Enterprises collection from one place.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab("products")}
                  className="adminViewButton"
                >
                  VIEW PRODUCTS
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="adminStats">

                <div className="adminStatCard">
                  <div className="adminStatIcon">
                    <Package size={20} />
                  </div>
                  <span>TOTAL PRODUCTS</span>
                  <strong>{products.length}</strong>
                  <small>All products in catalog</small>
                </div>

                <div className="adminStatCard">
                  <div className="adminStatIcon">
                    <CheckCircle2 size={20} />
                  </div>
                  <span>LIVE PRODUCTS</span>
                  <strong>{activeProducts.length}</strong>
                  <small>Visible on storefront</small>
                </div>

                <div className="adminStatCard">
                  <div className="adminStatIcon">
                    <Box size={20} />
                  </div>
                  <span>HIDDEN PRODUCTS</span>
                  <strong>{hiddenProducts.length}</strong>
                  <small>Not visible to customers</small>
                </div>

                <div className="adminStatCard">
                  <div className="adminStatIcon">
                    <BarChart3 size={20} />
                  </div>
                  <span>CATALOG VALUE</span>
                  <strong>
                    ₹{totalValue.toLocaleString("en-IN")}
                  </strong>
                  <small>Total listed product prices</small>
                </div>

              </div>

              <div className="adminSectionHeader">
                <div>
                  <span>COLLECTION</span>
                  <h2>Recent Products</h2>
                </div>

                <button onClick={() => setActiveTab("products")}>
                  VIEW ALL
                  <ChevronRight size={15} />
                </button>
              </div>

              <div className="adminRecentGrid">
                {products.slice(0, 4).map((product) => (
                  <div className="adminRecentCard" key={product.id}>
                    <div className="adminRecentImage">
                      <img
                        src={product.image_url}
                        alt={product.name}
                      />

                      <span
                        className={
                          product.is_active
                            ? "live"
                            : "hidden"
                        }
                      >
                        {product.is_active ? "LIVE" : "HIDDEN"}
                      </span>
                    </div>

                    <div>
                      <span>{product.category}</span>
                      <strong>{product.name}</strong>
                      <p>
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}

                {!products.length && (
                  <div className="adminEmpty">
                    <Package size={28} />
                    <strong>No products yet</strong>
                    <span>Add your first product to begin.</span>
                  </div>
                )}
              </div>

            </section>
          )}

          {activeTab === "products" && (
            <section className="adminContent">

              <div className="adminIntro">
                <div>
                  <span>YOUR COLLECTION</span>
                  <h2>Products</h2>
                  <p>
                    {products.length} product
                    {products.length === 1 ? "" : "s"} in your catalog.
                  </p>
                </div>

                <button
                  onClick={() => {
                    resetForm();
                    setActiveTab("add");
                  }}
                  className="adminViewButton"
                >
                  <Plus size={16} />
                  ADD PRODUCT
                </button>
              </div>

              {message && (
                <div className="adminMessage">
                  <CheckCircle2 size={17} />
                  {message}
                </div>
              )}

              <div className="adminProductGrid">

                {products.map((product) => (
                  <article
                    className="adminProductCard"
                    key={product.id}
                  >
                    <div className="adminProductImage">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                        />
                      ) : (
                        <div className="adminNoImage">
                          <ImagePlus size={28} />
                        </div>
                      )}

                      <span
                        className={
                          product.is_active
                            ? "productStatus live"
                            : "productStatus hidden"
                        }
                      >
                        {product.is_active ? "LIVE" : "HIDDEN"}
                      </span>
                    </div>

                    <div className="adminProductInfo">
                      <span>{product.category}</span>

                      <h3>{product.name}</h3>

                      <strong>
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </strong>

                      <p>
                        Sizes:{" "}
                        {product.sizes?.join(", ") || "None"}
                      </p>
                    </div>

                    <div className="adminProductActions">
                      <button onClick={() => editProduct(product)}>
                        <Pencil size={15} />
                        EDIT
                      </button>

                      <button
                        onClick={() => toggleProductStatus(product)}
                      >
                        {product.is_active ? "HIDE" : "SHOW"}
                      </button>

                      <button
                        className="danger"
                        onClick={() => deleteProduct(product.id)}
                      >
                        <Trash2 size={15} />
                        DELETE
                      </button>
                    </div>
                  </article>
                ))}

                {!products.length && (
                  <div className="adminEmpty large">
                    <ShoppingBag size={34} />
                    <strong>Your collection is empty</strong>
                    <span>
                      Add your first product to start building your store.
                    </span>

                    <button
                      onClick={() => setActiveTab("add")}
                    >
                      ADD FIRST PRODUCT
                    </button>
                  </div>
                )}

              </div>
            </section>
          )}

          {activeTab === "add" && (
            <section className="adminContent">

              <div className="adminIntro">
                <div>
                  <span>
                    {editingId ? "PRODUCT MANAGEMENT" : "NEW COLLECTION"}
                  </span>

                  <h2>
                    {editingId
                      ? "Edit Product"
                      : "Add New Product"}
                  </h2>

                  <p>
                    Add the details customers will see in your storefront.
                  </p>
                </div>
              </div>

              <form
                className="adminProductForm"
                onSubmit={saveProduct}
              >

                <div className="adminFormLeft">

                  <div className="adminFormCard">
                    <div className="adminFormTitle">
                      <span>01</span>
                      <div>
                        <strong>Product Details</strong>
                        <small>Basic information</small>
                      </div>
                    </div>

                    <label>
                      PRODUCT NAME
                      <input
                        required
                        placeholder="e.g. Premium Linen Shirt"
                        value={form.name}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            name: e.target.value,
                          })
                        }
                      />
                    </label>

                    <div className="adminTwoColumns">

                      <label>
                        CATEGORY
                        <select
                          value={form.category}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              category: e.target.value,
                            })
                          }
                        >
                          {categories.map((category) => (
                            <option key={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        PRICE
                        <div className="adminPriceInput">
                          <span>₹</span>
                          <input
                            required
                            type="number"
                            min="0"
                            placeholder="1499"
                            value={form.price}
                            onChange={(e) =>
                              setForm({
                                ...form,
                                price: e.target.value,
                              })
                            }
                          />
                        </div>
                      </label>

                    </div>

                    <label>
                      DESCRIPTION
                      <textarea
                        placeholder="Describe the fit, fabric and style..."
                        value={form.description}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            description: e.target.value,
                          })
                        }
                      />
                    </label>
                  </div>

                  <div className="adminFormCard">

                    <div className="adminFormTitle">
                      <span>02</span>
                      <div>
                        <strong>Available Sizes</strong>
                        <small>Select all available sizes</small>
                      </div>
                    </div>

                    <div className="adminSizeGrid">
                      {sizes.map((size) => (
                        <button
                          type="button"
                          key={size}
                          className={
                            form.sizes.includes(size)
                              ? "active"
                              : ""
                          }
                          onClick={() => toggleSize(size)}
                        >
                          {size}
                        </button>
                      ))}
                    </div>

                  </div>

                  <div className="adminFormCard">

                    <div className="adminFormTitle">
                      <span>03</span>
                      <div>
                        <strong>Store Visibility</strong>
                        <small>Control customer visibility</small>
                      </div>
                    </div>

                    <label className="adminVisibility">
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

                      <div>
                        <strong>
                          Product visible in store
                        </strong>

                        <span>
                          Customers can see and purchase this product.
                        </span>
                      </div>
                    </label>

                  </div>

                </div>

                <div className="adminFormRight">

                  <div className="adminImageCard">

                    <div className="adminFormTitle">
                      <span>04</span>
                      <div>
                        <strong>Product Image</strong>
                        <small>Upload a high-quality photo</small>
                      </div>
                    </div>

                    <div className="adminImagePreview">

                      {imagePreview || form.image_url ? (
                        <img
                          src={
                            imagePreview ||
                            form.image_url
                          }
                          alt="Product preview"
                        />
                      ) : (
                        <div>
                          <ImagePlus size={35} />
                          <strong>No image selected</strong>
                          <span>
                            Upload your original product photo
                          </span>
                        </div>
                      )}

                    </div>

                    <label className="adminImageUpload">
                      <ImagePlus size={17} />
                      CHOOSE PHOTO

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>

                    {imageFile && (
                      <p className="adminFileName">
                        {imageFile.name}
                      </p>
                    )}

                  </div>

                  <div className="adminSaveCard">

                    {message && (
                      <div className="adminMessage">
                        <CheckCircle2 size={16} />
                        {message}
                      </div>
                    )}

                    <button
                      className="adminSaveButton"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? (
                        "SAVING..."
                      ) : editingId ? (
                        <>
                          <Save size={17} />
                          UPDATE PRODUCT
                        </>
                      ) : (
                        <>
                          <Plus size={17} />
                          ADD PRODUCT
                        </>
                      )}
                    </button>

                    {editingId && (
                      <button
                        type="button"
                        className="adminCancelButton"
                        onClick={() => {
                          resetForm();
                          setActiveTab("products");
                        }}
                      >
                        CANCEL EDIT
                      </button>
                    )}

                  </div>

                </div>

              </form>

            </section>
          )}

        </main>
      </div>
    </div>
  );
}
