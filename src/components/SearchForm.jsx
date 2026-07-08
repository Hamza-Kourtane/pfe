import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SearchForm.css";

export default function SearchForm({ isLoggedIn, setShowPopup, className = "search-form" }) {
  const [specialist, setSpecialist] = useState("");
  const [location, setLocation] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setShowPopup(true);
    } else {
      navigate(`/doctorlist?specialist=${specialist}&location=${location}`);
    }
  };

  return (
    <form className={className} onSubmit={handleSubmit}>
      <div className="search-field specialist-field">
        <select
          value={specialist}
          onChange={(e) => setSpecialist(e.target.value)}
        >
          <option value="">All Specialists</option>
          <option>General Practitioner</option>
          <option>Dentist</option>
          <option>Cardiologist</option>
          <option>Dermatologist</option>
        </select>
      </div>

      <div className="search-field">
        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
      </div>

      <button type="submit" className="search-btn">
        <span>Find Doctors</span>
      </button>
    </form>
  );
}