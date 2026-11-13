const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

const PORT = process.env.PORT || 5000;

// Allowed frontend URLs
const allowedOrigins = [
  "https://packet-frontend.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

// CORS setup
app.use(cors({
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
    ) {
      return callback(null, true);
    }

    return callback(null, true); // Permissive for local dev / testing
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Network Packet Validator Backend Running",
    database: mongoose.connection.readyState === 1
      ? "Connected"
      : "Disconnected"
  });
});

// Packet routes (support both /api/packets and /packets for compatibility)
app.use("/api/packets", require("./routes/packetRoutes"));
app.use("/packets", require("./routes/packetRoutes"));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.message);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// MongoDB connection with automatic local fallback
async function connectToDatabase() {
  const atlasURI = process.env.MONGO_URI;
  

  if (atlasURI) {
    try {
      console.log("Connecting to MongoDB Atlas...");
      await mongoose.connect(atlasURI, { serverSelectionTimeoutMS: 4000 });
      console.log("MongoDB Atlas Connected Successfully");
      return;
    } catch (error) {
      console.warn("MongoDB Atlas connection failed/timed out:", error.message);
    }
  }

  try {
    await mongoose.connect(localURI, { serverSelectionTimeoutMS: 4000 });
    console.log("Local MongoDB Connected Successfully (127.0.0.1:27017)");
  } catch (err) {
    console.error("Local MongoDB Connection Failed:", err.message);
    process.exit(1);
  }
}

connectToDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
