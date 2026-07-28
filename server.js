require("dotenv").config();
const express = require("express");

// Import all route files
const loginRoutes = require("./routes/loginRoutes");
const productRoutes = require("./routes/productRoute");
const categoryRoutes = require("./routes/categoryRoute");
const customerRoutes = require("./routes/Customerlogin");
const cartRoutes = require("./routes/CartRoute");
const userRoutes = require("./routes/userRoute");
const packageRoutes = require('./routes/packages');

// Additional routes
const heroBannersRoutes = require("./routes/hero-banners");
const testimonialsRoutes = require("./routes/testimonials");
const whyChooseUsRoutes = require("./routes/whyChooseUs");
const addonRoutes = require('./routes/addons');

const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

// ✅ Enhanced CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware - IMPORTANT: These must come BEFORE routes
app.use(express.text({ type: "text/xml" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ✅ Create uploads folders automatically
const uploadPath = path.join(__dirname, "uploads");
const imagePath = path.join(uploadPath, "products");
const pdfPath = path.join(uploadPath, "pdfs");

[uploadPath, imagePath, pdfPath].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ✅ Static folder - This must come BEFORE routes
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Add logging middleware to see incoming requests
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// ✅ Test route to verify API is working
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "API is working!", 
    timestamp: new Date().toISOString(),
    endpoints: [
      "/api/products",
      "/api/products/category/:categoryId",
      "/api/products/trending",
      "/api/products/best-sellers",
      "/api/products/new-arrivals",
      "/api/products/search",
      "/api/products/:id",
      "/api/categories",
      "/api/categories/:id"
    ]
  });
});

// API Routes - Register AFTER middleware
app.use("/api/admin", loginRoutes);
app.use('/api/packages', packageRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/customers", userRoutes);
app.use('/api/addons', addonRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/hero-banners", heroBannersRoutes);
app.use("/api/testimonials", testimonialsRoutes);
app.use("/api/why-choose-us", whyChooseUsRoutes);
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

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Local: http://localhost:${PORT}`);
  console.log(`📍 API Endpoints:`);
  console.log(`   - Test: GET /api/test`);
  console.log(`   - Products: GET /api/products`);
  console.log(`   - Products by Category: GET /api/products/category/:id`);
  console.log(`   - Categories: GET /api/categories`);
  console.log(`   - Register: POST /api/customers/register`);
  console.log(`   - Login: POST /api/customers/login`);
});