import express from "express";
import pool from "../db.js";

const router = express.Router();

// ============================================================
// POST /appointments
// Create a new appointment (patient books a doctor)
// Also checks if the patient is blocked before booking
// ============================================================
router.post("/", async (req, res) => {
  try {
    const {
      doctor_id,
      patient_id: rawPatientId,
      patient_name,
      patient_email: rawPatientEmail,
      patient_phone,
      date,
      time,
      reason,
    } = req.body;

    if (!doctor_id || !patient_name || !date || !time || (!rawPatientEmail && !rawPatientId)) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    let effectivePatientId = rawPatientId || null;
    let effectivePatientEmail = rawPatientEmail || null;
    let isBlocked = false;
    let userRes = null;

    if (effectivePatientId) {
      userRes = await pool.query(
        "SELECT id, email, points, blocked_until FROM users WHERE id = $1",
        [effectivePatientId]
      );
    } else {
      userRes = await pool.query(
        "SELECT id, email, points, blocked_until FROM users WHERE email = $1",
        [effectivePatientEmail]
      );
    }

    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      effectivePatientId = user.id;
      effectivePatientEmail = user.email;

      if (user.blocked_until) {
        const blockedDate = new Date(user.blocked_until);
        const today = new Date();
        if (blockedDate > today) {
          isBlocked = true;
        } else {
          await pool.query(
            "UPDATE users SET blocked_until = NULL, points = 5 WHERE id = $1",
            [effectivePatientId]
          );
        }
      }
    }

    if (isBlocked) {
      return res.status(403).json({
        error: "You are temporarily blocked because you missed too many appointments. Please try again after your suspension ends."
      });
    }

    const result = await pool.query(
      `INSERT INTO appointments (doctor_id, patient_id, patient_name, patient_email, patient_phone, appointment_date, appointment_time, reason, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [
        doctor_id,
        effectivePatientId,
        patient_name,
        effectivePatientEmail,
        patient_phone || null,
        date,
        time,
        reason || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create appointment error:", error);
    res.status(500).json({ error: "Could not book appointment." });
  }
});

// ============================================================
// GET /appointments/doctor/:id
// Get all appointments for a specific doctor
// Used by the Doctor Dashboard
// ============================================================
router.get("/doctor/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT * FROM appointments
       WHERE doctor_id = $1
       ORDER BY appointment_date DESC, appointment_time DESC`,
      [id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get doctor appointments error:", error);
    res.status(500).json({ error: "Could not load appointments." });
  }
});

// ============================================================
// GET /appointments/patient/:userId
// Get all appointments for a specific patient
// Used by the Patient Homepage
// ============================================================
router.get("/patient/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // Use COALESCE to handle both seed data (name) and registered doctors (fullname)
    const result = await pool.query(
      `SELECT a.*, COALESCE(d.name, d.fullname) as doctor_name, d.specialty
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_id = $1
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [userId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get patient appointments error:", error);
    res.status(500).json({ error: "Could not load appointments." });
  }
});

// ============================================================
// GET /appointments/patient-by-email/:email
// Get appointments for a patient using their email
// Used by the Patient Homepage
// ============================================================
router.get("/patient-by-email/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Use COALESCE to handle both seed data (name) and registered doctors (fullname)
    const result = await pool.query(
      `SELECT a.*, COALESCE(d.name, d.fullname) as doctor_name, d.specialty
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.patient_email = $1 AND a.status != 'cancelled'
       ORDER BY a.appointment_date DESC, a.appointment_time DESC`,
      [email]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get patient appointments error:", error);
    res.status(500).json({ error: "Could not load appointments." });
  }
});

// ============================================================
// PATCH /appointments/:id/status
// Update appointment status
// Used by doctor to accept, reject, complete, or mark as missed
// If status = "missed", decrease patient points
// ============================================================
router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ["pending", "accepted", "rejected", "completed", "missed", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    // Update the appointment status
    const result = await pool.query(
      `UPDATE appointments SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    // If the appointment was marked as missed, decrease patient points
    if (status === "missed") {
      const appointment = result.rows[0];
      if (appointment.patient_id) {
        // Decrease points by 1
        const updateRes = await pool.query(
          `UPDATE users SET points = points - 1 WHERE id = $1 RETURNING points`,
          [appointment.patient_id]
        );

        if (updateRes.rows.length > 0) {
          const currentPoints = updateRes.rows[0].points;

          // If points reach 0, block the patient for 30 days
          if (currentPoints <= 0) {
            const blockUntil = new Date();
            blockUntil.setDate(blockUntil.getDate() + 30);

            await pool.query(
              `UPDATE users SET blocked_until = $1, points = 0 WHERE id = $2`,
              [blockUntil, appointment.patient_id]
            );
          }
        }
      }
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ error: "Could not update appointment." });
  }
});

// ============================================================
// DELETE /appointments/:id
// Cancel an appointment (remove it from the system)
// Used when patient cancels their booking
// ============================================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Delete the appointment from the database
    const result = await pool.query(
      `DELETE FROM appointments WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Appointment not found." });
    }

    res.json({ message: "Appointment cancelled successfully." });
  } catch (error) {
    console.error("Delete appointment error:", error);
    res.status(500).json({ error: "Could not cancel appointment." });
  }
});

export default router;
  