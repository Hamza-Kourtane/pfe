import express from "express";
import pool from "../db.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "uploads");

// Multer setup for simple disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || "";
    cb(null, `doctor_${req.params.id}_${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

const router = express.Router();

// Search doctors by specialty and location
router.get("/", async (req, res) => {
  const { specialist, location } = req.query;
  const specialtyTerm = (specialist || "").trim();
  const locationTerm = (location || "").trim();
  const normalizedSpecialty = specialtyTerm
    .replace(/ists?$/i, "y")
    .replace(/\s+/g, " ");

  try {
    const result = await pool.query(
      `SELECT * FROM doctors
       WHERE ($1::text = '' OR
              LOWER(COALESCE(specialty, '')) ILIKE $1 OR
              LOWER(COALESCE(specialty, '')) ILIKE $3 OR
              LOWER(COALESCE(specialty, '')) ILIKE $4)
         AND ($2::text = '' OR LOWER(COALESCE(location, '')) ILIKE $2 OR LOWER(COALESCE(clinic_address, '')) ILIKE $2)`,
      [`%${specialtyTerm}%`, `%${locationTerm}%`, `%${normalizedSpecialty}%`, `%${specialtyTerm.replace(/\s+/g, "")}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ============================================================
// GET /doctors/:id/stats
// Get statistics for a doctor's dashboard
// Returns: total patients, today's appointments, pending,
//          accepted, completed
// ============================================================
router.get("/:id/stats", async (req, res) => {
  try {
    const { id } = req.params;

    const today = new Date().toISOString().split("T")[0];

    // Count total unique patients for this doctor
    const totalPatientsRes = await pool.query(
      `SELECT COUNT(DISTINCT patient_id) as count FROM appointments WHERE doctor_id = $1`,
      [id]
    );

    // Count appointments scheduled for today
    const todayRes = await pool.query(
      `SELECT COUNT(*) as count FROM appointments WHERE doctor_id = $1 AND appointment_date = $2`,
      [id, today]
    );

    // Count appointments with status 'pending'
    const pendingRes = await pool.query(
      `SELECT COUNT(*) as count FROM appointments WHERE doctor_id = $1 AND status = 'pending'`,
      [id]
    );

    // Count appointments with status 'accepted'
    const acceptedRes = await pool.query(
      `SELECT COUNT(*) as count FROM appointments WHERE doctor_id = $1 AND status = 'accepted'`,
      [id]
    );

    // Count appointments with status 'completed'
    const completedRes = await pool.query(
      `SELECT COUNT(*) as count FROM appointments WHERE doctor_id = $1 AND status = 'completed'`,
      [id]
    );

    res.json({
      totalPatients: parseInt(totalPatientsRes.rows[0].count),
      todayAppointments: parseInt(todayRes.rows[0].count),
      pending: parseInt(pendingRes.rows[0].count),
      accepted: parseInt(acceptedRes.rows[0].count),
      completed: parseInt(completedRes.rows[0].count),
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ error: "Could not load stats." });
  }
});

// Upload doctor avatar
router.post('/:id/avatar', upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    await pool.query('UPDATE doctors SET image = $1 WHERE id = $2', [fileUrl, req.params.id]);

    res.json({ image: fileUrl });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;