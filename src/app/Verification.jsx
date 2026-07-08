// Verification component: simple simulated verification step
// Shows a loading message "Verifying Doctor Account..." then after a delay
// marks the doctor as approved client-side and redirects to the doctor dashboard

import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Verification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const { user, doctor } = state;

  useEffect(() => {
    // simulate a backend verification delay
    const t = setTimeout(() => {
      // pretend the doctor is approved and save doctor info to localStorage
      if (doctor) {
        // map backend doctor to frontend expected shape and store it
        const mappedDoctor = {
          id: doctor.id,
          user_id: doctor.user_id,
          name: doctor.fullname,
          specialty: doctor.specialty,
          experience: doctor.experience,
          clinic_address: doctor.clinic_address,
          license_number: doctor.license_number,
          status: doctor.status,
        };
        localStorage.setItem('doctor', JSON.stringify(mappedDoctor));
      }
      if (user) {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('loggedIn', 'true');
      }
      // redirect to dashboard
      navigate('/doctor-dashboard');
    }, 2500);

    return () => clearTimeout(t);
  }, [doctor, user, navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: 80 }}>
      <h2>Verifying Doctor Account...</h2>
      <p>Please wait while we verify your documents.</p>
      <div style={{ marginTop: 24 }}>
        <div className="loader" />
      </div>
    </div>
  );
};

export default Verification;
