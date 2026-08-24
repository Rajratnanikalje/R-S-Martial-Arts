import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // 👈 1. Link import kiya
import api from "../../services/api";
import "./Programs.css";

const UPLOADS_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api$/, "");

function Programs() {
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programsState, setProgramsState] = useState([]);

// Phone number for WhatsApp inquiry (Country code 91 + 10 digit number)
  const whatsappNumber = "919156914227";

  const rawPrograms = [
    // --- Naye Programs (Prioritized) ---
    {
      title: "Traditional Self Defence",
      desc: "Learn practical traditional techniques for real-life protection and safety.",
      icon: "🛡️",
      image: "",
      duration: "3 - 6 Months",
      level: "Beginner to Advanced",
      benefits: "Street safety, quick reflexes, threat neutralization & confidence booster."
    },
    {
      title: "Karate (Kumite + Kata)",
      desc: "Master forms (Kata) and sparring combat techniques (Kumite) in traditional Karate.",
      icon: "🥋",
      image: "",
      duration: "6 - 12 Months",
      level: "All Levels",
      benefits: "Belt ranking, mental focus, precision striking & self-discipline."
    },
    {
      title: "Taekwondo",
      desc: "Develop high-speed kicking, agility, flexibility, and Olympic-style combat skills.",
      icon: "🥋",
      image: "",
      duration: "6 - 12 Months",
      level: "All Levels",
      benefits: "High kicks, fast footwork, core balance & explosive agility."
    },
    {
      title: "Boxing",
      desc: "Enhance footwork, head movement, stamina, and powerful striking combinations.",
      icon: "🥊",
      image: "",
      duration: "3 - 6 Months",
      level: "Beginner to Pro",
      benefits: "Heavy stamina, punch power, head movement & cardiovascular health."
    },
    {
      title: "Mixed Martial Arts (MMA)",
      desc: "Combine striking, grappling, and submission wrestling for total combat mastery.",
      icon: "🤼",
      image: "",
      duration: "6 - 12 Months",
      level: "Intermediate to Advanced",
      benefits: "Full body strength, submission locks, takedowns & cage combat readiness."
    },
    {
      title: "Lathi Kathi",
      desc: "Traditional Indian stick fighting art focusing on balance, coordination, and defense.",
      icon: "🥢",
      image: "",
      duration: "3 - 6 Months",
      level: "All Levels",
      benefits: "Traditional weapon control, wrist flexibility & cultural martial heritage."
    },
    {
      title: "Nunchaku (Nunchuck)",
      desc: "Master weapon control, hand-eye coordination, speed, and wrist reflexes.",
      icon: "⚔️",
      image: "",
      duration: "2 - 4 Months",
      level: "Intermediate",
      benefits: "Hand-eye coordination, lightning speed & extreme focus."
    },

    // --- Baaki Purane Existing Programs ---
    {
      title: "Thang-Ta Martial Arts",
      desc: "Learn the ancient Manipuri martial art focused on weapon training and combat skills.",
      icon: "⚔️",
      image: "",
      duration: "6 Months",
      level: "All Levels",
      benefits: "Ancient sword & spear combat, balance, and tactical coordination."
    },
    {
      title: "Kudo",
      desc: "A modern martial art combining karate and judo techniques with practical fighting skills.",
      icon: "🥋",
      image: "",
      duration: "6 Months",
      level: "All Levels",
      benefits: "Full-contact combat, throws, grappling & defensive resilience."
    },
    {
      title: "Kickboxing",
      desc: "Improve your strength, stamina and striking techniques with professional training.",
      icon: "🥊",
      image: "",
      duration: "3 - 6 Months",
      level: "Beginner Friendly",
      benefits: "Weight loss, fat burn, powerful kick-punch routines & endurance."
    },
    {
      title: "Fitness Training",
      desc: "Build strength, flexibility, endurance and overall physical fitness.",
      icon: "💪",
      image: "",
      duration: "Flexible",
      level: "All Levels",
      benefits: "Fat burn, muscle toning, stamina building & personalized workouts."
    },
    {
      title: "Kids Martial Arts",
      desc: "Develop confidence, discipline, concentration and fitness in children.",
      icon: "🧒",
      image: "",
      duration: "Ongoing",
      level: "Beginner (Kids)",
      benefits: "Bully prevention, focus in studies, physical energy channelization."
    },
    {
      title: "Personal Training",
      desc: "Get customized training sessions according to your fitness goals.",
      icon: "🏋️",
      image: "",
      duration: "Customized",
      level: "1-on-1 Dedicated",
      benefits: "Personalized attention, flexible timings & fast track goal achievement."
    }
  ];

  // Resolve final image URL: uploaded filename → UPLOADS_BASE, else empty
  const resolveImage = (program) => {
    if (program.image) {
      if (/^https?:\/\//.test(program.image)) return program.image;
      if (/^(uploads\/|\/uploads\/)/.test(program.image)) {
        return `${UPLOADS_BASE}${program.image.startsWith("/") ? "" : "/"}${program.image}`;
      }
      return `${UPLOADS_BASE}/uploads/programs/${program.image}`;
    }
    return "";
  };

  // Fetch programs from CMS; fall back to built-in defaults on error/empty
  useEffect(() => {
    api
      .get("/programs")
      .then(({ data }) => {
        const list = Array.isArray(data.programs) ? data.programs : [];
        if (list.length) {
          setProgramsState(list.map((p) => ({ ...p, image: resolveImage(p) })));
        } else {
          setProgramsState(rawPrograms.map((p) => ({ ...p, image: resolveImage(p) })));
        }
      })
      .catch(() => {
        setProgramsState(rawPrograms.map((p) => ({ ...p, image: resolveImage(p) })));
      });
  }, []);

  // Logic to prevent duplicates (used for defaults)
  const defaultPrograms = Array.from(
    new Map(
      rawPrograms.map((item) => [
        item.title.toLowerCase().trim().replace(/[^a-z0-9]/g, ""),
        item
      ])
    ).values()
  );

  const programs = programsState.length ? programsState : defaultPrograms;
  const openModal = (program) => {
    setSelectedProgram(program);
  };

  const closeModal = () => {
    setSelectedProgram(null);
  };

  return (
    <section className="programs" id="programs">
      <div className="program-container">
        <p className="section-tag">Our Programs</p>
        <h2>Martial Arts & Fitness Classes</h2>

        <div className="program-grid">
          {programs.map((item, index) => (
            <div className="program-card" key={index}>
              <div className="program-image-wrap">
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="program-img"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      e.currentTarget.nextElementSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div className="icon program-icon-fallback" style={{ display: item.image ? 'none' : 'flex' }}>
                  {item.icon || "🥋"}
                </div>
              </div>

              <div className="program-card-body">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <button
                  className="card-btn"
                  onClick={() => openModal(item)}
                >
                  Learn More
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- Modal / Popup Section --- */}
      {selectedProgram && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>

            <div className="modal-header">
              <div className="modal-title-row">
                <span className="modal-icon">{selectedProgram.icon}</span>
                <h3>{selectedProgram.title}</h3>
              </div>

              {selectedProgram.image && (
                <img
                  src={selectedProgram.image}
                  alt={selectedProgram.title}
                  className="modal-program-img"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}

              <p className="modal-desc">{selectedProgram.desc}</p>
            </div>

            <div className="modal-details">
              <div className="detail-item">
                <strong>⏱️ Duration:</strong> <span>{selectedProgram.duration}</span>
              </div>
              <div className="detail-item">
                <strong>🎯 Skill Level:</strong> <span>{selectedProgram.level}</span>
              </div>
              <div className="detail-item">
                <strong>⭐ Key Benefits:</strong> <span>{selectedProgram.benefits}</span>
              </div>
            </div>

            <div className="modal-actions">
              <Link
                to="/trial"
                className="btn-trial"
                onClick={closeModal}
              >
                Book Free Trial
              </Link>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hi, I am interested in the ${selectedProgram.title} program. Please share more details.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
              >
                Inquire on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default Programs;