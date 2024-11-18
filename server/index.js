import express from "express";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import cors from "cors";
import { userRouter } from "./routes/user.js";
import { pizzaRouter } from "./routes/pizza.js";

const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

async function createConnection() {
  try {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("MongoDB is connected successfully.");
    return client;
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    process.exit(1);
  }
}

export const client = await createConnection();

app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

app.use("/users", userRouter);
app.use("/pizzas", pizzaRouter);

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`);
});
