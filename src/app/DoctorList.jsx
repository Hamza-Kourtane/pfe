import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchForm from "../components/SearchForm";
import descending from "../assets/descending.png";
import star from "../assets/star.png";
import arrow from "../assets/arrow.png";
import doctorImage1 from "../assets/online-doctor-in-a-transparent-coat-with-a-stethoscope-demonstrating-professionalism-and-care-file-no-background-online-doctor-and-medical-service-free-png.webp";
import doctorImage2 from "../assets/png-clipart-physician-doctor-of-medicine-patient-health-care-doctor-electronics-microphone.png";
import doctorImage3 from "../assets/pngtree-confident-male-doctor-smiling-and-ready-to-assist-png-image_15259346.png";
import doctorImage4 from "../assets/pngtree-young-afro-professional-doctor-png-image_13227671.png";

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
    // handled below with event stopPropagation and navigate
  };

  const seededImages = {
    'dr salma benali': doctorImage1,
    'dr karim el mansouri': doctorImage2,
    'dr leila haddad': doctorImage3,
    'dr omar ziani': doctorImage4,
    'dr sana el amrani': doctorImage1,
  };

  const getDoctorImage = (doctor) => {
    const name = `${doctor.name || ''} ${doctor.fullname || ''}`.trim().toLowerCase();
    if (doctor.image) return doctor.image;
    if (seededImages[name]) return seededImages[name];
    return doctorImage1;
  };

  const handleDoctorImageError = (event) => {
    event.currentTarget.src = doctorImage1;
  };

  console.log("SPECIALIST:", specialist);
  console.log("CITY:", city);

  useEffect(() => {
    const params = new URLSearchParams();
    if (specialist) params.set('specialist', specialist);
    if (city) params.set('location', city);

    fetch(`http://localhost:5000/doctors?${params.toString()}`)
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
              ? selectedLocation.lat && selectedLocation.lng
                ? `https://www.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&output=embed`
                : `https://www.google.com/maps?q=${encodeURIComponent(
                    selectedLocation.location || selectedLocation.clinic_address || city || ''
                  )}&output=embed`
              : `https://www.google.com/maps?q=${encodeURIComponent(city || '')}&output=embed`
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
        <span className="doctor-list-results-city">{city || 'All locations'}</span>
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
              // Navigate to details when clicking card background
              sessionStorage.setItem('selectedDoctor', JSON.stringify(doctor));
              navigate("/doctor", { state: doctor });
            }}
            

            style={{
              '--doctor-card-left': `${789 + (index % 3) * 344}px`,
              '--doctor-card-top': `${267 + Math.floor(index / 3) * 450}px`,
          }}
        >
          <div className="doctor-card-bg" />
          <div className="doctor-card-name">{doctor.fullname || doctor.name || "Doctor"}</div>
          <div className="doctor-card-frame" />
          <div className="doctor-card-specialty">{doctor.specialty || "General"} - {doctor.experience || "N/A"} exp.</div>
          <div
            className="doctor-card-book-button"
            onClick={(e) => {
              e.stopPropagation();
              // go to booking page with doctor state
              sessionStorage.setItem('selectedDoctor', JSON.stringify(doctor));
              navigate('/booking', { state: doctor });
            }}
          >
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
          <img
            className="doctor-card-image"
            src={getDoctorImage(doctor, index)}
            alt={doctor.fullname || doctor.name || 'Doctor'}
            onError={handleDoctorImageError}
            onClick={(e) => {
              // show location in side map without navigating
              e.stopPropagation();
              setSelectedLocation(doctor);
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default DoctorList;
