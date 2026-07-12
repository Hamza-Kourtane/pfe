import pool from './db.js';
const specialtyTerm = 'Cardiology';
const locationTerm = 'Agadir';
const q = await pool.query(
  `SELECT * FROM doctors WHERE ($1::text = '' OR LOWER(COALESCE(specialty, '')) ILIKE $1 OR LOWER(COALESCE(specialty, '')) ILIKE $3 OR LOWER(COALESCE(specialty, '')) ILIKE $4) AND ($2::text = '' OR LOWER(COALESCE(location, '')) ILIKE $2 OR LOWER(COALESCE(clinic_address, '')) ILIKE $2)`,
  [`%${specialtyTerm}%`, `%${locationTerm}%`, `%${specialtyTerm}%`, `%${specialtyTerm.replace(/\s+/g, '')}%`]
);
console.log(JSON.stringify(q.rows, null, 2));
await pool.end();
