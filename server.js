require("dotenv").config();
const express = require("express");

const loginRoutes = require("./routes/loginRoutes");
const productRoutes = require("./routes/productRoute");
const categoryRoutes = require("./routes/categoryRoute");
const customerRoutes = require("./routes/Customerlogin");
const cartRoutes = require("./routes/CartRoute");
const userRoutes = require("./routes/userRoute");

const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// ✅ Enhanced CORS configuration
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// ✅ Handle preflight requests - FIXED: removed the problematic app.options('*')
// Instead, we handle OPTIONS requests for all routes through CORS middleware

app.use(express.text({ type: "text/xml" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Create uploads folders automatically
const uploadPath = path.join(__dirname, "uploads");
const imagePath = path.join(uploadPath, "products");
const pdfPath = path.join(uploadPath, "pdfs");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath);
}

if (!fs.existsSync(imagePath)) {
  fs.mkdirSync(imagePath);
}

if (!fs.existsSync(pdfPath)) {
  fs.mkdirSync(pdfPath);
}

// ✅ Static folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Add logging middleware to see incoming requests
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api/admin", loginRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/customers", userRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api", cartRoutes);

// ✅ Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ 404 handler
app.use((req, res) => {
  console.log(`❌ 404 - Route not found: ${req.method} ${req.url}`);
  res.status(404).json({ 
    message: 'Route not found',
    path: req.url
  });
});

app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
  console.log(`📍 Local: http://localhost:5000`);
  console.log(`📍 API Endpoints:`);
  console.log(`   - Register: POST /api/customers/register`);
  console.log(`   - Login: POST /api/customers/login`);
  console.log(`   - All Customers: GET /api/customers/all`);
  console.log(`   - Admin Login: POST /api/admin/login`);
  console.log(`   - Products: /api/products`);
  console.log(`   - Categories: /api/categories`);
});