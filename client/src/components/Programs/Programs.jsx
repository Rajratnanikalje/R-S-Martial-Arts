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

// Real, high-quality martial arts images (Unsplash CDN).
  // Each photo is matched to its program heading and uses a uniform 4:3 crop
  // so every card looks consistent and professional.
  const IMG = (id) =>
    `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&h=600&q=80`;

  const AI_IMGS = {
    selfDefence: IMG("photo-1599058917765-a780eda07a3e"),
    karate: IMG("photo-1603287681836-b174ce5074c2"),
    taekwondo: IMG("photo-1555597673-b21d5c935865"),
    boxing: IMG("photo-1549719386-74dfcbf7dbed"),
    mma: IMG("photo-1544022613-e87ca75a784a"),
    lathi: IMG("photo-1583473848882-f9a5bc7fd2ee"),
    nunchaku: IMG("photo-1599058917212-d750089bc07e"),
    thangta: IMG("photo-1599474924187-334a4ae5bd3c"),
    kudo: IMG("photo-1554068865-24cecd4e34b8"),
    kickboxing: IMG("photo-1562059390-a761a084768e"),
    fitness: IMG("photo-1571019613454-1cb2f99b2d8b"),
    kids: IMG("photo-1541625602330-2277a4c46182"),
    personal: IMG("photo-1517836357463-d25dfeac3438")
  };

  const rawPrograms = [
    // --- Naye Programs (Prioritized) ---
    {
      title: "Traditional Self Defence",
      desc: "Learn practical traditional techniques for real-life protection and safety.",
      icon: "🛡️",
      image: AI_IMGS.selfDefence,
      duration: "3 - 6 Months",
      level: "Beginner to Advanced",
      benefits: "Street safety, quick reflexes, threat neutralization & confidence booster."
    },
    {
      title: "Karate (Kumite + Kata)",
      desc: "Master forms (Kata) and sparring combat techniques (Kumite) in traditional Karate.",
      icon: "🥋",
      image: AI_IMGS.karate,
      duration: "6 - 12 Months",
      level: "All Levels",
      benefits: "Belt ranking, mental focus, precision striking & self-discipline."
    },
    {
      title: "Taekwondo",
      desc: "Develop high-speed kicking, agility, flexibility, and Olympic-style combat skills.",
      icon: "🥋",
      image: AI_IMGS.taekwondo,
      duration: "6 - 12 Months",
      level: "All Levels",
      benefits: "High kicks, fast footwork, core balance & explosive agility."
    },
    {
      title: "Boxing",
      desc: "Enhance footwork, head movement, stamina, and powerful striking combinations.",
      icon: "🥊",
      image: AI_IMGS.boxing,
      duration: "3 - 6 Months",
      level: "Beginner to Pro",
      benefits: "Heavy stamina, punch power, head movement & cardiovascular health."
    },
    {
      title: "Mixed Martial Arts (MMA)",
      desc: "Combine striking, grappling, and submission wrestling for total combat mastery.",
      icon: "🤼",
      image: AI_IMGS.mma,
      duration: "6 - 12 Months",
      level: "Intermediate to Advanced",
      benefits: "Full body strength, submission locks, takedowns & cage combat readiness."
    },
    {
      title: "Lathi Kathi",
      desc: "Traditional Indian stick fighting art focusing on balance, coordination, and defense.",
      icon: "🥢",
      image: AI_IMGS.lathi,
      duration: "3 - 6 Months",
      level: "All Levels",
      benefits: "Traditional weapon control, wrist flexibility & cultural martial heritage."
    },
    {
      title: "Nunchaku (Nunchuck)",
      desc: "Master weapon control, hand-eye coordination, speed, and wrist reflexes.",
      icon: "⚔️",
      image: AI_IMGS.nunchaku,
      duration: "2 - 4 Months",
      level: "Intermediate",
      benefits: "Hand-eye coordination, lightning speed & extreme focus."
    },

    // --- Baaki Purane Existing Programs ---
    {
      title: "Thang-Ta Martial Arts",
      desc: "Learn the ancient Manipuri martial art focused on weapon training and combat skills.",
      icon: "⚔️",
      image: AI_IMGS.thangta,
      duration: "6 Months",
      level: "All Levels",
      benefits: "Ancient sword & spear combat, balance, and tactical coordination."
    },
    {
      title: "Kudo",
      desc: "A modern martial art combining karate and judo techniques with practical fighting skills.",
      icon: "🥋",
      image: AI_IMGS.kudo,
      duration: "6 Months",
      level: "All Levels",
      benefits: "Full-contact combat, throws, grappling & defensive resilience."
    },
    {
      title: "Kickboxing",
      desc: "Improve your strength, stamina and striking techniques with professional training.",
      icon: "🥊",
      image: AI_IMGS.kickboxing,
      duration: "3 - 6 Months",
      level: "Beginner Friendly",
      benefits: "Weight loss, fat burn, powerful kick-punch routines & endurance."
    },
    {
      title: "Fitness Training",
      desc: "Build strength, flexibility, endurance and overall physical fitness.",
      icon: "💪",
      image: AI_IMGS.fitness,
      duration: "Flexible",
      level: "All Levels",
      benefits: "Fat burn, muscle toning, stamina building & personalized workouts."
    },
    {
      title: "Kids Martial Arts",
      desc: "Develop confidence, discipline, concentration and fitness in children.",
      icon: "🧒",
      image: AI_IMGS.kids,
      duration: "Ongoing",
      level: "Beginner (Kids)",
      benefits: "Bully prevention, focus in studies, physical energy channelization."
    },
    {
      title: "Personal Training",
      desc: "Get customized training sessions according to your fitness goals.",
      icon: "🏋️",
      image: AI_IMGS.personal,
      duration: "Customized",
      level: "1-on-1 Dedicated",
      benefits: "Personalized attention, flexible timings & fast track goal achievement."
    }
  ];

  // Map a program title to its matching Unsplash image key
  const imageKeyForTitle = (title) => {
    const t = title.toLowerCase();
    if (t.includes("self defence") || t.includes("self-defense")) return "selfDefence";
    if (t.includes("karate")) return "karate";
    if (t.includes("taekwondo")) return "taekwondo";
    if (t.includes("boxing")) return "boxing";
    if (t.includes("mma") || t.includes("mixed martial")) return "mma";
    if (t.includes("lathi")) return "lathi";
    if (t.includes("nunchaku")) return "nunchaku";
    if (t.includes("thang-ta")) return "thangta";
    if (t.includes("kudo")) return "kudo";
    if (t.includes("kickboxing")) return "kickboxing";
    if (t.includes("fitness")) return "fitness";
    if (t.includes("kids")) return "kids";
    if (t.includes("personal")) return "personal";
    return "karate";
  };

  // Resolve final image URL: uploaded filename → UPLOADS_BASE, else Unsplash fallback
  const resolveImage = (program) => {
    if (program.image) {
      if (/^https?:\/\//.test(program.image)) return program.image;
      if (/^(uploads\/|\/uploads\/)/.test(program.image)) {
        return `${UPLOADS_BASE}${program.image.startsWith("/") ? "" : "/"}${program.image}`;
      }
      return `${UPLOADS_BASE}/uploads/programs/${program.image}`;
    }
    return AI_IMGS[imageKeyForTitle(program.title)] || AI_IMGS.karate;
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
          setProgramsState(rawPrograms.map((p) => ({ ...p, image: p.image })));
        }
      })
      .catch(() => {
        setProgramsState(rawPrograms.map((p) => ({ ...p, image: p.image })));
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
                <div className="icon program-icon-fallback">{item.icon || "🥋"}</div>
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
              {/* 🟢 2. Corrected: Anchor tag ko React-Router Link se replace kiya */}
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

