import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchForm from "../components/SearchForm";
import descending from "../assets/descending.png";
import star from "../assets/star.png";
import arrow from "../assets/arrow.png";

import './DoctorList.css';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [isAscending, setIsAscending] = useState(true);
  const params = new URLSearchParams(location.search);
  const specialist = params.get("specialist");
  const city = params.get("location");
  const [selectedLocation, setSelectedLocation] = useState(null);
  const handleBook = (doctorId) => {
    console.log('Book doctor:', doctorId);
    // Here you can add navigation to booking page or show a modal
  };
  console.log("SPECIALIST:", specialist);
  console.log("CITY:", city);

  useEffect(() => {
    fetch(`http://localhost:5000/doctors?specialist=${specialist}&location=${city}`)
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch((err) => console.log(err));
  }, [specialist, city]);
  console.log(doctors);
  
  //order doctors by rating
  const sortedDoctors = [...doctors].sort((a, b) => {
    if (isAscending) {
      return a.rating - b.rating;
    } else {
      return b.rating - a.rating;
    }
  });
  return (
    <div className="doctor-list-page">
       <div className="doctor-list-back-text" onClick={() => navigate('/')}>Back to homepage</div>
      <img className="doctor-list-back-icon" src={arrow} onClick={() => navigate('/')} />
      <div className="doctor-list-side-image">
        <iframe
          title="map"
          src={
            selectedLocation
              ? `https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&output=embed`
              : `https://www.google.com/maps?q=${city}&output=embed`
          }
          width="100%"
          height="100%"
          style={{ border: 0 }}
        />
      </div>
       <SearchForm 
                isLoggedIn={true} 
         className="doctor-search"
       />           
      <div className="doctor-list-results">
        <span className="doctor-list-results-count">{doctors.length} Results in </span>
        <span className="doctor-list-results-city">Agadir</span>
      </div>
      <div 
          className="doctor-list-sort"
          onClick={() => setIsAscending(!isAscending)}
          style={{ cursor: "pointer" }}
      >
          <span className="doctor-list-sort-label">Sort by:</span>

          <span className="doctor-list-sort-value">
           Rating 
          </span>

         <img 
            className={`doctor-list-sort-icon ${!isAscending ? "rotate" : ""}`}
            src={descending}
          />
      </div>
        

      {sortedDoctors.map((doctor, index) => (
        <div
            key={doctor.id}
            className="doctor-card"
            onClick={() => {
              setSelectedLocation(doctor);
              // Store doctor data in sessionStorage as backup
              sessionStorage.setItem('selectedDoctor', JSON.stringify(doctor));
              navigate("/doctor", { state: doctor });
            }}
            

            style={{
              '--doctor-card-left': `${789 + (index % 3) * 344}px`,
              '--doctor-card-top': `${267 + Math.floor(index / 3) * 450}px`,
          }}
        >
          <div className="doctor-card-bg" />
          <div className="doctor-card-name">{doctor.name}</div>
          <div className="doctor-card-frame" />
          <div className="doctor-card-specialty">{doctor.specialty} - {doctor.experience} exp.</div>
          <div className="doctor-card-book-button" onClick={() => handleBook(doctor.id)}>
            <div className="doctor-card-book-text">Book</div>
          </div>
          {/* Rating stars - dynamic based on doctor rating */}
          {[...Array(5)].map((_, i) => (
            <img
              key={i}
              className="doctor-card-star"
              style={{ 
                '--doctor-card-star-left': `${18 + i * 34}px`,
                opacity: i < (doctor.rating || 0) ? 1 : 0.1
              }}
              src={star}
            />
          ))}
          <img className="doctor-card-image" src={doctor.image} />
        </div>
      ))}
    </div>
  );
};

export default DoctorList;
