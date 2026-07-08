import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  CalendarCheck,
  Clock,
  CalendarDays,
  LogOut,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  Stethoscope,
} from "lucide-react";
import "./DoctorDashboard.css";

const STATUS_OPTIONS = ["all", "pending", "confirmed", "completed", "cancelled"];

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("doctor");
    if (!stored) {
      navigate("/doctor-login");
      return;
    }
    setDoctor(JSON.parse(stored));
  }, [navigate]);

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

  const handleLogout = () => {
    localStorage.removeItem("doctor");
    navigate("/doctor-login");
  };

  const updateStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/appointments/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update appointment");

      setAppointments((prev) =>
        prev.map((appt) => (appt.id === id ? { ...appt, status } : appt))
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Could not update appointment.");
    }
  };

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
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <Stethoscope size={26} />
          <span>DocCare</span>
        </div>

        <div className="dashboard-doctor-card">
          <div className="dashboard-doctor-avatar">
            {doctor.name ? doctor.name.charAt(0).toUpperCase() : "D"}
          </div>
          <div>
            <p className="dashboard-doctor-name">Dr. {doctor.name}</p>
            <p className="dashboard-doctor-specialty">{doctor.specialty || "General Practitioner"}</p>
          </div>
        </div>

        <button className="dashboard-logout" onClick={handleLogout}>
          <LogOut size={18} />
          Log out
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-header">
          <div>
            <h1>Welcome back, Dr. {doctor.name?.split(" ")[0] || ""}</h1>
            <p>Here's what's happening with your appointments today.</p>
          </div>
        </header>

        {errorMessage && <div className="dashboard-error">{errorMessage}</div>}

        <section className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-icon stat-icon-blue">
              <CalendarDays size={22} />
            </div>
            <div>
              <p className="stat-value">{stats?.total ?? "—"}</p>
              <p className="stat-label">Total Appointments</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-amber">
              <Clock size={22} />
            </div>
            <div>
              <p className="stat-value">{stats?.pending ?? "—"}</p>
              <p className="stat-label">Pending Requests</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-green">
              <CalendarCheck size={22} />
            </div>
            <div>
              <p className="stat-value">{stats?.today ?? "—"}</p>
              <p className="stat-label">Today's Appointments</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon stat-icon-purple">
              <Users size={22} />
            </div>
            <div>
              <p className="stat-value">{stats?.uniquePatients ?? "—"}</p>
              <p className="stat-label">Total Patients</p>
            </div>
          </div>
        </section>

        <section className="dashboard-table-section">
          <div className="dashboard-table-toolbar">
            <h2>Appointments</h2>

            <div className="dashboard-toolbar-actions">
              <div className="dashboard-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search by patient name or email"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

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

          {isLoading ? (
            <div className="dashboard-loading">Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="dashboard-empty">
              <CalendarDays size={40} />
              <p>No appointments found.</p>
            </div>
          ) : (
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
                          {appt.status !== "confirmed" && (
                            <button
                              className="action-btn confirm"
                              title="Confirm"
                              onClick={() => updateStatus(appt.id, "confirmed")}
                            >
                              <CheckCircle2 size={16} />
                            </button>
                          )}
                          {appt.status !== "completed" && (
                            <button
                              className="action-btn complete"
                              title="Mark completed"
                              onClick={() => updateStatus(appt.id, "completed")}
                            >
                              <CalendarCheck size={16} />
                            </button>
                          )}
                          {appt.status !== "cancelled" && (
                            <button
                              className="action-btn cancel"
                              title="Cancel"
                              onClick={() => updateStatus(appt.id, "cancelled")}
                            >
                              <XCircle size={16} />
                            </button>
                          )}
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
      </main>
    </div>
  );
};

export default DoctorDashboard;
