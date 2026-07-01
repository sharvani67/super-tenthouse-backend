// const express = require("express");
// const router = express.Router();
// const db = require("../db");
// require("dotenv").config();

// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");

// const query = (sql, values) => {
//   return new Promise((resolve, reject) => {
//     db.query(sql, values, (err, results) => {
//       if (err) return reject(err);
//       resolve(results);
//     });
//   });
// };

// // REGISTER API
// router.post("/register", async (req, res) => {
//   try {
//     const { name, email, phone, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({ message: "Required fields missing" });
//     }

//     // Check existing user
//     const existingUser = await query(
//       "SELECT id FROM customers WHERE email = ?",
//       [email]
//     );

//     if (existingUser.length > 0) {
//       return res.status(400).json({ message: "Email already registered" });
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(password, 10);

//     // Insert user
//     await query(
//       "INSERT INTO customers (name, email, phone, password) VALUES (?, ?, ?, ?)",
//       [name, email, phone || null, hashedPassword]
//     );

//     res.status(201).json({ message: "User registered successfully" });

//   } catch (error) {
//     console.error("REGISTER ERROR:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // LOGIN API
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     if (!email || !password) {
//       return res.status(400).json({ message: "Email & password required" });
//     }

//     // Get user
//     const users = await query(
//       "SELECT * FROM customers WHERE email = ?",
//       [email]
//     );

//     if (users.length === 0) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const user = users[0];

//     // Compare password
//     const isMatch = await bcrypt.compare(password, user.password);

//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     // Generate token
//     const token = jwt.sign(
//       { id: user.id, email: user.email },
//       process.env.JWT_SECRET || "secret123",
//       { expiresIn: "7d" }
//     );

//     res.json({
//       message: "Login successful",
//       token,
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         phone: user.phone,
//       },
//     });

//   } catch (error) {
//     console.error("LOGIN ERROR:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// router.get("/all", async (req, res) => {
//   try {
//     const customers = await query(
//       "SELECT id, name, email, phone, created_at FROM customers ORDER BY id DESC"
//     );

//     res.json({
//       message: "Customers fetched successfully",
//       count: customers.length,
//       data: customers,
//     });

//   } catch (error) {
//     console.error("GET CUSTOMERS ERROR:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();
const db = require("../db");
require("dotenv").config();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sendOTPEmail } = require("../utils/email");

const query = (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Generate OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// In-memory OTP storage (for development)
const otpStore = {};

// REGISTER API
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    // Check existing user
    const existingUser = await query(
      "SELECT id FROM customers WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user (is_verified = false)
    await query(
      "INSERT INTO customers (name, email, phone, password, is_verified) VALUES (?, ?, ?, ?, ?)",
      [name, email, phone || null, hashedPassword, false]
    );

    // Generate and store OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    otpStore[email] = {
      otp,
      expiresAt,
      name,
      phone
    };

    // ✅ Send OTP via email
    const emailSent = await sendOTPEmail(email, otp, name);

    console.log(`📧 OTP for ${email}: ${otp}`); // Also log for debugging

    res.status(201).json({ 
      message: emailSent ? "User registered successfully. Please check your email for OTP." : "User registered. OTP sent but email may have issues. Check console for OTP.",
      email: email,
      requiresOTP: true
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// VERIFY OTP API
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const storedOTP = otpStore[email];
    
    if (!storedOTP) {
      return res.status(400).json({ message: "OTP not found or expired" });
    }

    if (storedOTP.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (new Date() > new Date(storedOTP.expiresAt)) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP has expired" });
    }

    // Update user as verified
    await query(
      "UPDATE customers SET is_verified = true WHERE email = ?",
      [email]
    );

    // Get the user
    const users = await query(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );

    const user = users[0];

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "my_super_secret_key",
      { expiresIn: "7d" }
    );

    // Clear OTP from store
    delete otpStore[email];

    res.json({
      message: "OTP verified successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: true
      }
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// RESEND OTP API
router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email required" });
    }

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    
    const userData = otpStore[email] || {};
    otpStore[email] = {
      ...userData,
      otp,
      expiresAt
    };

    // ✅ Send new OTP via email
    await sendOTPEmail(email, otp, userData.name || 'User');

    console.log(`📧 New OTP for ${email}: ${otp}`);

    res.json({ 
      message: "OTP resent successfully",
      email: email
    });

  } catch (error) {
    console.error("RESEND OTP ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// LOGIN API
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email & password required" });
    }

    const users = await query(
      "SELECT * FROM customers WHERE email = ?",
      [email]
    );

    if (users.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = users[0];

    // Check if user is verified
    if (!user.is_verified) {
      const otp = generateOTP();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
      
      otpStore[email] = {
        otp,
        expiresAt,
        name: user.name,
        phone: user.phone
      };

      // Send OTP via email
      await sendOTPEmail(email, otp, user.name);
      console.log(`📧 OTP for unverified user ${email}: ${otp}`);

      return res.status(403).json({ 
        message: "Please verify your email first. OTP sent to your email.",
        requiresOTP: true,
        email: email
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "my_super_secret_key",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isVerified: user.is_verified
      },
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL CUSTOMERS
router.get("/all", async (req, res) => {
  try {
    const customers = await query(
      "SELECT id, name, email, phone, is_verified, created_at FROM customers ORDER BY id DESC"
    );

    res.json({
      message: "Customers fetched successfully",
      count: customers.length,
      data: customers,
    });

  } catch (error) {
    console.error("GET CUSTOMERS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;