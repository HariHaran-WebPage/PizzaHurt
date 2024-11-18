import express from "express";
import { client } from "../index.js";
import { Getuser } from "../helperfunctions.js";
import { ObjectId } from "mongodb";
import Razorpay from "razorpay";
import shortid from "shortid";

const router = express.Router();

// Razorpay Configuration
const razorpay = new Razorpay({
  key_id: "rzp_test_3WUTrpolUhcOdV",
  key_secret: "IQd3UOCCYTf2zFbGMy0aVQC9",
});

// Get All Pizzas
router.route("/").get(async (req, res) => {
  try {
    const result = await client
      .db("pizzadelivery")
      .collection("pizzas")
      .find({})
      .toArray();
    res.send(result);
  } catch (error) {
    console.error("Error fetching pizzas:", error);
    res.status(500).send({ error: "Error fetching pizzas" });
  }
});

// Add New Pizzas
router.route("/").post(async (req, res) => {
  const data = req.body;
  try {
    const result = await client
      .db("pizzadelivery")
      .collection("pizzas")
      .insertMany(data);
    res.send(result);
  } catch (error) {
    console.error("Error adding pizzas:", error);
    res.status(500).send({ error: "Error adding pizzas" });
  }
});

router.route("/add-to-cart").post(async (req, res) => {
  const data = req.body;
  try {
    const result = await client
      .db("pizzadelivery")
      .collection("cart")
      .insertOne(data);
    res.send(result);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).send({ error: "Error adding to cart" });
  }
});

router.route("/add-to-cart").get(async (req, res) => {
  const id = req.header("x-auth-token");
  try {
    const user = await Getuser({ _id: ObjectId(id) });
    const cart = await client
      .db("pizzadelivery")
      .collection("cart")
      .find({ username: user.username })
      .toArray();
    res.send(cart);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).send({ error: "Error fetching cart items" });
  }
});

router.route("/product/:id").delete(async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client
      .db("pizzadelivery")
      .collection("cart")
      .deleteOne({ _id: ObjectId(id) });
    res.send(result);
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).send({ error: "Error removing item from cart" });
  }
});

router.route("/payment").post(async (req, res) => {
  const { amountPaid } = req.body;
  const options = {
    amount: amountPaid * 100, // Convert to paise
    currency: "INR",
    receipt: shortid.generate(),
  };

  try {
    const response = await razorpay.orders.create(options);

    if (response) {
      const data = req.body;
      await client.db("pizzadelivery").collection("orders").insertOne(data);
      await client.db("pizzadelivery").collection("cart").deleteMany();

      res.send({
        id: response.id,
        currency: response.currency,
        amount: response.amount,
      });
    } else {
      res.status(400).send({ error: "Payment order creation failed" });
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(400).send({ error: "Payment error" });
  }
});

router.route("/orderhistory").get(async (req, res) => {
  const id = req.header("x-auth-token");
  try {
    const user = await Getuser({ token: id });
    const orders = await client
      .db("pizzadelivery")
      .collection("orders")
      .find({ username: user.username })
      .toArray();
    res.send(orders);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).send({ error: "Error fetching order history" });
  }
});

router.route("/order/:id").delete(async (req, res) => {
  const { id } = req.params;
  try {
    const result = await client
      .db("pizzadelivery")
      .collection("orders")
      .deleteOne({ _id: ObjectId(id) });
    res.send(result);
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).send({ error: "Error deleting order" });
  }
});

export const pizzaRouter = router;
