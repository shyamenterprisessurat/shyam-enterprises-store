import { useState } from "react";
import {
  Menu,
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  MessageCircle,
  Camera,
  Check,
} from "lucide-react";
import "./index.css";

const products = [
  {
    id: 1,
    name: "Classic Black Blazer",
    category: "Blazers",
    price: 3499,
    sizes: ["38", "40", "42", "44"],
    image: "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 2,
    name: "Premium White Shirt",
    category: "Shirts",
    price: 1499,
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 3,
    name: "Modern Black Shirt",
    category: "Shirts",
    price: 1699,
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 4,
    name: "Tailored Beige Trousers",
    category: "Trousers",
    price: 1899,
    sizes: ["30", "32", "34", "36", "38", "40"],
    image: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 5,
    name: "Luxury Formal Suit",
    category: "Suits",
    price: 5999,
    sizes: ["38", "40", "42", "44"],
    image: "https://images.unsplash.com/photo-1555069519-127aadedf1ee?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: 6,
    name: "Premium Polo",
    category: "T-Shirts",
    price: 1299,
    sizes: ["S", "M", "L", "XL", "XXL"],
    image: "https://images.unsplash.com/photo-1625910513413-5fc45e8ae8b1?auto=format&fit=crop&w=900&q=80",
  },
];

const categories = ["All", "Shirts", "Blazers", "Suits", "Trousers", "T-Shirts"];

