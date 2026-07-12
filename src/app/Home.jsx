import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";
import logo from "../assets/logo-transparent.png";
import heroVideo from "../assets/herosectionvedio.mp4";
import frame6 from "../assets/Frame 6.png";
import frame7 from "../assets/Frame 7.png";
import frame14 from "../assets/Frame 14.png";
import frame8 from "../assets/Frame 8.png";
import frame9 from "../assets/Frame 9.png";
import frame10 from "../assets/Frame 10.png";
import frame15 from "../assets/Frame 15.png";
import ellipse2 from "../assets/Ellipse 2.png";
import {
  BadgeCheck,
  Building2,
  CalendarDays,
  Clock3,
  Menu,
  X,
  Stethoscope,
  User,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import SearchForm from "../components/SearchForm";
import AIChatbot from "./AIChatbot";

const specialties = [
  { label: "General Practitioners", image: ellipse2 },
  { label: "Dentists", image: frame7 },
  { label: "Podiatrists", image: frame9 },
  { label: "Neurologists", image: frame8 },
  { label: "Chiropractors", image: frame14 },
  { label: "Physical Therapists", image: frame10 },
  { label: "Dermatologists", image: frame6 },
];

const navItems = ["HOME", "ALL DOCTORS", "ABOUT", "CONTACT"];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("loggedIn"));
  const [showPopup, setShowPopup] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // State for patient's appointments
  const [appointments, setAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  // State for cancel confirmation modal
  const [cancelModal, setCancelModal] = useState(null); // stores the appointment to cancel

  const [specialist, setSpecialist] = useState("");
  const [location, setLocation] = useState("");

  // Check login status and load user data
  useEffect(() => {
    const checkLogin = () => {
      const loggedIn = !!localStorage.getItem("loggedIn");
      setIsLoggedIn(loggedIn);
      if (loggedIn) {
        const userData = localStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } else {
        setUser(null);
        setAppointments([]);
      }
    };
    checkLogin();
    window.addEventListener("storage", checkLogin);
    return () => window.removeEventListener("storage", checkLogin);
  }, []);

  // Load patient appointments when user is logged in
  useEffect(() => {
    if (!user) return;

    const loadAppointments = async () => {
      try {
        setIsLoadingAppointments(true);
        let url = `http://localhost:5000/appointments/patient-by-email/${encodeURIComponent(user.email)}`;
        if (user.id) {
          url = `http://localhost:5000/appointments/patient/${user.id}`;
        }

        const response = await fetch(url);
        const data = await response.json();
        if (response.ok) {
          setAppointments(data);
        }
      } catch (error) {
        console.error("Could not load appointments:", error);
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    loadAppointments();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setUser(null);
    setAppointments([]);
    navigate("/");
  };

  // Get the latest appointment (first in the sorted array)
  const latestAppointment = appointments.length > 0 ? appointments[0] : null;

  // Cancel an appointment (delete from database)
  const handleCancelAppointment = async () => {
    if (!cancelModal) return;

    try {
      const response = await fetch(
        `http://localhost:5000/appointments/${cancelModal.id}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not cancel");

      // Remove from local state
      setAppointments((prev) => prev.filter((a) => a.id !== cancelModal.id));
      setCancelModal(null);
    } catch (error) {
      console.error("Cancel error:", error);
      alert("Could not cancel appointment. Please try again.");
    }
  };

  // Format date nicely
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get status color class
  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";
      case "accepted":
        return "status-accepted";
      case "rejected":
        return "status-rejected";
      case "completed":
        return "status-completed";
      case "missed":
        return "status-missed";
      case "cancelled":
        return "status-cancelled";
      default:
        return "";
    }
  };

  return (
    <div className="home-page">
      {/* ========================= */}
      {/* HEADER                   */}
      {/* ========================= */}
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <img src={logo} alt="Logo" />
          </div>
        </div>

        <nav className="nav">
          {navItems.map((item) => (
            <span
              className={item === "HOME" ? "active" : ""}
              key={item}
              onClick={() => {
                if (item === "ALL DOCTORS" && isLoggedIn) navigate("/doctorlist");
                else if (item === "HOME") navigate("/");
              }}
              style={{
                cursor: item === "ALL DOCTORS" && isLoggedIn ? "pointer" : "default",
              }}
            >
              {item}
            </span>
          ))}
        </nav>

        <div className="header-right">
          {!isLoggedIn ? (
            <>
              <button className="create-btn" onClick={() => navigate("/register")}>
                Create account
              </button>
              <button className="login-btn" onClick={() => navigate("/login")}>
                <span>Login</span>
                <svg width="15px" height="10px" viewBox="0 0 13 10">
                  <path d="M1,5 L11,5"></path>
                  <polyline points="8 1 12 5 8 9"></polyline>
                </svg>
              </button>
            </>
          ) : (
            <button
              className="login-btn"
              onClick={handleLogout}
            >
              <span>Logout</span>
              <svg width="15px" height="10px" viewBox="0 0 13 10">
                <path d="M1,5 L11,5"></path>
                <polyline points="8 1 12 5 8 9"></polyline>
              </svg>
            </button>
          )}
        </div>
      </header>

      <main>
        {/* ========================= */}
        {/* HERO SECTION             */}
        {/* ========================= */}
        <section className="hero-section">
          <video autoPlay muted playsInline className="hero-video" src={heroVideo} />
          <div className="hero-overlay" />

          <div className="hero-content">
            <h1>Find and Book Doctors Effortlessly</h1>
            <p className="hero-text">24/7 Doctor Appointments. Easy & Secure Booking</p>

            <SearchForm
              isLoggedIn={isLoggedIn}
              setShowPopup={setShowPopup}
              className="home-search"
            />
          </div>

          <div className="hero-specialties">
            <p className="specialties-title">Are you looking for :</p>
            <div className="specialties-list">
              {specialties.map((specialty) => (
                <div className="specialty-item" key={specialty.label}>
                  <img
                    className="specialty-icon"
                    src={specialty.image}
                    alt={specialty.label}
                  />
                  <span>{specialty.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* =============================================== */}
        {/* APPOINTMENT DETAILS SECTION                     */}
        {/* Shows the patient's latest appointment if any   */}
        {/* DO NOT recreate this section - only improve it  */}
        {/* =============================================== */}
        <section className="appointment-details-section">
          <h2>Details Appointment</h2>

          {!isLoggedIn ? (
            /* Show message when user is not logged in */
            <div className="appointment-login-prompt">
              <User size={40} />
              <p>Please log in to see your appointments.</p>
              <button className="create-btn" onClick={() => navigate("/login")}>
                Log in
              </button>
            </div>
          ) : isLoadingAppointments ? (
            /* Loading state */
            <div className="appointment-loading">
              <p>Loading your appointments...</p>
            </div>
          ) : !latestAppointment ? (
            /* No appointments yet */
            <div className="appointment-empty">
              <CalendarDays size={40} />
              <p>You have no appointments yet.</p>
              <p>Search for a doctor and book your first appointment.</p>
            </div>
          ) : (
            /* Show the latest appointment */
            <>
              <div className="appointment-info-card">
                {/* Appointment Date */}
                <div className="appointment-row">
                  <div>
                    <h3>{formatDate(latestAppointment.appointment_date)}</h3>
                    <p>Appointment Date</p>
                  </div>
                  <CalendarDays className="appointment-icon" size={24} />
                </div>

                <div className="appointment-divider" />

                {/* Appointment Time */}
                <div className="appointment-row">
                  <div>
                    <h3>{latestAppointment.appointment_time}</h3>
                    <p>Appointment Time</p>
                  </div>
                  <Clock3 className="appointment-icon" size={24} />
                </div>

                <div className="appointment-divider" />

                {/* Status of appointment */}
                <div className="appointment-row">
                  <div>
                    <h3 className={getStatusClass(latestAppointment.status)}>
                      {latestAppointment.status.charAt(0).toUpperCase() +
                        latestAppointment.status.slice(1)}
                    </h3>
                    <p>Appointment Status</p>
                  </div>
                  <AlertTriangle className="appointment-icon" size={24} />
                </div>
              </div>

              {/* Doctor card for this appointment */}
              <div className="doctor-appointment-card">
                <div className="doctor-photo">
                  {latestAppointment.doctor_name
                    ? latestAppointment.doctor_name.charAt(0).toUpperCase()
                    : "D"}
                </div>
                <div className="doctor-card-text">
                  <h3>
                    {latestAppointment.doctor_name || "Doctor"}
                  </h3>
                  <p>{latestAppointment.specialty || "Specialist"}</p>
                </div>

                {/* Cancel button - only if not already completed/rejected/missed */}
                {latestAppointment.status !== "completed" &&
                  latestAppointment.status !== "rejected" &&
                  latestAppointment.status !== "missed" &&
                  latestAppointment.status !== "cancelled" && (
                    <button
                      className="cancel-appointment-btn"
                      onClick={() => setCancelModal(latestAppointment)}
                    >
                      Cancel Appointment
                    </button>
                  )}

                <BadgeCheck className="verify-icon" size={24} />
              </div>
            </>
          )}
        </section>

        {/* Promo Banner */}
        <section className="promo-banner-section">
          <img src={frame15} alt="Book appointment with trusted doctors" />
        </section>
      </main>

      {/* ========================= */}
      {/* LOGIN POPUP              */}
      {/* ========================= */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button
              className="create-btn"
              onClick={() => {
                navigate("/register");
                setShowPopup(false);
              }}
            >
              Create account
            </button>
            <button
              className="login-btn"
              onClick={() => {
                navigate("/login");
                setShowPopup(false);
              }}
            >
              <span>Login</span>
              <svg width="15px" height="10px" viewBox="0 0 13 10">
                <path d="M1,5 L11,5"></path>
                <polyline points="8 1 12 5 8 9"></polyline>
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* ========================= */}
      {/* CANCEL CONFIRM MODAL     */}
      {/* ========================= */}
      {cancelModal && (
        <div className="popup-overlay" onClick={() => setCancelModal(null)}>
          <div className="popup cancel-popup" onClick={(e) => e.stopPropagation()}>
            <XCircle size={40} className="cancel-icon" />
            <h3>Cancel Appointment?</h3>
            <p>Are you sure you want to cancel your appointment?</p>
            <div className="cancel-popup-actions">
              <button
                className="cancel-yes-btn"
                onClick={handleCancelAppointment}
              >
                Yes, Cancel
              </button>
              <button
                className="cancel-no-btn"
                onClick={() => setCancelModal(null)}
              >
                No, Keep It
              </button>

            </div>
          </div>
        </div>
        
      )}

      <AIChatbot />
       
    </div>
   
  );
}
