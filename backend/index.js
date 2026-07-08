import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import pool from "./db.js";
import doctorRoutes from "./routes/doctors.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/doctors", doctorRoutes);
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("API running...");
});

const initDb = async () => {
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
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });