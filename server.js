require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

const mongo_uri = process.env.MONGO_URI;

mongoose.connect(mongo_uri, async () => {
  return await console.log("Database Connected");
});

// API endpoints

const authRoutes = require("./src/routes/auth");

app.use("/api/auth", authRoutes);

app.listen(4000, () => {
  console.log("Listening on port 4000");
});
