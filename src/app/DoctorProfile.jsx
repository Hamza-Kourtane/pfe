import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DoctorProfile = () => {
  const [doctorId, setDoctorId] = useState('');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [msg, setMsg] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    if (!doctorId || !file) return setMsg('Provide doctor id and image');

    const fd = new FormData();
    fd.append('avatar', file);

    try {
      const res = await fetch(`http://localhost:5000/doctors/${doctorId}/avatar`, {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setMsg('Uploaded');
      // update localStorage doctor if it matches
      const stored = localStorage.getItem('doctor');
      if (stored) {
        const d = JSON.parse(stored);
        if (String(d.id) === String(doctorId)) {
          d.image = data.image;
          localStorage.setItem('doctor', JSON.stringify(d));
        }
      }
      // Optionally navigate to doctor page
      navigate('/doctorlist');
    } catch (err) {
      setMsg(err.message || 'Error');
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Poppins, Arial, sans-serif' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap');`}</style>
      <h2>Doctor Profile - Upload Image</h2>
      <form onSubmit={submit} style={{ maxWidth: 400 }}>
        <div style={{ marginBottom: 8 }}>
          <label>Doctor ID</label>
          <input value={doctorId} onChange={(e) => setDoctorId(e.target.value)} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Image</label>
          <input type="file" accept="image/*" onChange={(e) => {
            const f = e.target.files[0];
            setFile(f);
            if (f) setPreview(URL.createObjectURL(f));
          }} />
          {preview && (
            <div style={{ marginTop: 8 }}>
              <img src={preview} alt="preview" className="avatar-preview" />
            </div>
          )}
        </div>

        <button type="submit">Upload</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
};

export default DoctorProfile;
