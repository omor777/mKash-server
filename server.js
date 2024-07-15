import express from "express";
import connectDb from "./db.js";

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());

app.get("/", (_req, res) => {
  res.status(200).json({ success: true });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  const message = err.message ? err.message : "Server Error Occurred";
  const status = err.status ? err.status : 500;
  res.status(status).json({ message });
});

// Connect to the database first, then start the server
connectDb("mongodb://127.0.0.1:27017/finance")
  .then(() => {
    console.log("Database connected");
    app.listen(port, () => {
      console.log(`server running on port ${port}`);
    });
  })
  .catch((e) => {
    console.error("Database connection failed:", e);
  });
