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
import { BadgeCheck, Building2, CalendarDays, Clock3, Menu, X } from "lucide-react";
import SearchForm from "../components/SearchForm";


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
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('loggedIn'));
  const [showPopup, setShowPopup] = useState(false);
  const navigate = useNavigate();
  const [specialist, setSpecialist] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    const checkLogin = () => setIsLoggedIn(!!localStorage.getItem('loggedIn'));
    checkLogin();
    window.addEventListener('storage', checkLogin);
    return () => window.removeEventListener('storage', checkLogin);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('loggedIn');
    setIsLoggedIn(false);
    navigate('/');
  };

  return (
    <div className="home-page">
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
                if (item === "ALL DOCTORS" && isLoggedIn) navigate('/doctorlist');
                else if (item === "HOME") navigate('/');
              }}
              style={{cursor: item === "ALL DOCTORS" && isLoggedIn ? 'pointer' : 'default'}}
            >
              {item}
            </span>
          ))}
        </nav>

        <div className="header-right">
          {!isLoggedIn ? (
            <>
              <button className="create-btn" onClick={() => navigate('/register')}>Create account</button>
              <button className="login-btn" onClick={() => navigate('/login')}>
                <span>Login</span>
                <svg width="15px" height="10px" viewBox="0 0 13 10">
                  <path d="M1,5 L11,5"></path>
                  <polyline points="8 1 12 5 8 9"></polyline>
                </svg>
              </button>
            </>
          ) : (
            <button className="login-btn" onClick={() => { localStorage.removeItem('loggedIn'); setIsLoggedIn(false); navigate('/'); }}>
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
        <section className="hero-section">
          <video
            autoPlay
            muted
            playsInline
            className="hero-video"
            src={heroVideo}
          />
          <div className="hero-overlay" />

          <div className="hero-content">
            <h1>Find and Book Doctors Effortlessly</h1>
            <p className="hero-text">
              24/7 Doctor Appointments. Easy & Secure Booking
            </p>

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

       

        <section className="appointment-details-section">
          <h2>Details Appointment</h2>

          <div className="appointment-info-card">
            <div className="appointment-row">
              <div>
                <h3>09 Jan 2025</h3>
                <p>Appointment Date</p>
              </div>
              <CalendarDays className="appointment-icon" size={24} />
            </div>

            <div className="appointment-divider" />

            <div className="appointment-row">
              <div>
                <h3>13:00 PM</h3>
                <p>Appointment Time</p>
              </div>
              <Clock3 className="appointment-icon" size={24} />
            </div>

            <div className="appointment-divider" />

            <div className="appointment-row">
              <div>
                <h3>Radiant Hospital</h3>
                <p>Appointment Location</p>
              </div>
              <Building2 className="appointment-icon" size={24} />
            </div>
          </div>

          <div className="doctor-appointment-card">
            <div className="doctor-photo">DR</div>
            <div className="doctor-card-text">
              <h3>Dr. Raze Invoker</h3>
              <p>Internist Specialist</p>
            </div>
            <button className="cancel-appointment-btn">Cancel</button>
            <BadgeCheck className="verify-icon" size={24} />
          </div>
        </section>
         <section className="promo-banner-section">
          <img src={frame15} alt="Book appointment with trusted doctors" />
        </section>
      </main>

      {showPopup && (
        <div className="popup-overlay" onClick={() => setShowPopup(false)}>
          <div className="popup" onClick={(e) => e.stopPropagation()}>
            <button className="create-btn" onClick={() => { navigate('/register'); setShowPopup(false); }}>Create account</button>
            <button className="login-btn" onClick={() => { navigate('/login'); setShowPopup(false); }}>
              <span>Login</span>
              <svg width="15px" height="10px" viewBox="0 0 13 10">
                <path d="M1,5 L11,5"></path>
                <polyline points="8 1 12 5 8 9"></polyline>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
