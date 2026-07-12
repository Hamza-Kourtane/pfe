import express from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// create a router for auth-related endpoints
const router = express.Router();

const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "uploads");

// multer setup for user avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, `user_${req.params.id || 'new'}_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// Simple patient registration (keeps existing behavior)
// This route creates a user with default role 'patient'.
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullname, idCard, phoneNumber } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (email, password, role, fullname) VALUES ($1, $2, 'patient', $3) RETURNING id, email, role, fullname",
      [email, hashedPassword, fullname || null]
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ error: "Unable to create account. Please try again." });
  }
});

// Doctor registration route
// This creates a user with role 'doctor', then creates a doctors row linked by user_id.
router.post("/register-doctor", async (req, res) => {
  try {
    const { fullname, email, password, phone, specialty, experience, clinic_address, license_number } = req.body;

    if (!email || !password || !fullname) {
      return res.status(400).json({ error: "Full name, email and password are required." });
    }

    // prevent duplicate emails
    const existingUser = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    // create user record with role = doctor
    const hashedPassword = await bcrypt.hash(password, 10);
    const userRes = await pool.query(
      "INSERT INTO users (email, password, role, fullname) VALUES ($1, $2, 'doctor', $3) RETURNING id, email, role, fullname",
      [email, hashedPassword, fullname]
    );
    const user = userRes.rows[0];

    // create doctors row linked to the user
    const docRes = await pool.query(
      `INSERT INTO doctors (user_id, name, fullname, phone, specialty, location, experience, clinic_address, license_number, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'approved') RETURNING *`,
      [user.id, fullname, fullname, phone || null, specialty || null, clinic_address || null, experience || null, clinic_address || null, license_number || null]
    );

    const doctor = docRes.rows[0];

    // return both user and doctor info
    res.status(201).json({ user, doctor });
  } catch (error) {
    console.error("Register doctor error:", error);
    res.status(500).json({ error: "Unable to create doctor account. Please try again." });
  }
});

// Login route
// Verifies credentials and returns user info; if user is a doctor, include the doctor record.
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    // fetch user with role, password hash, and block info
    const result = await pool.query("SELECT id, email, password, role, fullname, points, blocked_until FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // If patient was blocked, check if the block has expired
    if (user.role === 'patient' && user.blocked_until) {
      const blockedDate = new Date(user.blocked_until);
      const today = new Date();
      if (today >= blockedDate) {
        // Block expired, unblock and reset points
        await pool.query(
          "UPDATE users SET blocked_until = NULL, points = 5 WHERE id = $1",
          [user.id]
        );
        user.blocked_until = null;
        user.points = 5;
      }
    }

    // basic response object
    const responseUser = { id: user.id, email: user.email, role: user.role, fullname: user.fullname, points: user.points, blocked_until: user.blocked_until };

    if (user.role === 'doctor') {
      // fetch doctor row for this user
      const docRes = await pool.query('SELECT * FROM doctors WHERE user_id = $1', [user.id]);
      const doctor = docRes.rows[0] || null;
      return res.json({ user: responseUser, doctor });
    }

    // patient login
    res.json({ user: responseUser });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Unable to login. Please try again." });
  }
});

// Upload user avatar
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    await pool.query('UPDATE users SET image = $1 WHERE id = $2', [fileUrl, req.params.id]);
    res.json({ image: fileUrl });
  } catch (err) {
    console.error('User avatar upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;