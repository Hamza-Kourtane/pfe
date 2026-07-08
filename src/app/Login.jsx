import { useState, useEffect } from "react";
import "./Register.css";
import registerIllustration from "../assets/Frame 13_register.png";
import googleIcon from "../assets/Google.png";
import { useNavigate } from "react-router-dom";

// Login component: handles both patient and doctor login
// If the user is a doctor it will redirect to the doctor dashboard
const Login = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('loggedIn')) {
      navigate('/');
    }
  }, [navigate]);
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    if (!email || !password) {
      setErrorMessage("Email and password are required.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // If user is a doctor, backend returns { user, doctor }
      setSuccessMessage(`Welcome back, ${data.user.email}.`);
      localStorage.setItem('loggedIn', 'true');
      // Persist user info; if doctor include doctor object for dashboard
      localStorage.setItem('user', JSON.stringify(data.user));
      if (data.user.role === 'doctor' && data.doctor) {
        // map backend doctor fields to the frontend shape expected by DoctorDashboard
        const mappedDoctor = {
          id: data.doctor.id,
          user_id: data.doctor.user_id,
          name: data.doctor.fullname,
          specialty: data.doctor.specialty,
          experience: data.doctor.experience,
          clinic_address: data.doctor.clinic_address,
          license_number: data.doctor.license_number,
          status: data.doctor.status,
        };
        localStorage.setItem('doctor', JSON.stringify(mappedDoctor));
        // redirect doctors to dashboard
        navigate('/doctor-dashboard');
      } else {
        // patients go to homepage
        setEmail("");
        setPassword("");
        navigate('/');
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
    <div className="auth-container">
      <div className="reg-left">
        <img src={registerIllustration} alt="Doctor app illustration" />
      </div>

      <div className="reg-right">
        <form className="form" onSubmit={handleSubmit}>
          <h1>Welcome Back</h1>

             <div className="group">
          <input
            required
            type="email"
            className="input"
            id="register-email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <span className="highlight"></span>
          <span className = "bar"></span>
          <label htmlFor="register-email">Email</label>
          </div>


             <div className="group">
          <div className="reg-password-input-wrapper">
            <input
              required
              type={showPassword ? "text" : "password"}
              className="input"
              id="register-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="reg-toggle-password"
              onClick={() => setShowPassword((prev) => !prev)}
              onMouseDown={(e) => e.preventDefault()}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <span className="highlight"></span>
          <span className = "bar"></span>
          <label htmlFor="register-password">Password</label>
          </div>

          <button type="submit" className="main-btn" disabled={isLoading}>
            {isLoading ? "Logging in..." : "Log in"}
          </button>

          {successMessage ? (
            <p className="reg-status-message success">{successMessage}</p>
          ) : null}

          {errorMessage ? (
            <p className="reg-status-message error">{errorMessage}</p>
          ) : null}
        </form>

        <p className="reg-login-text">
          Need an account?{" "}
          <button type="button" className="reg-text-link" onClick={() => navigate('/register')}>
            Register
          </button>
        </p>

        {/* Button to start doctor registration flow */}
        <div style={{ marginTop: 12 }}>
          <button type="button" className="main-btn" onClick={() => navigate('/doctor-register')}>
            Continue as Doctor
          </button>
        </div>

        <div className="reg-google-btn">
          <button type="button" disabled>
            <img src={googleIcon} alt="Google icon" />
            Google login coming soon
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Login;
