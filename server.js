require("dotenv").config();
const express = require("express");

const loginRoutes = require("./routes/loginRoutes");
const productRoutes = require("./routes/productRoute");
const categoryRoutes = require("./routes/categoryRoute");
const customerRoutes = require("./routes/Customerlogin");
const userRoutes = require("./routes/userRoute");


const cors = require("cors");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());

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



app.use("/api/admin", loginRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/customers", userRoutes);
app.use("/api/customers", customerRoutes);


app.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});