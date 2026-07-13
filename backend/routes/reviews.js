import express from "express";
import pool from "../db.js";

const router = express.Router();

// POST /reviews - save a star rating after a completed appointment
router.post("/", async (req, res) => {
  try {
    const { appointment_id, doctor_id, patient_id, rating } = req.body;

    if (!appointment_id || !doctor_id || !patient_id || !rating) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5." });
    }

    // Insert the review
    await pool.query(
      `INSERT INTO reviews (appointment_id, doctor_id, patient_id, rating)
       VALUES ($1, $2, $3, $4)`,
      [appointment_id, doctor_id, patient_id, rating]
    );

    // Mark the appointment as reviewed
    await pool.query(
      `UPDATE appointments SET reviewed = TRUE WHERE id = $1`,
      [appointment_id]
    );

    // Calculate new average rating for the doctor
    const avgRes = await pool.query(
      `SELECT ROUND(AVG(rating)) as avg_rating FROM reviews WHERE doctor_id = $1`,
      [doctor_id]
    );

    const avgRating = parseInt(avgRes.rows[0].avg_rating) || 0;

    // Update the doctor's rating
    await pool.query(
      `UPDATE doctors SET rating = $1 WHERE id = $2`,
      [avgRating, doctor_id]
    );

    res.json({ message: "Review submitted successfully." });
  } catch (error) {
    console.error("Review error:", error);
    res.status(500).json({ error: "Could not save review." });
  }
});

export default router;