function App() {
  const [menu, setMenu] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [category, setCategory] = useState("All");
  const [cart, setCart] = useState([]);
  const [selectedSize, setSelectedSize] = useState({});

  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    city: "Surat",
    pincode: "",
    payment: "COD",
  });

  const filtered =
    category === "All"
      ? products
      : products.filter((p) => p.category === category);

  const addToCart = (product) => {
    const size = selectedSize[product.id] || product.sizes[0];

    setCart((current) => {
      const existing = current.find(
        (item) => item.id === product.id && item.size === size
      );

      if (existing) {
        return current.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, qty: item.qty + 1 }
            : item
        );
      }

      return [...current, { ...product, size, qty: 1 }];
    });

    setCartOpen(true);
  };

  const updateQty = (id, size, amount) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id && item.size === size
            ? { ...item, qty: item.qty + amount }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeItem = (id, size) => {
    setCart((current) =>
      current.filter((item) => !(item.id === id && item.size === size))
    );
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const changeCustomer = (field, value) => {
    setCustomer((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const placeOrder = (event) => {
    event.preventDefault();

    if (!cart.length) return;

    const message = `Hello Shyam Enterprises,

I would like to place an order.

CUSTOMER
Name: ${customer.name}
Phone: ${customer.phone}
Address: ${customer.address}
City: ${customer.city}
PIN Code: ${customer.pincode}

ITEMS
${cart
  .map(
    (item) =>
      `${item.name} | Size: ${item.size} | Qty: ${item.qty} | ₹${
        item.price * item.qty
      }`
  )
  .join("\n")}

TOTAL: ₹${total.toLocaleString("en-IN")}
PAYMENT: ${customer.payment === "COD" ? "Cash on Delivery" : "Online Payment"}

Please confirm my order.`;

    setOrderComplete(true);

    setTimeout(() => {
      window.open(
        `https://wa.me/?text=${encodeURIComponent(message)}`,
        "_blank"
      );
    }, 500);
  };

  return (
    <div className="app">
      <div className="topbar">
        PREMIUM MENSWEAR • SURAT • EST. 1995
      </div>

      <header className="header">
        <button className="iconBtn" onClick={() => setMenu(!menu)}>
          {menu ? <X /> : <Menu />}
        </button>

        <div className="logo">
          SHYAM
          <span>ENTERPRISES</span>
        </div>

        <button className="cartBtn" onClick={() => setCartOpen(true)}>
          <ShoppingBag />
          {cartCount > 0 && <b>{cartCount}</b>}
        </button>
      </header>

      {menu && (
        <div className="mobileMenu">
          <a href="#home" onClick={() => setMenu(false)}>Home</a>
          <a href="#collection" onClick={() => setMenu(false)}>Collection</a>
          <a href="#about" onClick={() => setMenu(false)}>About Us</a>
          <a href="#contact" onClick={() => setMenu(false)}>Contact</a>
        </div>
      )}

      <section className="hero" id="home">
        <div className="heroOverlay">
          <p>THE NEW COLLECTION</p>
          <h1>
            Dress Sharp.
            <br />
            <em>Live Bold.</em>
          </h1>
          <span>
            Premium menswear crafted for modern men.
            <br />
            Discover timeless style at Shyam Enterprises.
          </span>
          <a href="#collection" className="goldBtn">
            SHOP COLLECTION <ArrowRight size={18} />
          </a>
        </div>
      </section>

      <section className="features">
        <div>
          <strong>01</strong>
          <span>Premium Quality</span>
        </div>
        <div>
          <strong>02</strong>
          <span>Curated Collection</span>
        </div>
        <div>
          <strong>03</strong>
          <span>Trusted Menswear</span>
        </div>
      </section>

      <section className="collection" id="collection">
        <div className="sectionTitle">
          <p>SHOP THE COLLECTION</p>
          <h2>Made For <i>Men.</i></h2>
          <span>Elevated essentials. Timeless silhouettes. Exceptional style.</span>
        </div>

        <div className="categories">
          {categories.map((item) => (
            <button
              key={item}
              className={category === item ? "active" : ""}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="products">
          {filtered.map((product) => (
            <article className="product" key={product.id}>
              <div className="productImage">
                <img src={product.image} alt={product.name} />

                <button onClick={() => addToCart(product)}>
                  <ShoppingBag size={19} />
                </button>
              </div>

              <p>{product.category}</p>
              <h3>{product.name}</h3>
              <strong>
                ₹{product.price.toLocaleString("en-IN")}
              </strong>

              <div className="sizeSelector">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={
                      (selectedSize[product.id] || product.sizes[0]) === size
                        ? "selected"
                        : ""
                    }
                    onClick={() =>
                      setSelectedSize((current) => ({
                        ...current,
                        [product.id]: size,
                      }))
                    }
                  >
                    {size}
                  </button>
                ))}
              </div>

              <button
                className="addBtn"
                onClick={() => addToCart(product)}
              >
                ADD TO BAG
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="story" id="about">
        <div>
          <p>THE SHYAM STANDARD</p>
          <h2>
            Style that speaks
            <br />
            <i>before you do.</i>
          </h2>
          <span>
            We believe great clothing is more than what you wear.
            It is confidence, character and the way you present yourself.
          </span>
        </div>
      </section>

      <section className="newsletter" id="contact">
        <p>SHYAM ENTERPRISES</p>
        <h2>
          Stay ahead of the <i>style curve.</i>
        </h2>
        <span>Premium menswear • Surat</span>
      </section>

      <footer>
        <div className="footerLogo">
          SHYAM
          <span>ENTERPRISES</span>
        </div>
        <p>Premium Menswear • Surat</p>

        <div className="socials">
          <Camera />
          <MessageCircle />
        </div>

        <small>
          © 2026 Shyam Enterprises. All rights reserved.
        </small>
      </footer>

      <a
        className="whatsapp"
        href="https://wa.me/"
        target="_blank"
        rel="noreferrer"
      >
        <MessageCircle />
      </a>

      {cartOpen && (
        <div className="cartBackdrop" onClick={() => setCartOpen(false)}>
          <aside className="cart" onClick={(e) => e.stopPropagation()}>
            <div className="cartHeader">
              <div>
                <p>YOUR BAG</p>
                <h2>Shopping Cart</h2>
              </div>

              <button onClick={() => setCartOpen(false)}>
                <X />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="emptyCart">
                <ShoppingBag size={45} />
                <h3>Your bag is empty</h3>
                <p>Discover our latest collection.</p>
                <button onClick={() => setCartOpen(false)}>
                  CONTINUE SHOPPING
                </button>
              </div>
            ) : (
              <>
                <div className="cartItems">
                  {cart.map((item) => (
                    <div
                      className="cartItem"
                      key={`${item.id}-${item.size}`}
                    >
                      <img src={item.image} alt="" />

                      <div>
                        <h3>{item.name}</h3>
                        <small>Size: {item.size}</small>

                        <strong>
                          ₹{item.price.toLocaleString("en-IN")}
                        </strong>

                        <div className="qty">
                          <button
                            onClick={() =>
                              updateQty(item.id, item.size, -1)
                            }
                          >
                            <Minus size={14} />
                          </button>

                          <span>{item.qty}</span>

                          <button
                            onClick={() =>
                              updateQty(item.id, item.size, 1)
                            }
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>

                      <button
                        className="removeBtn"
                        onClick={() =>
                          removeItem(item.id, item.size)
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cartBottom">
                  <div>
                    <span>Subtotal</span>
                    <strong>
                      ₹{total.toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <button
                    onClick={() => {
                      setCartOpen(false);
                      setCheckoutOpen(true);
                    }}
                  >
                    PROCEED TO CHECKOUT
                    <ArrowRight size={18} />
                  </button>

                  <small>
                    Secure checkout • Personal assistance
                  </small>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {checkoutOpen && (
        <div className="checkoutBackdrop">
          <div className="checkout">
            {!orderComplete ? (
              <>
                <div className="checkoutHeader">
                  <div>
                    <p>SHYAM ENTERPRISES</p>
                    <h2>Checkout</h2>
                  </div>

                  <button onClick={() => setCheckoutOpen(false)}>
                    <X />
                  </button>
                </div>

                <form onSubmit={placeOrder}>
                  <div className="checkoutGrid">
                    <label>
                      Full Name *
                      <input
                        required
                        value={customer.name}
                        onChange={(e) =>
                          changeCustomer("name", e.target.value)
                        }
                        placeholder="Your full name"
                      />
                    </label>

                    <label>
                      Mobile Number *
                      <input
                        required
                        type="tel"
                        pattern="[0-9]{10}"
                        value={customer.phone}
                        onChange={(e) =>
                          changeCustomer("phone", e.target.value)
                        }
                        placeholder="10 digit mobile number"
                      />
                    </label>
                  </div>

                  <label>
                    Delivery Address *
                    <textarea
                      required
                      value={customer.address}
                      onChange={(e) =>
                        changeCustomer("address", e.target.value)
                      }
                      placeholder="House / Flat / Street / Area"
                    />
                  </label>

                  <div className="checkoutGrid">
                    <label>
                      City *
                      <input
                        required
                        value={customer.city}
                        onChange={(e) =>
                          changeCustomer("city", e.target.value)
                        }
                      />
                    </label>

                    <label>
                      PIN Code *
                      <input
                        required
                        pattern="[0-9]{6}"
                        value={customer.pincode}
                        onChange={(e) =>
                          changeCustomer("pincode", e.target.value)
                        }
                        placeholder="395001"
                      />
                    </label>
                  </div>

                  <div className="paymentOptions">
                    <h3>Payment Method</h3>

                    <label className="paymentOption">
                      <input
                        type="radio"
                        name="payment"
                        checked={customer.payment === "COD"}
                        onChange={() =>
                          changeCustomer("payment", "COD")
                        }
                      />
                      <div>
                        <strong>Cash on Delivery</strong>
                        <small>Pay when your order arrives</small>
                      </div>
                    </label>

                    <label className="paymentOption">
                      <input
                        type="radio"
                        name="payment"
                        checked={customer.payment === "ONLINE"}
                        onChange={() =>
                          changeCustomer("payment", "ONLINE")
                        }
                      />
                      <div>
                        <strong>Online Payment</strong>
                        <small>Payment gateway will be connected next</small>
                      </div>
                    </label>
                  </div>

                  <div className="checkoutSummary">
                    <span>Order Total</span>
                    <strong>
                      ₹{total.toLocaleString("en-IN")}
                    </strong>
                  </div>

                  <button className="placeOrder" type="submit">
                    PLACE ORDER <ArrowRight size={18} />
                  </button>

                  <p className="checkoutDisclaimer">
                    By placing your order, you agree to our store terms.
                  </p>
                </form>
              </>
            ) : (
              <div className="orderSuccess">
                <div className="successIcon">
                  <Check />
                </div>

                <p>ORDER READY</p>

                <h2>
                  Thank you,
                  <br />
                  {customer.name}.
                </h2>

                <span>
                  Your order details have been prepared.
                  WhatsApp will open so you can send the order
                  directly to Shyam Enterprises.
                </span>

                <button
                  onClick={() => {
                    setCheckoutOpen(false);
                    setOrderComplete(false);
                    setCart([]);
                  }}
                >
                  DONE
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
