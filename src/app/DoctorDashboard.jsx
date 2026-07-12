import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CalendarCheck,
  Clock,
  LogOut,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  ClipboardList,
  UserRound,
  ThumbsUp,
  ThumbsDown,
  CheckCheck,
  UserX,
  CalendarDays,
} from "lucide-react";
import logo from "../assets/logo-transparent.png";
import doctorImage1 from "../assets/online-doctor-in-a-transparent-coat-with-a-stethoscope-demonstrating-professionalism-and-care-file-no-background-online-doctor-and-medical-service-free-png.webp";
import doctorImage2 from "../assets/png-clipart-physician-doctor-of-medicine-patient-health-care-doctor-electronics-microphone.png";
import doctorImage3 from "../assets/pngtree-confident-male-doctor-smiling-and-ready-to-assist-png-image_15259346.png";
import doctorImage4 from "../assets/pngtree-young-afro-professional-doctor-png-image_13227671.png";
import "./DoctorDashboard.css";

// Possible status values for filtering
const STATUS_OPTIONS = ["all", "pending", "accepted", "completed", "rejected", "missed"];

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);

  // All appointments from backend
  const [appointments, setAppointments] = useState([]);

  // Dashboard statistics
  const [stats, setStats] = useState(null);

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // Filter and search
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Active tab: "appointments" or "patients"
  const [activeTab, setActiveTab] = useState("appointments");

  // Load doctor info from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("doctor");
    if (!stored) {
      navigate("/doctor-login");
      return;
    }
    setDoctor(JSON.parse(stored));
  }, [navigate]);

  // Fetch appointments and stats when doctor is loaded
  useEffect(() => {
    if (!doctor) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const [appointmentsRes, statsRes] = await Promise.all([
          fetch(`http://localhost:5000/appointments/doctor/${doctor.id}`),
          fetch(`http://localhost:5000/doctors/${doctor.id}/stats`),
        ]);

        const appointmentsData = await appointmentsRes.json();
        const statsData = await statsRes.json();

        if (!appointmentsRes.ok) throw new Error(appointmentsData.error || "Could not load appointments");
        if (!statsRes.ok) throw new Error(statsData.error || "Could not load stats");

        setAppointments(appointmentsData);
        setStats(statsData);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [doctor]);

  // Logout: remove doctor data and redirect to login page
  const handleLogout = () => {
    localStorage.removeItem("doctor");
    navigate("/doctor-login");
  };

  // Update appointment status via API
  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update appointment");

      // Update local state immediately
      setAppointments((prev) =>
        prev.map((appt) => (appt.id === id ? { ...appt, status } : appt))
      );

      // Also update stats by incrementing/decrementing locally
      // or we could re-fetch, but this is faster
      setStats((prev) => {
        if (!prev) return prev;
        const newStats = { ...prev };

        // Decrement old status count if we know it
        const oldAppt = appointments.find((a) => a.id === id);
        if (oldAppt) {
          const oldStatus = oldAppt.status;
          if (oldStatus === "pending") newStats.pending = Math.max(0, newStats.pending - 1);
          if (oldStatus === "accepted") newStats.accepted = Math.max(0, newStats.accepted - 1);
          if (oldStatus === "completed") newStats.completed = Math.max(0, newStats.completed - 1);
        }

        // Increment new status count
        if (status === "pending") newStats.pending = (newStats.pending || 0) + 1;
        if (status === "accepted") newStats.accepted = (newStats.accepted || 0) + 1;
        if (status === "completed") newStats.completed = (newStats.completed || 0) + 1;

        return newStats;
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not update appointment.");
    }
  };

  // Filter appointments by status and search term
  const filteredAppointments = useMemo(() => {
    return appointments.filter((appt) => {
      const matchesStatus = statusFilter === "all" || appt.status === statusFilter;
      const matchesSearch =
        !searchTerm ||
        appt.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appt.patient_email?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchTerm]);

  if (!doctor) return null;

  return (
    <div className="dashboard-page">
      {/* ========================= */}
      {/* SIDEBAR                   */}
      {/* ========================= */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <div className="dashboard-brand-logo">
            <img src={logo} alt="Doctor app logo" />
          </div>
        </div>

        {/* Doctor info card */}
        <div className="dashboard-doctor-card">
          <div className="dashboard-doctor-avatar">
            {(() => {
              const name = `${doctor.name || ''} ${doctor.fullname || ''}`.trim().toLowerCase();
              const seededImages = {
                'dr salma benali': doctorImage1,
                'dr karim el mansouri': doctorImage2,
                'dr leila haddad': doctorImage3,
                'dr omar ziani': doctorImage4,
                'dr sana el amrani': doctorImage1,
              };
              const imgSrc = doctor.image || seededImages[name] || null;

              return imgSrc ? (
                <img
                  src={imgSrc}
                  alt={doctor.name || doctor.fullname}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                />
              ) : (
                (doctor.name ? doctor.name.charAt(0).toUpperCase() : 'D')
              );
            })()}
          </div>
          <div>
            <p className="dashboard-doctor-name">Dr. {doctor.name}</p>
            <p className="dashboard-doctor-specialty">{doctor.specialty || "General Practitioner"}</p>
          </div>
        </div>

        {/* Sidebar navigation tabs */}
        <nav className="dashboard-nav">
          <button
            className={`dashboard-nav-btn ${activeTab === "appointments" ? "active" : ""}`}
            onClick={() => setActiveTab("appointments")}
          >
            <ClipboardList size={18} />
            Appointments
          </button>
          <button
            className={`dashboard-nav-btn ${activeTab === "patients" ? "active" : ""}`}
            onClick={() => setActiveTab("patients")}
          >
            <UserRound size={18} />
            Patients
          </button>
        </nav>

        {/* Logout button */}
        <button className="dashboard-logout" onClick={handleLogout}>
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      {/* ========================= */}
      {/* MAIN CONTENT             */}
      {/* ========================= */}
      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Welcome back, Dr. {doctor.name?.split(" ")[0] || ""}</h1>
            <p>Here's what's happening with your appointments today.</p>
          </div>
        </header>

        {/* Error message */}
        {errorMessage && <div className="dashboard-error">{errorMessage}</div>}

        {/* ========================= */}
        {/* STAT CARDS               */}
        {/* ========================= */}
        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">
              <Users size={22} />
            </div>
            <div>
              <p className="stat-value">{stats?.totalPatients ?? "—"}</p>
              <p className="stat-label">Total Patients</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-green">
              <CalendarCheck size={22} />
            </div>
            <div>
              <p className="stat-value">{stats?.todayAppointments ?? "—"}</p>
              <p className="stat-label">Today's Appointments</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-amber">
              <Clock size={22} />
            </div>
            <div>
              <p className="stat-value">{stats?.pending ?? "—"}</p>
              <p className="stat-label">Pending Appointments</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">
              <ThumbsUp size={22} />
            </div>
            <div>
              <p className="stat-value">{stats?.accepted ?? "—"}</p>
              <p className="stat-label">Accepted Appointments</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-green">
              <CheckCheck size={22} />
            </div>
            <div>
              <p className="stat-value">{stats?.completed ?? "—"}</p>
              <p className="stat-label">Completed Appointments</p>
            </div>
          </div>
        </section>

        {/* ========================= */}
        {/* APPOINTMENTS TABLE VIEW  */}
        {/* ========================= */}
        {activeTab === "appointments" && (
          <section className="dashboard-table-section">
            <div className="dashboard-table-toolbar">
              <h2>Appointments</h2>

              <div className="dashboard-toolbar-actions">
                {/* Search by patient name or email */}
                <div className="dashboard-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search by patient name or email"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Status filter chips */}
                <div className="dashboard-filters">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status}
                      className={`filter-chip ${statusFilter === status ? "active" : ""}`}
                      onClick={() => setStatusFilter(status)}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Loading state */}
            {isLoading ? (
              <div className="dashboard-loading">Loading appointments...</div>
            ) : filteredAppointments.length === 0 ? (
              /* Empty state */
              <div className="dashboard-empty">
                <CalendarDays size={40} />
                <p>No appointments found.</p>
              </div>
            ) : (
              /* Appointments table */
              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Contact</th>
                      <th>Date &amp; Time</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((appt) => (
                      <tr key={appt.id}>
                        <td>
                          <div className="patient-cell">
                            <div className="patient-avatar">
                              {appt.patient_name?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <span>{appt.patient_name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="contact-cell">
                            <span>{appt.patient_email}</span>
                            {appt.patient_phone && <span className="contact-phone">{appt.patient_phone}</span>}
                          </div>
                        </td>
                        <td>
                          <div className="datetime-cell">
                            <span>{new Date(appt.appointment_date).toLocaleDateString()}</span>
                            <span className="time-text">{appt.appointment_time}</span>
                          </div>
                        </td>
                        <td className="reason-cell">{appt.reason || "—"}</td>
                        <td>
                          <span className={`status-badge status-${appt.status}`}>{appt.status}</span>
                        </td>
                        <td>
                          <div className="action-buttons">
                            {/* Accept button (only if not already accepted) */}
                            {appt.status !== "accepted" && appt.status !== "completed" && appt.status !== "rejected" && appt.status !== "missed" && (
                              <button
                                className="action-btn accept"
                                title="Accept"
                                onClick={() => updateStatus(appt.id, "accepted")}
                              >
                                <ThumbsUp size={16} />
                              </button>
                            )}
                            {/* Reject button */}
                            {appt.status !== "rejected" && appt.status !== "completed" && appt.status !== "missed" && (
                              <button
                                className="action-btn reject"
                                title="Reject"
                                onClick={() => updateStatus(appt.id, "rejected")}
                              >
                                <ThumbsDown size={16} />
                              </button>
                            )}
                            {/* Complete button */}
                            {appt.status !== "completed" && appt.status !== "rejected" && appt.status !== "missed" && (
                              <button
                                className="action-btn complete"
                                title="Mark completed"
                                onClick={() => updateStatus(appt.id, "completed")}
                              >
                                <CheckCheck size={16} />
                              </button>
                            )}
                            {/* Patient Did Not Attend (missed) */}
                            {appt.status !== "missed" && appt.status !== "completed" && appt.status !== "rejected" && (
                              <button
                                className="action-btn missed"
                                title="Patient did not attend"
                                onClick={() => updateStatus(appt.id, "missed")}
                              >
                                <UserX size={16} />
                              </button>
                            )}
                            {/* Reset to pending */}
                            {appt.status !== "pending" && (
                              <button
                                className="action-btn reset"
                                title="Reset to pending"
                                onClick={() => updateStatus(appt.id, "pending")}
                              >
                                <RotateCcw size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ========================= */}
        {/* PATIENTS CARD VIEW       */}
        {/* ========================= */}
        {activeTab === "patients" && (
          <section className="dashboard-patients-section">
            <h2>All Patients</h2>

            {isLoading ? (
              <div className="dashboard-loading">Loading patients...</div>
            ) : appointments.length === 0 ? (
              <div className="dashboard-empty">
                <Users size={40} />
                <p>No patients yet.</p>
              </div>
            ) : (
              <div className="patients-grid">
                {appointments.map((appt) => (
                  <div className="patient-card" key={appt.id}>
                    {/* Card header with patient info */}
                    <div className="patient-card-header">
                      <div className="patient-card-avatar">
                        {appt.patient_name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="patient-card-info">
                        <h3>{appt.patient_name}</h3>
                        <span className={`status-badge status-${appt.status}`}>{appt.status}</span>
                      </div>
                    </div>

                    {/* Appointment details */}
                    <div className="patient-card-details">
                      <div className="patient-card-row">
                        <CalendarDays size={16} />
                        <span>{new Date(appt.appointment_date).toLocaleDateString()}</span>
                      </div>
                      <div className="patient-card-row">
                        <Clock size={16} />
                        <span>{appt.appointment_time}</span>
                      </div>
                      {appt.reason && (
                        <div className="patient-card-reason">
                          <p><strong>Reason:</strong> {appt.reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="patient-card-actions">
                      {appt.status !== "accepted" && appt.status !== "completed" && appt.status !== "rejected" && appt.status !== "missed" && (
                        <button
                          className="patient-action accept"
                          onClick={() => updateStatus(appt.id, "accepted")}
                        >
                          <CheckCircle2 size={16} /> Accept
                        </button>
                      )}
                      {appt.status !== "rejected" && appt.status !== "completed" && appt.status !== "missed" && (
                        <button
                          className="patient-action reject"
                          onClick={() => updateStatus(appt.id, "rejected")}
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      )}
                      {appt.status !== "completed" && appt.status !== "rejected" && appt.status !== "missed" && (
                        <button
                          className="patient-action complete"
                          onClick={() => updateStatus(appt.id, "completed")}
                        >
                          <CheckCheck size={16} /> Complete
                        </button>
                      )}
                      {appt.status !== "missed" && appt.status !== "completed" && appt.status !== "rejected" && (
                        <button
                          className="patient-action missed"
                          onClick={() => updateStatus(appt.id, "missed")}
                        >
                          <UserX size={16} /> Did Not Attend
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default DoctorDashboard;
