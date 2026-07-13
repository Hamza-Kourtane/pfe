import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";
import registerIllustration from "../assets/Frame 13_register.png";
import googleIcon from "../assets/Google.png";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullname, setFullname] = useState("");
  const [idCard, setIdCard] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
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

      const response = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          fullname,
          idCard,
          phoneNumber,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      setSuccessMessage(`Account created for ${data.user.email}. You can log in now.`);
      setFullname("");
      setEmail("");
      setPassword("");
      setIdCard("");
      setPhoneNumber("");

      // Navigate to login page so user can log in manually
      navigate("/login");
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Registration failed. Please try again."
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
          <h1>Create Account</h1>

<div className="group file-group">
            <label htmlFor="avatar-upload" className="file-input-label">
              Profile image (optional)
            </label>
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              className="file-input"
              onChange={(e) => {
                const f = e.target.files[0];
                setAvatarFile(f);
                if (f) setAvatarPreview(URL.createObjectURL(f));
              }}
            />
            {avatarPreview && (
              <div className="avatar-preview-wrapper">
                <img src={avatarPreview} alt="preview" className="avatar-preview" />
              </div>
            )}
          </div>

          <div className="group">
            <input
              required
              type="text"
              className="input"
              id="register-fullname"
              value={fullname}
              onChange={(event) => setFullname(event.target.value)}
            />
            <span className="highlight"></span>
            <span className="bar"></span>
            <label htmlFor="register-fullname">Full Name</label>
          </div>

         <div className="group">
  <input
    required
    type="email"
    className="input"
    id="register-email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  <span className="highlight"></span>
  <span className="bar"></span>
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
      onChange={(e) => setPassword(e.target.value)}
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
  <span className="bar"></span>
  <label htmlFor="register-password">Password</label>
</div>

<div className="group">
  <input
    required
    type="text"
    className="input"
    id="register-id-card"
    value={idCard}
    onChange={(e) => setIdCard(e.target.value)}
  />
  <span className="highlight"></span>
  <span className="bar"></span>
  <label htmlFor="register-id-card">ID Card</label>
</div>

<div className="group">
  <input
    required
    type="text"
    className="input"
    id="register-phone-number"
    value={phoneNumber}
    onChange={(e) => setPhoneNumber(e.target.value)}
  />
  <span className="highlight"></span>
  <span className="bar"></span>
  <label htmlFor="register-phone-number">Phone Number</label>
</div>
          <button type="submit" className="main-btn" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </button>

          {successMessage ? (
            <p className="reg-status-message success">{successMessage}</p>
          ) : null}

          {errorMessage ? (
            <p className="reg-status-message error">{errorMessage}</p>
          ) : null}
        </form>

        <p className="reg-login-text">
          Already have an account?{" "}
          <button type="button" className="reg-text-link" onClick={() => navigate('/login')}>
            Login
          </button>
        </p>

        <div className="reg-google-btn">
          <button type="button" disabled>
            <img src={googleIcon} alt="Google icon" />
            Sign up with Google later
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Register;
