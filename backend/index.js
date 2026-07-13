import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";
import pool from "./db.js";
import doctorRoutes from "./routes/doctors.js";
import appointmentRoutes from "./routes/appointments.js";
import aiRoutes from "./routes/ai.js";

dotenv.config();

const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json());
app.use("/doctors", doctorRoutes);
app.use("/auth", authRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/ai", aiRoutes);
app.post("/reviews", async (req, res) => {
  try {
    const { appointment_id, doctor_id, patient_id, rating } = req.body;
    if (!appointment_id || !doctor_id || !patient_id || !rating) {
      return res.status(400).json({ error: "Missing required fields." });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }
    await pool.query(
      `INSERT INTO reviews (appointment_id, doctor_id, patient_id, rating) VALUES ($1, $2, $3, $4)`,
      [appointment_id, doctor_id, patient_id, rating]
    );
    await pool.query(`UPDATE appointments SET reviewed = TRUE WHERE id = $1`, [appointment_id]);
    const avgRes = await pool.query(`SELECT ROUND(AVG(rating)) as avg_rating FROM reviews WHERE doctor_id = $1`, [doctor_id]);
    const avgRating = parseInt(avgRes.rows[0].avg_rating) || 0;
    await pool.query(`UPDATE doctors SET rating = $1 WHERE id = $2`, [avgRating, doctor_id]);
    res.json({ message: "Review submitted successfully." });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({ error: "Could not save review." });
  }
});
app.get("/", (req, res) => {
  res.send("API running...");
});

const initDb = async () => {
  // Create users table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role VARCHAR(20) DEFAULT 'patient',
      points INT DEFAULT 5,
      blocked_until TIMESTAMP,
      is_verified BOOLEAN DEFAULT FALSE,
      verification_token TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add fullname column to users if it doesn't exist
  // (needed for patient registration)
  try {
    await pool.query(`ALTER TABLE users ADD COLUMN fullname VARCHAR(255)`);
    await pool.query(`ALTER TABLE users ADD COLUMN image TEXT`);
  } catch (e) {
    // Column already exists, ignore error
  }

  // Create doctors table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS doctors (
      id SERIAL PRIMARY KEY,
      name TEXT,
      specialty TEXT,
      location TEXT,
      experience TEXT,
      rating INT,
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION
    )
  `);

  // Add missing columns to doctors table (needed for doctor registration)
  const doctorColumns = [
    "ADD COLUMN IF NOT EXISTS image TEXT",
    "ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id)",
    "ADD COLUMN IF NOT EXISTS fullname TEXT",
    "ADD COLUMN IF NOT EXISTS phone TEXT",
    "ADD COLUMN IF NOT EXISTS clinic_address TEXT",
    "ADD COLUMN IF NOT EXISTS license_number TEXT",
    "ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'",
  ];
  for (const col of doctorColumns) {
    try {
      await pool.query(`ALTER TABLE doctors ${col}`);
    } catch (e) {
      // Column may already exist in older PG versions, ignore
    }
  }

  // Create appointments table if it doesn't exist
  await pool.query(`
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      doctor_id INT REFERENCES doctors(id),
      patient_id INT REFERENCES users(id),
      patient_name VARCHAR(255),
      patient_email VARCHAR(255),
      patient_phone VARCHAR(50),
      appointment_date DATE,
      appointment_time VARCHAR(20),
      reason TEXT,
      status VARCHAR(20) DEFAULT 'pending',
      reviewed BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add reviewed column if missing
  try {
    await pool.query(`ALTER TABLE appointments ADD COLUMN reviewed BOOLEAN DEFAULT FALSE`);
  } catch (e) { /* already exists */ }

  // Create reviews table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS reviews (
      id SERIAL PRIMARY KEY,
      appointment_id INT UNIQUE REFERENCES appointments(id),
      doctor_id INT REFERENCES doctors(id),
      patient_id INT REFERENCES users(id),
      rating INT CHECK (rating >= 1 AND rating <= 5),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed some sample doctors if table is empty
  const res = await pool.query('SELECT COUNT(*) FROM doctors');
  const count = parseInt(res.rows[0].count, 10);
  if (count === 0) {
    await pool.query(
      `INSERT INTO doctors (name, specialty, location, experience, rating, lat, lng) VALUES
        ($1, $2, $3, $4, $5, $6, $7),
        ($8, $9, $10, $11, $12, $13, $14),
        ($15, $16, $17, $18, $19, $20, $21)
      `,
      [
        'Dr John', 'Dentist', 'Agadir', '5 Years', 5, 30.4278, -9.5981,
        'Dr Sara', 'Cardiologist', 'Paris', '10 Years', 4, 48.8566, 2.3522,
        'Dr Alex', 'Dentist', 'Paris', '3 Years', 4, 48.8570, 2.3500,
      ]
    );
    console.log('Seeded doctors table with sample data');
  }
};

initDb()
  .then(() => {
    // Serve uploaded images
    app.use(
      "/uploads",
      express.static(uploadsDir)
    );
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });