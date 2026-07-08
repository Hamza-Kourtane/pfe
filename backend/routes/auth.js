import express from "express";
import bcrypt from "bcrypt";
import pool from "../db.js";

// create a router for auth-related endpoints
const router = express.Router();

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
      `INSERT INTO doctors (user_id, fullname, phone, specialty, experience, clinic_address, license_number, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'approved') RETURNING *`,
      [user.id, fullname, phone || null, specialty || null, experience || null, clinic_address || null, license_number || null]
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

    // fetch user with role and password hash
    const result = await pool.query("SELECT id, email, password, role, fullname FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // basic response object
    const responseUser = { id: user.id, email: user.email, role: user.role, fullname: user.fullname };

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

export default router;