const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const Razorpay = require("razorpay");

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
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
