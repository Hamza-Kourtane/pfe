import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const { specialist, location } = req.query;

  try {
   const result = await pool.query(
  "SELECT * FROM doctors WHERE specialty ILIKE $1 AND location ILIKE $2",
  [`%${specialist || ""}%`, `%${location || ""}%`]
);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

export default router;