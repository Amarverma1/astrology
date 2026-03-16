const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

exports.createRazorpayOrder = async (req, res) => {
  try {

    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount required" });
    }

    // convert rupees → paise
    const amountInPaise = Number(amount) * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: "order_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json(order);

  } catch (error) {

    console.error("Razorpay error:", error);

    res.status(500).json({
      message: "Payment order failed"
    });

  }
};