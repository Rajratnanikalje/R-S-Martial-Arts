import { useEffect, useState } from "react";
import api from "../../services/api";
import "./Trainers.css";

const UPLOADS_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

function Trainers() {
  const [trainers, setTrainers] = useState([]);

  useEffect(() => {
    const fetchTrainers = async () => {
      try {
        const { data } = await api.get("/trainers");
        setTrainers(data.trainers || []);
      } catch (error) {
        console.error("Failed to load trainers:", error);
        setTrainers([]);
      }
    };
    fetchTrainers();
  }, []);

  const photoUrl = (photo) => (photo ? `${UPLOADS_BASE}/uploads/trainers/${photo}` : "");

  return (
    <section className="trainers" id="trainers">
      <div className="trainer-container">
        <p className="section-tag">Our Trainers</p>
        <h2>Learn From Professional Coaches</h2>

        <div className="trainer-grid">
          {trainers.length > 0 ? (
            trainers.map((trainer, index) => (
              <div className="trainer-card" key={trainer._id || index}>
                <div className="trainer-image">
                  {trainer.photo ? (
                    <img src={photoUrl(trainer.photo)} alt={trainer.name} />
                  ) : (
                    <span className="trainer-placeholder">🥋</span>
                  )}
                </div>

                <div className="trainer-info">
                  <h3>{trainer.name}</h3>
                  {trainer.role && <p>{trainer.role}</p>}
                  {trainer.experience && <span>{trainer.experience}</span>}
                </div>
              </div>
            ))
          ) : (
            <p className="trainer-empty">Trainers coming soon.</p>
          )}
        </div>
      </div>
    </section>
  );
}

export default Trainers;
