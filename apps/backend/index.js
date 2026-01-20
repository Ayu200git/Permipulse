console.log("STARTING SERVER...");
import "dotenv/config";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import subAdminRoutes from "./routes/subAdminRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import userRoutes from "./routes/userRoutes.js";

import { prisma } from "./db.js";

const app = express();
const port = process.env.PORT || 3000;

// CORS Configuration with environment variable support
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',').map(url => url.trim())
  : ["http://localhost:5173", "http://127.0.0.1:5173"];

const corsOptions = {
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

//Routes
app.use("/auth", authRoutes);
app.use("/admin", adminRoutes);
app.use("/sub-admin", subAdminRoutes);
app.use("/posts", postRoutes);
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ 
    message: "Permipulse API is running",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  console.log(`404 at ${req.url}`);
  res.status(404).json({ error: "Not Found" });
});

// Only listen when running locally
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

export default app;
