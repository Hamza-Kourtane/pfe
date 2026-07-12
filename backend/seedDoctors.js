import pool from './db.js';

const baseImageUrl = process.env.BASE_URL || 'http://localhost:5000';

const doctors = [
  {
    name: 'Dr Salma Benali',
    specialty: 'Cardiologist',
    location: 'Agadir',
    experience: '12 Years',
    rating: 5,
    lat: 30.4278,
    lng: -9.5981,
    image: `${baseImageUrl}/uploads/doctor_1.svg`,
  },
  {
    name: 'Dr Karim El Mansouri',
    specialty: 'Dermatologist',
    location: 'Casablanca',
    experience: '9 Years',
    rating: 4,
    lat: 33.5731,
    lng: -7.5898,
    image: `${baseImageUrl}/uploads/doctor_2.svg`,
  },
  {
    name: 'Dr Leila Haddad',
    specialty: 'Pediatrician',
    location: 'Rabat',
    experience: '7 Years',
    rating: 5,
    lat: 34.0209,
    lng: -6.8416,
    image: `${baseImageUrl}/uploads/doctor_3.svg`,
  },
  {
    name: 'Dr Omar Ziani',
    specialty: 'Neurologist',
    location: 'Marrakech',
    experience: '10 Years',
    rating: 4,
    lat: 31.6295,
    lng: -7.9811,
    image: `${baseImageUrl}/uploads/doctor_4.svg`,
  },
  {
    name: 'Dr Sana El Amrani',
    specialty: 'General Physician',
    location: 'Tanger',
    experience: '8 Years',
    rating: 5,
    lat: 35.7595,
    lng: -5.8330,
    image: `${baseImageUrl}/uploads/doctor_5.svg`,
  },
];

const initDb = async () => {
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

  const doctorColumns = [
    'ADD COLUMN IF NOT EXISTS image TEXT',
    'ADD COLUMN IF NOT EXISTS user_id INT REFERENCES users(id)',
    'ADD COLUMN IF NOT EXISTS fullname TEXT',
    'ADD COLUMN IF NOT EXISTS phone TEXT',
    'ADD COLUMN IF NOT EXISTS clinic_address TEXT',
    'ADD COLUMN IF NOT EXISTS license_number TEXT',
    "ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending'",
  ];

  for (const col of doctorColumns) {
    try {
      await pool.query(`ALTER TABLE doctors ${col}`);
    } catch (e) {
      console.warn('Doctor column update skipped:', e.message);
    }
  }

  let inserted = 0;
  for (const doctor of doctors) {
    const exists = await pool.query(
      'SELECT 1 FROM doctors WHERE LOWER(name) = LOWER($1)',
      [doctor.name]
    );

    if (exists.rowCount > 0) {
      await pool.query(
        `UPDATE doctors
         SET specialty = $2,
             location = $3,
             experience = $4,
             rating = $5,
             lat = $6,
             lng = $7,
             image = $8
         WHERE LOWER(name) = LOWER($1)`,
        [doctor.name, doctor.specialty, doctor.location, doctor.experience, doctor.rating, doctor.lat, doctor.lng, doctor.image]
      );
      continue;
    }

    await pool.query(
      `INSERT INTO doctors (name, specialty, location, experience, rating, lat, lng, image)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [doctor.name, doctor.specialty, doctor.location, doctor.experience, doctor.rating, doctor.lat, doctor.lng, doctor.image]
    );
    inserted += 1;
  }

  console.log(`Seeded ${inserted} doctors with profile images.`);
  process.exit(0);
};

initDb().catch((err) => {
  console.error('Failed to seed doctors:', err);
  process.exit(1);
});
