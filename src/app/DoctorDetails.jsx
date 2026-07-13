import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// Import icons from lucide-react
import {
  MapPin,
  Star,
  Phone,
  Clock,
  GraduationCap,
  CheckCircle2,
  X,
  Calendar,
  Loader2,
} from "lucide-react";
import doctorImage1 from "../assets/online-doctor-in-a-transparent-coat-with-a-stethoscope-demonstrating-professionalism-and-care-file-no-background-online-doctor-and-medical-service-free-png.webp";
import doctorImage2 from "../assets/png-clipart-physician-doctor-of-medicine-patient-health-care-doctor-electronics-microphone.png";
import doctorImage3 from "../assets/pngtree-confident-male-doctor-smiling-and-ready-to-assist-png-image_15259346.png";
import doctorImage4 from "../assets/pngtree-young-afro-professional-doctor-png-image_13227671.png";

import "./DoctorDetails.css";

// Available appointment times
const TIME_SLOTS = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
];

const DoctorDetails = () => {
  // Get information from the current page
  const location = useLocation();

  // Used to navigate between pages
  const navigate = useNavigate();

  // Doctor data sent from DoctorList page
  let doctor = location.state;

  // If user refreshes page, location.state may disappear
  // So try getting doctor data from sessionStorage
  if (!doctor) {
    const stored = sessionStorage.getItem("selectedDoctor");

    if (stored) {
      doctor = JSON.parse(stored);
    }
  }

  // Accept `fullname` sent from other components
  if (doctor && !doctor.name && doctor.fullname) {
    doctor.name = doctor.fullname;
  }

  // Controls whether booking modal is open or closed
  const [showModal, setShowModal] = useState(false);

  // Toggle showing map when clicking doctor's image
  const [showMap, setShowMap] = useState(false);

  // Selected appointment date
  const [selectedDate, setSelectedDate] = useState("");

  // Selected appointment time
  const [selectedTime, setSelectedTime] = useState("");

  // Form data
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
  });

  // Loading state while sending appointment
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Error message
  const [errorMessage, setErrorMessage] = useState("");

  // Validation errors per field
  const [fieldErrors, setFieldErrors] = useState({});

  // Stores success information after booking
  const [successInfo, setSuccessInfo] = useState(null);

  // If no doctor data exists
  if (!doctor || !(doctor.name || doctor.fullname)) {
    return (
      <div className="doctor-details-page">
        <div
          className="doctor-details-back-text"
          onClick={() => navigate(-1)}
        >
          ← Back to doctor list
        </div>

        <div className="doctor-details-empty">
          <h2>No doctor selected</h2>

          <p>Please select a doctor from the list first.</p>

          <button
            className="book-appointment-button"
            onClick={() => navigate("/doctorlist")}
          >
            Go to Doctor List
          </button>
        </div>
      </div>
    );
  }

  // Today's date (used as minimum booking date)
  const today = new Date().toISOString().split("T")[0];

  // Update form fields when user types
  const handleChange = (e) => {
    setForm({
      ...form, // keep old values
      [e.target.name]: e.target.value, // update current field
    });
  };

  // Validate all form fields for booking
  const validateForm = () => {
    const errors = {};

    // Date must be selected, match YYYY-MM-DD format, and not be in the past
    if (!selectedDate) {
      errors.date = "Please select a date.";
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(selectedDate)) {
      errors.date = "Please enter a valid date (numbers only).";
    } else if (isNaN(Date.parse(selectedDate))) {
      errors.date = "Please enter a valid date.";
    } else if (selectedDate < today) {
      errors.date = "Date cannot be in the past.";
    }

    // Time must be selected
    if (!selectedTime) {
      errors.time = "Please select a time slot.";
    }

    // Name: letters only, at least 2 characters
    const nameTrimmed = form.name.trim();
    if (!nameTrimmed) {
      errors.name = "Full name is required.";
    } else if (nameTrimmed.length < 2) {
      errors.name = "Name must be at least 2 characters.";
    } else if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(nameTrimmed)) {
      errors.name = "Name should only contain letters.";
    }

    // Email: valid format
    if (!form.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }

    // Phone: digits only if provided, 10-15 digits
    const phoneTrimmed = form.phone.trim();
    if (phoneTrimmed && !/^\d+$/.test(phoneTrimmed)) {
      errors.phone = "Phone should only contain digits.";
    } else if (phoneTrimmed && (phoneTrimmed.length < 10 || phoneTrimmed.length > 15)) {
      errors.phone = "Phone must be between 10 and 15 digits.";
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

  // Open booking modal
  const openModal = () => {
    // Clear previous messages
    setErrorMessage("");
    setSuccessInfo(null);
    setFieldErrors({});

    // Reset form
    setSelectedDate("");
    setSelectedTime("");

    setForm({
      name: "",
      email: "",
      phone: "",
      reason: "",
    });

    setShowModal(true);
  };

  // Close booking modal
  const closeModal = () => {
    // Prevent closing while request is being sent
    if (isSubmitting) return;

    setShowModal(false);
  };

  // Submit appointment booking
  const handleSubmit = async (e) => {
    e.preventDefault(); // stop page refresh

    setErrorMessage("");

    // Run validation before submitting
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      // Send booking to backend
      const response = await fetch(
        "http://localhost:5000/appointments",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            doctor_id: doctor.id,
            patient_name: form.name,
            patient_email: form.email,
            patient_phone: form.phone,
            date: selectedDate,
            time: selectedTime,
            reason: form.reason,
          }),
        }
      );

      const data = await response.json();

      // Backend returned error
      if (!response.ok) {
        throw new Error(
          data.error || "Could not book the appointment."
        );
      }

      // Save success info
      setSuccessInfo({
        date: selectedDate,
        time: selectedTime,
        doctorName: doctor.name,
      });
    } catch (error) {
      setErrorMessage(
        error.message ||
          "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const seededImages = {
    'dr salma benali': doctorImage1,
    'dr karim el mansouri': doctorImage2,
    'dr leila haddad': doctorImage3,
    'dr omar ziani': doctorImage4,
    'dr sana el amrani': doctorImage1,
  };

  const getDoctorImage = () => {
    const name = `${doctor.name || ''} ${doctor.fullname || ''}`.trim().toLowerCase();
    if (doctor.image) return doctor.image;
    if (seededImages[name]) return seededImages[name];
    return doctorImage1;
  };

  const handleDoctorImageError = (event) => {
    event.currentTarget.src = doctorImage1;
  };

  // Convert rating to number
  const rating = Number(doctor.rating) || 0;

  return (
    <div className="doctor-details-page">

      {/* Back Button */}
      <div
        className="doctor-details-back-text"
        onClick={() => navigate(-1)}
      >
        ← Back to doctor list
      </div>

      {/* Doctor Information Section */}
      <div className="doctor-details-container">

        {/* Doctor Image */}
        <div className="doctor-details-image">

          <img
            src={getDoctorImage()}
            alt={doctor.name || doctor.fullname}
            onError={handleDoctorImageError}
            onClick={() => setShowMap((s) => !s)}
            style={{ cursor: 'pointer' }}
          />

          {/* Available Badge */}
          <div className="doctor-availability-badge">
            <CheckCircle2 size={16} />
            Available for booking
          </div>

          {/* Small embedded map when image clicked */}
          {showMap && (
            <div className="doctor-map" style={{ marginTop: 12 }}>
              <iframe
                title="doctor-location"
                src={
                  doctor.lat && doctor.lng
                    ? `https://www.google.com/maps?q=${doctor.lat},${doctor.lng}&output=embed`
                    : `https://www.google.com/maps?q=${encodeURIComponent(
                        doctor.location || ''
                      )}&output=embed`
                }
                width="100%"
                height="200"
                style={{ border: 0 }}
              />
            </div>
          )}
          
        </div>

        {/* Doctor Details */}
        <div className="doctor-details-info">

          {/* Specialty Tag */}
          <span className="doctor-details-specialty-tag">
            {doctor.specialty ||
              doctor.specialist ||
              "General Practitioner"}
          </span>

          {/* Doctor Name */}
          <h2>{doctor.name}</h2>

          {/* Rating Stars */}
          <div className="doctor-details-rating">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={18}
                className={
                  i < Math.round(rating)
                    ? "star filled"
                    : "star"
                }
              />
            ))}

            <span className="rating-value">
              {rating ? rating.toFixed(1) : "New"}
            </span>
          </div>

          {/* Doctor Information Grid */}
          <div className="doctor-details-grid">

            {/* Location */}
            <div className="detail-item">
              <MapPin size={20} />

              <div>
                <span className="detail-label">
                  Location
                </span>

                <span className="detail-value">
                  {doctor.location || "Not specified"}
                </span>
              </div>
            </div>

            {/* Experience */}
            <div className="detail-item">
              <GraduationCap size={20} />

              <div>
                <span className="detail-label">
                  Experience
                </span>

                <span className="detail-value">
                  {doctor.experience || "—"} years
                </span>
              </div>
            </div>

            {/* Contact */}
            <div className="detail-item">
              <Phone size={20} />

              <div>
                <span className="detail-label">
                  Contact
                </span>

                <span className="detail-value">
                  {doctor.contact || "Not provided"}
                </span>
              </div>
            </div>

            {/* Working Hours */}
            <div className="detail-item">
              <Clock size={20} />

              <div>
                <span className="detail-label">
                  Hours
                </span>

                <span className="detail-value">
                  9:00 AM – 5:00 PM
                </span>
              </div>
            </div>
          </div>

          {/* Doctor Biography */}
          {doctor.bio && (
            <p className="doctor-bio">
              {doctor.bio}
            </p>
          )}

          {/* Book Appointment Button */}
          <button
            className="book-appointment-button"
            onClick={() => navigate('/booking', { state: doctor })}
          >
            <Calendar size={18} />
            Book Appointment
          </button>
        </div>
      </div>

    {/* Show modal only when showModal = true */}
{showModal && (

  /* Dark background behind popup */
  <div className="modal-overlay" onClick={closeModal}>

    {/* Actual popup card */}
    {/* stopPropagation prevents modal from closing when clicking inside it */}
    <div
      className="modal-card"
      onClick={(e) => e.stopPropagation()}
    >

      {/* X button to close popup */}
      <button
        className="modal-close"
        onClick={closeModal}
        aria-label="Close"
      >
        <X size={20} />
      </button>

      {/* If booking was successful */}
      {successInfo ? (

        <div className="modal-success">

          {/* Success icon */}
          <CheckCircle2
            size={56}
            className="success-icon"
          />

          <h3>Appointment Requested!</h3>

          {/* Show booking information */}
          <p>
            Your appointment with{" "}
            <strong>{successInfo.doctorName}</strong>
            {" "}on{" "}
            <strong>{successInfo.date}</strong>
            {" "}at{" "}
            <strong>{successInfo.time}</strong>
            {" "}has been sent. You'll receive a confirmation soon.
          </p>

          {/* Close success message */}
          <button
            className="book-appointment-button"
            onClick={closeModal}
          >
            Done
          </button>

        </div>

      ) : (

        <>
          {/* Doctor name in booking modal */}
          <h3 className="modal-title">
            Book with {doctor.name}
          </h3>

          {/* Doctor specialty and location */}
          <p className="modal-subtitle">
            {doctor.specialty ||
              doctor.specialist ||
              "General Practitioner"}
            {" • "}
            {doctor.location}
          </p>

          {/* Booking form */}
          <form
            className="booking-form"
            onSubmit={handleSubmit}
          >

            {/* Date input */}
            <div className="form-row">
              <label htmlFor="date">
                Date
              </label>

              <input
                id="date"
                type="date"

                /* Prevent selecting dates before today */
                min={today}

                value={selectedDate}

                /* Save selected date in state */
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  clearFieldError("date");
                }}

                className={fieldErrors.date ? "input-error" : ""}
                required
              />
              {fieldErrors.date && <span className="field-error">{fieldErrors.date}</span>}
            </div>

            {/* Time slots section */}
            <div className="form-row">

              <label htmlFor="time">
                Time slot
              </label>

              <select
                id="time"
                value={selectedTime}
                onChange={(e) => {
                  setSelectedTime(e.target.value);
                  clearFieldError("time");
                }}
                className={fieldErrors.time ? "input-error" : ""}
                required
              >
                <option value="">
                  -- Select a time --
                </option>

                {/* Create options from TIME_SLOTS array */}
                {TIME_SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
              {fieldErrors.time && <span className="field-error">{fieldErrors.time}</span>}

            </div>

            {/* Patient name */}
            <div className="form-row">

              <label htmlFor="name">
                Full name
              </label>

              <input
                id="name"

                name="name"

                type="text"

                placeholder="Your full name"

                value={form.name}

                /* Update form state */
                onChange={(e) => {
                  handleChange(e);
                  clearFieldError("name");
                }}

                className={fieldErrors.name ? "input-error" : ""}
                required
              />
              {fieldErrors.name && <span className="field-error">{fieldErrors.name}</span>}

            </div>

            {/* Email + Phone */}
            <div className="form-row form-row-split">

              {/* Email */}
              <div>

                <label htmlFor="email">
                  Email
                </label>

                <input
                  id="email"

                  name="email"

                  type="email"

                  placeholder="you@example.com"

                  value={form.email}

                  onChange={(e) => {
                    handleChange(e);
                    clearFieldError("email");
                  }}

                  className={fieldErrors.email ? "input-error" : ""}
                  required
                />
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}

              </div>

              {/* Phone */}
              <div>

                <label htmlFor="phone">
                  Phone
                </label>

                <input
                  id="phone"

                  name="phone"

                  type="tel"

                  placeholder="Optional"

                  value={form.phone}

                  onChange={(e) => {
                    handleChange(e);
                    clearFieldError("phone");
                  }}

                  className={fieldErrors.phone ? "input-error" : ""}
                />
                {fieldErrors.phone && <span className="field-error">{fieldErrors.phone}</span>}

              </div>

            </div>

            {/* Reason for visit */}
            <div className="form-row">

              <label htmlFor="reason">
                Reason for visit (optional)
              </label>

              <textarea
                id="reason"

                name="reason"

                placeholder="Briefly describe your symptoms or reason for visit"

                value={form.reason}

                onChange={handleChange}

                rows={3}
              />

            </div>

            {/* Show error message if something is wrong */}
            {errorMessage && (
              <p className="form-error">
                {errorMessage}
              </p>
            )}

            {/* Submit button */}
            <button
              type="submit"

              className="book-appointment-button"

              disabled={isSubmitting}
            >

              {/* While sending request */}
              {isSubmitting ? (

                <>
                  <Loader2
                    size={18}
                    className="spin"
                  />

                  {" "}Booking...
                </>

              ) : (

                /* Normal state */
                "Confirm Booking"

              )}

            </button>

          </form>

        </>
      )}

    </div>

  </div>
)}
    </div>
  );
};
export default DoctorDetails;