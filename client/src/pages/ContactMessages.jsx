import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./AdminDashboard.css";

function ContactMessages() {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All"); // Default tab All rahega
  const [loading, setLoading] = useState(true);

  // Modal State for Convert to Trial
  const [selectedContact, setSelectedContact] = useState(null);
  const [trialProgram, setTrialProgram] = useState("MMA");
  const [trialAge, setTrialAge] = useState("");
  const [trialStatus, setTrialStatus] = useState("Pending");

  // Fetch Contact Messages
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/admin/login");
          return;
        }

        const response = await api.get("/contact", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setContacts(response.data.contacts || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching contacts:", error);
        localStorage.removeItem("token");
        navigate("/admin/login");
      }
    };

    fetchContacts();
  }, [navigate]);

  // Counts Calculation for Tabs (All, Pending, Converted)
  const normalizeStatus = (status) =>
    (status || "New").toString().trim().toLowerCase();
  const isPendingStatus = (status) =>
    status === "pending" || status === "new";

  const normalizedContacts = contacts.map((c) => ({
    ...c,
    normalizedStatus: normalizeStatus(c.status),
  }));
  const pendingContacts = normalizedContacts.filter((c) =>
    isPendingStatus(c.normalizedStatus)
  );
  const convertedContacts = normalizedContacts.filter(
    (c) => c.normalizedStatus === "converted"
  );

  // Update Contact Status (Internal function for conversion)
  const updateContactStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");

      await api.put(
        `/contact/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setContacts((prev) =>
        prev.map((contact) =>
          contact._id === id ? { ...contact, status } : contact
        )
      );
    } catch (error) {
      console.error(error);
    }
  };

  // Open Modal to Convert Contact
  const openConvertModal = (contact) => {
    setSelectedContact(contact);
    setTrialProgram("MMA");
    setTrialAge(contact.age || 18);
    setTrialStatus(contact.status || "Pending");
  };

  // Confirm Convert to Trial Booking
  const handleConvertToTrialSubmit = async (e) => {
    e.preventDefault();
    if (!selectedContact) return;

    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const res = await api.post(
        "/trials",
        {
          name: selectedContact.name,
          email: selectedContact.email || `${selectedContact.phone}@noemail.com`,
          phone: selectedContact.phone,
          program: trialProgram,
          age: Number(trialAge),
          message: selectedContact.message || "",
          status: trialStatus,
        },
        config
      );

      if (res.data) {
        await updateContactStatus(selectedContact._id, "Converted");
        alert("Successfully converted to Trial Booking! 🎉");
        setSelectedContact(null);
      }
    } catch (error) {
      console.error("Conversion Error:", error.response?.data || error);
      alert(
        error.response?.data?.message || "Failed to convert contact to trial."
      );
    }
  };

  // Delete Contact Message
  const deleteContact = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this contact message?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/contact/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setContacts((prev) => prev.filter((c) => c._id !== id));
      alert("Contact message deleted successfully");
    } catch (error) {
      console.error(error);
      alert("Failed to delete contact message");
    }
  };

  // Filtered Contacts based on Search and Active Tab (All, Pending, Converted)
  const filteredContacts = contacts.filter((contact) => {
    const query = search.toLowerCase();
    const matchesSearch =
      (contact.name && contact.name.toLowerCase().includes(query)) ||
      (contact.email && contact.email.toLowerCase().includes(query)) ||
      (contact.phone && contact.phone.includes(query)) ||
      (contact.message && contact.message.toLowerCase().includes(query));

    const currentStatus = normalizeStatus(contact.status);
    const activeStatus = activeTab.toString().trim().toLowerCase();

    const matchesTab = activeStatus === "all"
      ? true
      : activeStatus === "pending"
      ? isPendingStatus(currentStatus)
      : currentStatus === activeStatus;

    return matchesSearch && matchesTab;
  });

  if (loading) {
    return (
      <div className="admin-loading-state">
        <h2>Loading Contact Messages... ⏳</h2>
      </div>
    );
  }

  return (
<div className="admin-dashboard-content">
      <div className="section-box">
        {/* Top Row: Search Bar & Heading */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
          <input
            type="text"
            placeholder="Search by Name, Phone, Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", width: "300px", maxWidth: "100%" }}
          />

          <h2 style={{ margin: 0 }}>Messages Inbox ({filteredContacts.length})</h2>
        </div>

        {/* Tabs Navigation (All, Pending, Converted) */}
        <div className="status-tabs" style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
          <button 
            onClick={() => setActiveTab("All")} 
            style={{ padding: "10px 18px", background: activeTab === "All" ? "#000" : "#eee", color: activeTab === "All" ? "#fff" : "#000", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
          >
            All ({contacts.length})
          </button>

          <button 
            onClick={() => setActiveTab("Pending")} 
            style={{ padding: "10px 18px", background: activeTab === "Pending" ? "#ffc107" : "#eee", color: "#000", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
          >
            Pending ⏳ ({pendingContacts.length})
          </button>

          <button 
            onClick={() => setActiveTab("Converted")} 
            style={{ padding: "10px 18px", background: activeTab === "Converted" ? "#6f42c1" : "#eee", color: activeTab === "Converted" ? "#fff" : "#000", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold", fontSize: "14px" }}
          >
            Converted 🚀 ({convertedContacts.length})
          </button>
        </div>

        <div className="contacts-grid">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => {
              return (
                <div className="booking-card" key={contact._id}>
                  <div className="booking-card-content">
                    <h3>{contact.name}</h3>
                    <p>
                      <strong>Email:</strong> {contact.email || "N/A"}
                    </p>
                    <p>
                      <strong>Phone:</strong> {contact.phone}
                    </p>
                    <p>
                      <strong>Message:</strong> {contact.message || "No message provided."}
                    </p>
                  </div>

                  <div className="action-buttons">
                    <a
                      href={`tel:${contact.phone}`}
                      className="call-btn"
                      title="Direct Call"
                    >
                      📞 Call
                    </a>

                    <button
                      className="whatsapp-btn"
                      onClick={() => {
                        const cleanPhone = contact.phone.replace(/[^0-9]/g, "");
                        const phoneNum =
                          cleanPhone.length === 10
                            ? `91${cleanPhone}`
                            : cleanPhone;
                        const msg = `Hi ${contact.name}, regarding your query on RS MARTIAL ARTS SQUAD: "${contact.message || ''}"`;
                        window.open(
                          `https://wa.me/${phoneNum}?text=${encodeURIComponent(
                            msg
                          )}`,
                          "_blank"
                        );
                      }}
                      title="WhatsApp Chat"
                    >
                      💬 WhatsApp
                    </button>

                    <button
                      className="convert-btn"
                      onClick={() => openConvertModal(contact)}
                      title="Convert this query into a Trial Booking"
                    >
                      🚀 Convert to Trial
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => deleteContact(contact._id)}
                      title="Delete Message"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="no-data-msg">No contact messages found for this tab.</p>
          )}
        </div>
      </div>

      {/* Styled Convert to Trial Modal Popup */}
      {selectedContact && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000,
          padding: "15px"
        }}>
          <div style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "14px",
            width: "100%",
            maxWidth: "450px",
            boxShadow: "0 15px 35px rgba(0,0,0,0.2)",
            animation: "fadeInModal 0.3s ease-in-out"
          }}>
            <h3 style={{ margin: "0 0 8px 0", color: "#111", fontSize: "22px", fontWeight: "700" }}>
              🚀 Convert to Trial Booking
            </h3>
            <p style={{ margin: "0 0 20px 0", color: "#555", fontSize: "14px", borderBottom: "1px solid #eee", paddingBottom: "12px" }}>
              Client: <strong style={{ color: "#000" }}>{selectedContact.name}</strong> ({selectedContact.phone})
            </p>

            <form onSubmit={handleConvertToTrialSubmit}>
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px", color: "#333" }}>
                  Select Program:
                </label>
                <select
                  value={trialProgram}
                  onChange={(e) => setTrialProgram(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "15px", background: "#f9f9f9", outline: "none" }}
                >
                  <option value="MMA">MMA</option>
                  <option value="Karate">Karate</option>
                  <option value="Kickboxing">Kickboxing</option>
                  <option value="Self Defense">Self Defense</option>
                  <option value="Fitness Conditioning">Fitness Conditioning</option>
                </select>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px", color: "#333" }}>
                  Age:
                </label>
                <input
                  type="number"
                  value={trialAge}
                  onChange={(e) => setTrialAge(e.target.value)}
                  required
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "15px", background: "#f9f9f9", outline: "none" }}
                  placeholder="Enter Age"
                />
              </div>

              <div style={{ marginBottom: "24px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "14px", color: "#333" }}>
                  Trial Status:
                </label>
                <select
                  value={trialStatus}
                  onChange={(e) => setTrialStatus(e.target.value)}
                  style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid #ccc", fontSize: "15px", background: "#f9f9f9", outline: "none" }}
                >
                  <option value="Pending">Pending ⏳</option>
                  <option value="Contacted">Contacted 📞</option>
                  <option value="Confirmed">Confirmed ✅</option>
                  <option value="Cancelled">Cancelled ❌</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                <button
                  type="button"
                  onClick={() => setSelectedContact(null)}
                  style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #ccc", background: "#f1f1f1", color: "#333", fontWeight: "600", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: "10px 20px", borderRadius: "8px", border: "none", background: "#6f42c1", color: "#fff", fontWeight: "600", cursor: "pointer", boxShadow: "0 4px 12px rgba(111, 66, 193, 0.3)" }}
                >
                  Confirm & Convert 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ContactMessages;
