import { Pool } from "pg";
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "doctor_app",
  password: "kourtane",
  port: 5432,
});
export default pool;  