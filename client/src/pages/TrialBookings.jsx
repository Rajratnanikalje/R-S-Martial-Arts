import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminDashboard.css";

function TrialBookings() {
  const navigate = useNavigate();
  const [trials, setTrials] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");

  // Fetch Trials
  useEffect(() => {
    const fetchTrials = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await api.get(
          "/admin/trials",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setTrials(response.data.trials || []);
      } catch (error) {
        console.error("Error fetching trials:", error);
      }
    };

    fetchTrials();
  }, [navigate]);

  // Counts Calculation
  const pendingTrials = trials.filter((trial) => trial.status === "Pending");
  const contactedTrials = trials.filter((trial) => trial.status === "Contacted");
  const confirmedTrials = trials.filter((trial) => trial.status === "Confirmed");
  const completedTrials = trials.filter((trial) => trial.status === "Completed");
  const cancelledTrials = trials.filter((trial) => trial.status === "Cancelled");

  // Handle Status Update (Pending -> Contacted / Confirmed / Cancelled)
  const handleStatusChange = async (id, newStatus) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/admin/trials/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTrials((prev) =>
        prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
      );
      alert(`Status updated to ${newStatus}`);
    } catch (error) {
      console.error(error);
      alert("Failed to update status");
    }
  };

  // Delete Trial Booking
  const deleteTrial = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this trial?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/admin/trials/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setTrials((prev) => prev.filter((t) => t._id !== id));
      alert("Trial booking deleted successfully!");
    } catch (error) {
      console.error("Delete Error:", error);
      alert("Failed to delete trial");
    }
  };

  // Filter Search & Active Tab
  const filteredTrials = trials.filter((trial) => {
    const query = search.toLowerCase();
    const matchesSearch =
      (trial.name && trial.name.toLowerCase().includes(query)) ||
      (trial.phone && trial.phone.includes(query)) ||
      (trial.program && trial.program.toLowerCase().includes(query));

    const matchesTab = activeTab === "All" || trial.status === activeTab;

    return matchesSearch && matchesTab;
  });

return (
    <>
      <div className="section-box">
        {/* 🌟 Top Row: Left side Search Bar & Right side Heading */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
          <input
            type="text"
            placeholder="Search by Name, Phone, Program..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", width: "300px", maxWidth: "100%" }}
          />
          
          <h2 style={{ margin: 0 }}>Trial Bookings ({filteredTrials.length})</h2>
        </div>

        {/* 🌟 Tabs Navigation System */}
        <div className="status-tabs" style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
          <button 
            onClick={() => setActiveTab("All")} 
            style={{ padding: "8px 15px", background: activeTab === "All" ? "#000" : "#eee", color: activeTab === "All" ? "#fff" : "#000", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            All ({trials.length})
          </button>
          <button 
            onClick={() => setActiveTab("Pending")} 
            style={{ padding: "8px 15px", background: activeTab === "Pending" ? "#ffc107" : "#eee", color: "#000", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            Pending ⏳ ({pendingTrials.length})
          </button>
          <button 
            onClick={() => setActiveTab("Contacted")} 
            style={{ padding: "8px 15px", background: activeTab === "Contacted" ? "#17a2b8" : "#eee", color: activeTab === "Contacted" ? "#fff" : "#000", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            Contacted 📞 ({contactedTrials.length})
          </button>
          <button 
            onClick={() => setActiveTab("Confirmed")} 
            style={{ padding: "8px 15px", background: activeTab === "Confirmed" ? "#28a745" : "#eee", color: activeTab === "Confirmed" ? "#fff" : "#000", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            Confirmed ✅ ({confirmedTrials.length})
          </button>
          <button 
            onClick={() => setActiveTab("Completed")} 
            style={{ padding: "8px 15px", background: activeTab === "Completed" ? "#6c757d" : "#eee", color: activeTab === "Completed" ? "#fff" : "#000", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            Completed 🏁 ({completedTrials.length})
          </button>
          <button 
            onClick={() => setActiveTab("Cancelled")} 
            style={{ padding: "8px 15px", background: activeTab === "Cancelled" ? "#dc3545" : "#eee", color: activeTab === "Cancelled" ? "#fff" : "#000", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}
          >
            Cancelled ❌ ({cancelledTrials.length})
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Phone</th>
                <th>Program</th>
                <th>Age</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTrials.length > 0 ? (
                filteredTrials.map((trial) => (
                  <tr key={trial._id}>
                    <td><strong>{trial.name}</strong></td>
                    <td>{trial.phone}</td>
                    <td>{trial.program || "N/A"}</td>
                    <td>{trial.age || "N/A"}</td>

                    {/* Status Change Dropdown */}
                    <td>
                      <select
                        value={trial.status || "Pending"}
                        onChange={(e) => handleStatusChange(trial._id, e.target.value)}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontWeight: "bold",
                          backgroundColor:
                            trial.status === "Confirmed"
                              ? "#d4edda"
                              : trial.status === "Contacted"
                              ? "#cce5ff"
                              : trial.status === "Cancelled"
                              ? "#f8d7da"
                              : trial.status === "Completed"
                              ? "#e2f0d9"
                              : "#fff3cd",
                        }}
                      >
                        <option value="Pending">Pending ⏳</option>
                        <option value="Contacted">Contacted 📞</option>
                        <option value="Confirmed">Confirmed ✅</option>
                        <option value="Completed">Completed 🏁</option>
                        <option value="Cancelled">Cancelled ❌</option>
                      </select>
                    </td>

                    {/* Action Buttons */}
                    <td>
                      <div style={{ display: "flex", gap: "6px" }}>
                        <a href={`tel:${trial.phone}`} className="call-btn" style={{ textDecoration: "none", padding: "4px 8px", backgroundColor: "#007bff", color: "#fff", borderRadius: "4px", fontSize: "0.85rem" }}>
                          📞 Call
                        </a>

                        <button
                          onClick={() => {
                            const cleanPhone = trial.phone.replace(/[^0-9]/g, "");
                            const phoneNum = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
                            const msg = `Hi ${trial.name}, regarding your free trial booking for ${trial.program || "Martial Arts"}...`;
                            window.open(`https://wa.me/${phoneNum}?text=${encodeURIComponent(msg)}`, "_blank");
                          }}
                          style={{ padding: "4px 8px", backgroundColor: "#25D366", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}
                        >
                          💬 WhatsApp
                        </button>

                        <button
                          onClick={() => deleteTrial(trial._id)}
                          style={{ padding: "4px 8px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", fontSize: "0.85rem" }}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
                    No trial bookings found for this tab.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default TrialBookings;
