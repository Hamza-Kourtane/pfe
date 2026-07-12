import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./app/Home.jsx";
import Login from "./app/Login.jsx";
import Register from "./app/Register.jsx";
import DoctorList from "./app/DoctorList.jsx";
import DoctorDetails from "./app/DoctorDetails.jsx";
import Booking from "./app/Booking.jsx";
import DoctorProfile from "./app/DoctorProfile.jsx";
import DoctorDashboard from "./app/DoctorDashboard.jsx";
import DoctorRegister from "./app/DoctorRegister.jsx";
import Verification from "./app/Verification.jsx";

function App() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
        html, body, #root, * {
          font-family: 'Poppins', Arial, sans-serif;
        }
      `}</style>
      <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/doctorlist" element={<DoctorList />} />
        <Route path="/doctor" element={<DoctorDetails />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/doctor-profile" element={<DoctorProfile />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor-register" element={<DoctorRegister />} />
        <Route path="/doctor-verification" element={<Verification />} />
        <Route path="/doctor-login" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
    </>
  );
}

export default App;
