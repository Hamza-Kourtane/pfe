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
  // Validation errors per field
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('loggedIn')) {
      navigate('/');
    }
  }, [navigate]);

  // Validate all form fields and return true if valid
  const validateForm = () => {
    const errors = {};

    // Full name: letters and spaces only, at least 2 characters
    const nameTrimmed = fullname.trim();
    if (!nameTrimmed) {
      errors.fullname = "Full name is required.";
    } else if (nameTrimmed.length < 2) {
      errors.fullname = "Name must be at least 2 characters.";
    } else if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(nameTrimmed)) {
      errors.fullname = "Name should only contain letters.";
    }

    // Email: basic email format
    if (!email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    // Password: at least 6 characters
    if (!password) {
      errors.password = "Password is required.";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters.";
    }

    // ID Card: alphanumeric, at least 3 characters
    if (!idCard.trim()) {
      errors.idCard = "ID Card is required.";
    } else if (idCard.trim().length < 3) {
      errors.idCard = "ID Card must be at least 3 characters.";
    } else if (!/^[A-Za-z0-9\-/]+$/.test(idCard.trim())) {
      errors.idCard = "ID Card should only contain letters, numbers, dashes or slashes.";
    }

    // Phone: digits only, 10-15 digits
    const phoneTrimmed = phoneNumber.trim();
    if (!phoneTrimmed) {
      errors.phoneNumber = "Phone number is required.";
    } else if (!/^\d+$/.test(phoneTrimmed)) {
      errors.phoneNumber = "Phone number should only contain digits.";
    } else if (phoneTrimmed.length < 10 || phoneTrimmed.length > 15) {
      errors.phoneNumber = "Phone number must be between 10 and 15 digits.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Clear a field error when user starts typing
  const clearFieldError = (field) => {
    setFieldErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    // Run validation before submitting
    if (!validateForm()) return;

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
              className={`input ${fieldErrors.fullname ? "input-error" : ""}`}
              id="register-fullname"
              value={fullname}
              onChange={(e) => { setFullname(e.target.value); clearFieldError("fullname"); }}
            />
            <span className="highlight"></span>
            <span className="bar"></span>
            <label htmlFor="register-fullname">Full Name</label>
            {fieldErrors.fullname && <span className="field-error">{fieldErrors.fullname}</span>}
          </div>

         <div className="group">
  <input
    required
    type="email"
    className={`input ${fieldErrors.email ? "input-error" : ""}`}
    id="register-email"
    value={email}
    onChange={(e) => { setEmail(e.target.value); clearFieldError("email"); }}
  />
  <span className="highlight"></span>
  <span className="bar"></span>
  <label htmlFor="register-email">Email</label>
  {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
</div>

<div className="group">
  <div className="reg-password-input-wrapper">
    <input
      required
      type={showPassword ? "text" : "password"}
      className={`input ${fieldErrors.password ? "input-error" : ""}`}
      id="register-password"
      value={password}
      onChange={(e) => { setPassword(e.target.value); clearFieldError("password"); }}
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
  {fieldErrors.password && <span className="field-error">{fieldErrors.password}</span>}
</div>

<div className="group">
  <input
    required
    type="text"
    className={`input ${fieldErrors.idCard ? "input-error" : ""}`}
    id="register-id-card"
    value={idCard}
    onChange={(e) => { setIdCard(e.target.value); clearFieldError("idCard"); }}
  />
  <span className="highlight"></span>
  <span className="bar"></span>
  <label htmlFor="register-id-card">ID Card</label>
  {fieldErrors.idCard && <span className="field-error">{fieldErrors.idCard}</span>}
</div>

<div className="group">
  <input
    required
    type="text"
    className={`input ${fieldErrors.phoneNumber ? "input-error" : ""}`}
    id="register-phone-number"
    value={phoneNumber}
    onChange={(e) => { setPhoneNumber(e.target.value.replace(/\D/g, "")); clearFieldError("phoneNumber"); }}
  />
  <span className="highlight"></span>
  <span className="bar"></span>
  <label htmlFor="register-phone-number">Phone Number</label>
  {fieldErrors.phoneNumber && <span className="field-error">{fieldErrors.phoneNumber}</span>}
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
