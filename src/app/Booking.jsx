import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Booking.css';

const Booking = () => {
  const location = useLocation();
  const navigate = useNavigate();
  let doctor = location.state;

  if (!doctor) {
    const stored = sessionStorage.getItem('selectedDoctor');
    if (stored) doctor = JSON.parse(stored);
  }

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [patient, setPatient] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctor || !doctor.id) return setStatusMsg('No doctor selected.');
    if (!date || !time) return setStatusMsg('Please choose date and time.');

    setIsLoading(true);
    setStatusMsg('');

    try {
      const res = await fetch('http://localhost:5000/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: doctor.id,
          patient_id: patient?.id || null,
          patient_name: name || patient?.fullname || 'Patient',
          patient_email: email || patient?.email,
          patient_phone: '',
          date,
          time,
          reason: message,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Booking failed');

      setStatusMsg('Booking confirmed. Redirecting...');
      setTimeout(() => navigate('/doctorlist'), 900);
    } catch (err) {
      setStatusMsg(err.message || 'Booking failed');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setPatient(parsed);
      setName((prev) => prev || parsed.fullname || '');
      setEmail((prev) => prev || parsed.email || '');
    }
  }, []);

  if (!doctor) {
    return (
      <div className="book-page">
        <div className="booking-empty">
          <span className="booking-empty-icon">⚕</span>
          <h3>No doctor selected</h3>
          <p>Please select a doctor from the list first.</p>
          <button className="booking-btn booking-btn-secondary" onClick={() => navigate('/doctorlist')}>
            Browse doctors
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="book-page">
      <div className="book-shell">
        <div className="book-main">
          <div className="booking-header">
            <div>
              <span className="eyebrow">Appointment Desk</span>
              <h1>Confirm your visit</h1>
              <p className="booking-subtitle">
                Book your consultation with {doctor.name || doctor.fullname} and reserve your time slot instantly.
              </p>
            </div>
            <div className="doctor-block">
              <div className="doctor-avatar">
                {(doctor.name || doctor.fullname || 'Dr').split(' ').map((word) => word[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="doctor-meta">
                <span className="eyebrow">Doctor</span>
                <h2>{doctor.name || doctor.fullname}</h2>
                <span className="doctor-specialty">{doctor.specialty || doctor.specialist || 'General Practice'}</span>
              </div>
            </div>
          </div>

          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="field-block">
              <label htmlFor="date">Appointment date</label>
              <input
                id="date"
                type="date"
                className="booking-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="field-block">
              <label htmlFor="time">Appointment time</label>
              <input
                id="time"
                type="text"
                className="booking-input"
                placeholder="09:30 AM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>

            <div className="field-row">
              <div className="field-block">
                <label htmlFor="name">Your name</label>
                <input
                  id="name"
                  type="text"
                  className="booking-input"
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="field-block">
                <label htmlFor="email">Your email</label>
                <input
                  id="email"
                  type="email"
                  className="booking-input"
                  placeholder="jane@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="field-block">
              <label htmlFor="message">Reason for visit</label>
              <textarea
                id="message"
                className="booking-input booking-textarea"
                placeholder="Describe your symptoms"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {statusMsg && (
              <p className={`booking-form-status ${statusMsg.includes('Booking confirmed') ? 'success' : 'error'}`}>
                {statusMsg}
              </p>
            )}

            <button type="submit" className="booking-btn booking-btn-primary" disabled={isLoading}>
              {isLoading ? 'Booking...' : 'Confirm Booking'}
            </button>
          </form>
        </div>

        <aside className="ticket">
          <div className="ticket-top">
            <div>
              <span className="ticket-eyebrow">Appointment ticket</span>
              <h3>Reservation summary</h3>
            </div>
            <span className={`ticket-status ${date && time ? 'ready' : ''}`}>
              {date && time ? 'Ready' : 'Draft'}
            </span>
          </div>
          <div className="ticket-body">
            <div className="ticket-row">
              <span className="ticket-label">Doctor</span>
              <span className="ticket-value">{doctor.name || doctor.fullname}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">Date</span>
              <span className="ticket-value mono">{date || '— — —'}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">Time</span>
              <span className="ticket-value mono">{time || '— — —'}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">Patient</span>
              <span className="ticket-value">{name || '— — —'}</span>
            </div>
            <div className="ticket-row">
              <span className="ticket-label">Notes</span>
              <span className="ticket-value">{message ? message.slice(0, 30) + (message.length > 30 ? '...' : '') : 'No reason provided'}</span>
            </div>
          </div>
          <div className="ticket-perforation" aria-hidden="true" />
          <div className="ticket-footer">
            <span className="ticket-code mono">{doctor.id ? String(doctor.id).padStart(4, '0') : '0000'}-{date ? date.replaceAll('-', '') : '000000'}</span>
            <span className="ticket-note">Show this at reception</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Booking;
