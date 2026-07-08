  import React, { useState } from 'react';
  import { useNavigate } from 'react-router-dom';
  import './DoctorRegister.css';
  import registerIllustration from '../assets/Frame 13_register.png';
  import googleIcon from '../assets/Google.png';

  const DoctorRegister = () => {
    const navigate = useNavigate();
    const [fullname, setFullname] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [phone, setPhone] = useState('');
    const [specialty, setSpecialty] = useState('');
    const [experience, setExperience] = useState('');
    const [clinicAddress, setClinicAddress] = useState('');
    const [licenseNumber, setLicenseNumber] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');
      if (!fullname || !email || !password) {
        setError('Full name, email and password are required.');
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('http://localhost:5000/auth/register-doctor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullname,
            email,
            password,
            phone,
            specialty,
            experience,
            clinic_address: clinicAddress,
            license_number: licenseNumber,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        navigate('/doctor-verification', { state: { user: data.user, doctor: data.doctor } });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Registration failed');
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="doctor-container">
        <div className="doctor-left">
          <img src={registerIllustration} alt="Doctor app illustration" />
        </div>

        <div className="doctor-right">
          <div className="content">
            <h1 className="title">Create Doctor Account</h1>
            <form className="form-grid" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="doctor-fullname">Full Name</label>
                <input
                  required
                  type="text"
                  id="doctor-fullname"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="doctor-email">Email</label>
                <input
                  required
                  type="email"
                  id="doctor-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="doctor-password">Password</label>
                <div className="doctor-password-input-wrapper">
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    id="doctor-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="doctor-toggle-password"
                    onClick={() => setShowPassword((prev) => !prev)}
                    onMouseDown={(e) => e.preventDefault()}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="doctor-phone">Phone Number</label>
                <input
                  type="text"
                  id="doctor-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="doctor-specialty">Specialty</label>
                <input
                  type="text"
                  id="doctor-specialty"
                  list="specialties"
                  placeholder="Choose or type a specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                />
                <datalist id="specialties">
                  <option value="Cardiology" />
                  <option value="Dermatology" />
                  <option value="Pediatrics" />
                  <option value="General Practice" />
                  <option value="Orthopedics" />
                  <option value="Neurology" />
                  <option value="Obstetrics & Gynecology" />
                  <option value="Ophthalmology" />
                  <option value="Psychiatry" />
                  <option value="Endocrinology" />
                  <option value="ENT" />
                  <option value="Urology" />
                  <option value="Gastroenterology" />
                  <option value="Radiology" />
                  <option value="Oncology" />
                </datalist>
              </div>

              <div className="form-group">
                <label htmlFor="doctor-experience">Years of Experience</label>
                <input
                  type="text"
                  id="doctor-experience"
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                />
              </div>

              <div className="form-group full-width">
                <label htmlFor="doctor-clinic-address">Clinic Address</label>
                <input
                  type="text"
                  id="doctor-clinic-address"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="doctor-license-number">License Number</label>
                <input
                  type="text"
                  id="doctor-license-number"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                />
              </div>

              <button type="submit" className="doctor-register-btn" disabled={loading}>
                {loading ? 'Submitting...' : 'Create Doctor Account'}
              </button>

              {error && <p className="doctor-status-message">{error}</p>}
            </form>
          </div>

          <p className="doctor-login-text">
            Already have an account?{' '}
            <button type="button" className="doctor-text-link" onClick={() => navigate('/login')}>
              Login
            </button>
          </p>

          <div className="doctor-google-btn">
            <button type="button" disabled>
              <img src={googleIcon} alt="Google icon" />
              Sign up with Google later
            </button>
          </div>
        </div>
      </div>
    );
  };

  export default DoctorRegister;
