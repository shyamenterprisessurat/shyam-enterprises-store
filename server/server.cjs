const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Razorpay = require("razorpay");
const { createClient } = require("@supabase/supabase-js");

dotenv.config({ path: "./server/.env" });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
);
const app = express();

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

app.post("/api/orders", async (req, res) => {
  try {
    const {
      id,
      customer,
      items,
      total,
      status = "Order Placed",
    } = req.body;

    if (
      !id ||
      !customer ||
      !customer.name ||
      !customer.phone ||
      !customer.address ||
      !customer.city ||
      !customer.pincode ||
      !items ||
      !items.length ||
      total == null
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required order details",
      });
    }

    const { data, error } = await supabase
      .from("orders")
      .insert({
        id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        customer_address: customer.address,
        customer_city: customer.city,
        customer_pincode: customer.pincode,
        payment_method: customer.payment,
        items,
        total,
        status,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase order error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to save order",
      });
    }

    res.json({
      success: true,
      order: data,
    });
  } catch (error) {
    console.error("Order API error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to save order",
    });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const { phone } = req.query;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("customer_phone", phone)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase orders error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load orders",
      });
    }

    res.json({
      success: true,
      orders: data || [],
    });
  } catch (error) {
    console.error("Orders API error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load orders",
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Shyam Enterprises payment server is running",
  });
});

app.post("/api/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `SE_${Date.now()}`,
    });

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Unable to create payment order",
    });
  }
});

app.listen(4242, "0.0.0.0", () => {
  console.log("Shyam Enterprises payment server running on port 4242");
});
