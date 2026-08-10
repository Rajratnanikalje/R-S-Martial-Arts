import React, { useEffect, useState, useRef } from "react";
import api from "../services/api";
import "./Reports.css";

function Reports() {
  const [trials, setTrials] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [contactStatusFilter, setContactStatusFilter] = useState("All");

  // New: Date Range Filter State ("All", "Last7Days", "ThisMonth", "Custom")
  const [dateFilter, setDateFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // New: Pagination States
  const [trialPage, setTrialPage] = useState(1);
  const [contactPage, setContactPage] = useState(1);
  const rowsPerPage = 5;

  // Refs for scrolling to sections
  const trialsSectionRef = useRef(null);
  const contactsSectionRef = useRef(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const trialRes = await api.get("/admin/trials", config);
        const contactRes = await api.get("/admin/contacts", config);

        setTrials(trialRes.data.trials || []);
        setContacts(contactRes.data.contacts || []);
      } catch (err) {
        console.error("Error fetching reports:", err);
        setError("Failed to load report data. Please check server connection.");
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  // Filtered Arrays for Trials based on status
  const pendingTrials = trials.filter((t) => t.status === "Pending");
  const contactedTrials = trials.filter((t) => t.status === "Contacted");
  const confirmedTrials = trials.filter((t) => t.status === "Confirmed");
  const completedTrials = trials.filter((t) => t.status === "Completed");
  const cancelledTrials = trials.filter((t) => t.status === "Cancelled");

  // Filtered Arrays for Contacts based on status (Pending, Converted, and All excluding converted if needed, or total count)
  const pendingContacts = contacts.filter((c) => c.status === "Pending" || !c.status);
  const convertedContacts = contacts.filter((c) => c.status === "Converted");

  // Percentage Calculations for Visual Analytics
  const totalTrials = trials.length;
  const pendingPercent = totalTrials ? Math.round((pendingTrials.length / totalTrials) * 100) : 0;
  const contactedPercent = totalTrials ? Math.round((contactedTrials.length / totalTrials) * 100) : 0;
  const completedPercent = totalTrials ? Math.round((completedTrials.length / totalTrials) * 100) : 0;

  // Helper function for Date Filtering
  const checkDateRange = (itemDateString) => {
    if (dateFilter === "All") return true;
    if (!itemDateString) return false;

    const itemDate = new Date(itemDateString);
    const now = new Date();

    if (dateFilter === "Last7Days") {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      return itemDate >= sevenDaysAgo && itemDate <= now;
    }

    if (dateFilter === "ThisMonth") {
      return (
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getFullYear() === now.getFullYear()
      );
    }

    if (dateFilter === "Custom" && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include end date fully
      return itemDate >= start && itemDate <= end;
    }

    return true;
  };

  // Search & Filter Logic for Trials Table
  const filteredTrials = trials.filter((item) => {
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    const name = item.name ? item.name.toLowerCase() : "";
    const phone = item.phone || item.mobile || "";
    const matchesSearch = name.includes(searchTerm.toLowerCase()) || phone.includes(searchTerm);
    const matchesDate = checkDateRange(item.createdAt);

    return matchesStatus && matchesSearch && matchesDate;
  });

  // Search & Filter Logic for Contacts Table (Strict Tab Isolation: All, Pending, Converted)
  const filteredContacts = contacts.filter((item) => {
    let matchesStatus = true;
    const currentStatus = item.status || "Pending";

    if (contactStatusFilter === "All") {
      matchesStatus = currentStatus !== "Converted"; // All mein converted hide rahenge taaki sirf active queries dikhein
    } else if (contactStatusFilter === "Pending") {
      matchesStatus = currentStatus === "Pending";
    } else if (contactStatusFilter === "Converted") {
      matchesStatus = currentStatus === "Converted";
    }

    const name = item.name ? item.name.toLowerCase() : "";
    const phone = item.phone || "";
    const email = item.email ? item.email.toLowerCase() : "";
    const search = contactSearch.toLowerCase();
    const matchesSearch = name.includes(search) || phone.includes(search) || email.includes(search);
    const matchesDate = checkDateRange(item.createdAt);

    return matchesStatus && matchesSearch && matchesDate;
  });

  // Pagination Logic
  const totalTrialPages = Math.ceil(filteredTrials.length / rowsPerPage) || 1;
  const paginatedTrials = filteredTrials.slice((trialPage - 1) * rowsPerPage, trialPage * rowsPerPage);

  const totalContactPages = Math.ceil(filteredContacts.length / rowsPerPage) || 1;
  const paginatedContacts = filteredContacts.slice((contactPage - 1) * rowsPerPage, contactPage * rowsPerPage);

  // Scroll Functions
  const scrollToTrials = (status) => {
    setStatusFilter(status);
    if (trialsSectionRef.current) {
      trialsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToContacts = (status = "All") => {
    setContactStatusFilter(status);
    if (contactsSectionRef.current) {
      contactsSectionRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Delete Contact Message Function
  const deleteContact = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this contact message?");
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");
      await api.delete(`/admin/contacts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setContacts((prev) => prev.filter((item) => item._id !== id));
      alert("Contact message deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete contact message.");
    }
  };

  // Export Data to CSV Function
  const exportToCSV = () => {
    if (filteredTrials.length === 0) {
      alert("No trial data available to export!");
      return;
    }

    const headers = ["S.No,Name,Phone,Program,Status,Date\n"];
    const rows = filteredTrials.map((item, index) => {
      const name = `"${item.name || "N/A"}"`;
      const phone = `"${item.phone || item.mobile || "N/A"}"`;
      const program = `"${item.program || "General Trial"}"`;
      const status = `"${item.status || "Pending"}"`;
      const date = `"${item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently"}"`;
      return `${index + 1},${name},${phone},${program},${status},${date}\n`;
    });

    const blob = new Blob([headers.concat(rows)], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Academy_Trials_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="admin-loading" style={{ textAlign: "center", padding: "100px", color: "#333" }}>
        <h2>Loading Reports & Analytics... ⏳</h2>
      </div>
    );
  }

  return (
    <div className="reports-page">
      <div className="reports-container">
{error && <p className="error-msg">{error}</p>}

        {/* Global Date Range Filter Bar */}
        <div className="date-filter-bar">
          <span style={{ fontWeight: "bold", fontSize: "0.9rem" }}>📅 Date Filter:</span>
          <select 
            value={dateFilter} 
            onChange={(e) => {
              setDateFilter(e.target.value);
              setTrialPage(1);
              setContactPage(1);
            }} 
            className="date-select"
          >
            <option value="All">All Time</option>
            <option value="Last7Days">Last 7 Days</option>
            <option value="ThisMonth">This Month</option>
            <option value="Custom">Custom Date Range</option>
          </select>

          {dateFilter === "Custom" && (
            <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                className="date-input" 
              />
              <span>to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                className="date-input" 
              />
            </div>
          )}
        </div>

        {/* Visual Progress / Analytics Section */}
        <div className="analytics-section">
          <h3>Conversion Rate Analytics</h3>
          <div className="progress-group">
            <div className="progress-info">
              <span>Pending ({pendingTrials.length})</span>
              <span>{pendingPercent}%</span>
            </div>
            <div className="progress-bar">
              <div className="fill pending-fill" style={{ width: `${pendingPercent}%` }}></div>
            </div>
          </div>
          <div className="progress-group">
            <div className="progress-info">
              <span>Contacted ({contactedTrials.length})</span>
              <span>{contactedPercent}%</span>
            </div>
            <div className="progress-bar">
              <div className="fill contacted-fill" style={{ width: `${contactedPercent}%` }}></div>
            </div>
          </div>
          <div className="progress-group">
            <div className="progress-info">
              <span>Completed / Converted ({completedTrials.length})</span>
              <span>{completedPercent}%</span>
            </div>
            <div className="progress-bar">
              <div className="fill completed-fill" style={{ width: `${completedPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Trials Table Section */}
        <div className="reports-table-section" ref={trialsSectionRef}>
          {/* Top Summary Cards for Trials */}
          <div className="reports-grid" style={{ marginBottom: "20px" }}>
            <div className="report-card" onClick={() => scrollToTrials("All")} style={{ cursor: "pointer" }}>
              <h2>{trials.length}</h2>
              <p>Total Trials</p>
            </div>
            <div className="report-card pending" onClick={() => scrollToTrials("Pending")} style={{ cursor: "pointer" }}>
              <h2>{pendingTrials.length}</h2>
              <p>Pending Trials</p>
            </div>
            <div className="report-card contacted" onClick={() => scrollToTrials("Contacted")} style={{ cursor: "pointer" }}>
              <h2>{contactedTrials.length}</h2>
              <p>Contacted Trials</p>
            </div>
            <div className="report-card confirmed" onClick={() => scrollToTrials("Confirmed")} style={{ cursor: "pointer", borderTopColor: "#28a745" }}>
              <h2>{confirmedTrials.length}</h2>
              <p>Confirmed Trials</p>
            </div>
            <div className="report-card completed" onClick={() => scrollToTrials("Completed")} style={{ cursor: "pointer" }}>
              <h2>{completedTrials.length}</h2>
              <p>Completed Trials</p>
            </div>
            <div className="report-card cancelled" onClick={() => scrollToTrials("Cancelled")} style={{ cursor: "pointer", borderTopColor: "#dc3545" }}>
              <h2>{cancelledTrials.length}</h2>
              <p>Cancelled Trials</p>
            </div>
          </div>

          <div className="table-controls">
            <h3>Trial Bookings Details ({filteredTrials.length})</h3>
            <div className="filter-wrapper">
              <input
                type="text"
                placeholder="🔎 Search by Name or Phone..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setTrialPage(1);
                }}
                className="search-input"
              />
            </div>
          </div>

          {/* Trial Filter Buttons */}
          <div className="filter-buttons-container">
            <button onClick={() => { setStatusFilter("All"); setTrialPage(1); }} className={`filter-btn ${statusFilter === "All" ? "active-all" : ""}`}>
              All ({trials.length})
            </button>
            <button onClick={() => { setStatusFilter("Pending"); setTrialPage(1); }} className={`filter-btn ${statusFilter === "Pending" ? "active-pending" : ""}`}>
              Pending ⏳ ({pendingTrials.length})
            </button>
            <button onClick={() => { setStatusFilter("Contacted"); setTrialPage(1); }} className={`filter-btn ${statusFilter === "Contacted" ? "active-contacted" : ""}`}>
              Contacted 📞 ({contactedTrials.length})
            </button>
            <button onClick={() => { setStatusFilter("Confirmed"); setTrialPage(1); }} className={`filter-btn ${statusFilter === "Confirmed" ? "active-confirmed" : ""}`}>
              Confirmed ✅ ({confirmedTrials.length})
            </button>
            <button onClick={() => { setStatusFilter("Completed"); setTrialPage(1); }} className={`filter-btn ${statusFilter === "Completed" ? "active-completed" : ""}`}>
              Completed 🏁 ({completedTrials.length})
            </button>
            <button onClick={() => { setStatusFilter("Cancelled"); setTrialPage(1); }} className={`filter-btn ${statusFilter === "Cancelled" ? "active-cancelled" : ""}`}>
              Cancelled ❌ ({cancelledTrials.length})
            </button>
          </div>

          <div className="table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Phone & Quick Actions</th>
                  <th>Program</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedTrials.length > 0 ? (
                  paginatedTrials.map((item, index) => {
                    const phoneNum = item.phone || item.mobile || "";
                    const serialNumber = (trialPage - 1) * rowsPerPage + index + 1;
                    return (
                      <tr key={item._id || index}>
                        <td>{serialNumber}</td>
                        <td><strong>{item.name || "N/A"}</strong></td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span>{phoneNum || "N/A"}</span>
                            {phoneNum && (
                              <div className="quick-action-icons">
                                <a href={`tel:${phoneNum}`} title="Direct Call" className="action-icon call-icon">📞</a>
                                <a href={`https://wa.me/${phoneNum.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" title="WhatsApp Chat" className="action-icon wa-icon">💬</a>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{item.program || item.course || "General Trial"}</td>
                        <td>
                          <span className={`status-badge ${(item.status || "pending").toLowerCase()}`}>
                            {item.status || "Pending"}
                          </span>
                        </td>
                        <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently"}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">No trial records match your search/filter criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls for Trials */}
          {totalTrialPages > 1 && (
            <div className="pagination-container">
              <button disabled={trialPage === 1} onClick={() => setTrialPage((p) => p - 1)} className="pagination-btn">⬅️ Prev</button>
              <span>Page {trialPage} of {totalTrialPages}</span>
              <button disabled={trialPage === totalTrialPages} onClick={() => setTrialPage((p) => p + 1)} className="pagination-btn">Next ➡️</button>
            </div>
          )}
        </div>

        {/* Contact Messages Table Section */}
        <div className="reports-table-section" ref={contactsSectionRef}>
          {/* Top Summary Cards for Contacts - Updated with unique class name for contact section grid */}
          <div className="contact-reports-grid" style={{ marginBottom: "20px" }}>
            <div className="report-card" onClick={() => scrollToContacts("All")} style={{ cursor: "pointer" }}>
              <h2>{contacts.filter(c => (c.status || "Pending") !== "Converted").length}</h2>
              <p>Total Queries</p>
            </div>
            <div className="report-card pending" onClick={() => scrollToContacts("Pending")} style={{ cursor: "pointer" }}>
              <h2>{pendingContacts.length}</h2>
              <p>Pending Queries</p>
            </div>
            <div className="report-card completed" onClick={() => scrollToContacts("Converted")} style={{ cursor: "pointer" }}>
              <h2>{convertedContacts.length}</h2>
              <p>Converted Queries</p>
            </div>
          </div>

          <div className="table-controls">
            <h3>Recent Contact Messages ({filteredContacts.length})</h3>
            <div className="filter-wrapper">
              <input
                type="text"
                placeholder="🔎 Search Messages..."
                value={contactSearch}
                onChange={(e) => {
                  setContactSearch(e.target.value);
                  setContactPage(1);
                }}
                className="search-input"
              />
            </div>
          </div>

          {/* Contact Filter Buttons: Strict Tab Isolation */}
          <div className="filter-buttons-container">
            <button onClick={() => { setContactStatusFilter("All"); setContactPage(1); }} className={`filter-btn ${contactStatusFilter === "All" ? "active-all" : ""}`}>
              All ({contacts.filter(c => (c.status || "Pending") !== "Converted").length})
            </button>
            <button onClick={() => { setContactStatusFilter("Pending"); setContactPage(1); }} className={`filter-btn ${contactStatusFilter === "Pending" ? "active-pending" : ""}`}>
              Pending ⏳ ({pendingContacts.length})
            </button>
            <button onClick={() => { setContactStatusFilter("Converted"); setContactPage(1); }} className={`filter-btn ${contactStatusFilter === "Converted" ? "active-completed" : ""}`}>
              Converted ✅ ({convertedContacts.length})
            </button>
          </div>

          <div className="table-wrapper">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Name</th>
                  <th>Contact Info & Actions</th>
                  <th>Message</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="no-print">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedContacts.length > 0 ? (
                  paginatedContacts.map((item, index) => {
                    const serialNumber = (contactPage - 1) * rowsPerPage + index + 1;
                    return (
                      <tr key={item._id || index}>
                        <td>{serialNumber}</td>
                        <td><strong>{item.name || "Visitor"}</strong></td>
                        <td>
                          {item.phone && (
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                              <span>📞 {item.phone}</span>
                              <div className="quick-action-icons">
                                <a href={`tel:${item.phone}`} title="Direct Call" className="action-icon call-icon">📞</a>
                                <a href={`https://wa.me/${item.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" title="WhatsApp Chat" className="action-icon wa-icon">💬</a>
                              </div>
                            </div>
                          )}
                          {item.email && <div style={{ fontSize: "0.85em", color: "#666" }}>✉️ {item.email}</div>}
                        </td>
                        <td className="msg-cell" title={item.message}>{item.message || "No message"}</td>
                        <td>
                          <span className={`status-badge ${(item.status || "pending").toLowerCase()}`}>
                            {item.status || "Pending"}
                          </span>
                        </td>
                        <td>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recently"}</td>
                        <td className="no-print">
                          <button className="btn-delete" onClick={() => deleteContact(item._id)} title="Delete Message">
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="no-data">No contact messages found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls for Contacts */}
          {totalContactPages > 1 && (
            <div className="pagination-container">
              <button disabled={contactPage === 1} onClick={() => setContactPage((p) => p - 1)} className="pagination-btn">⬅️ Prev</button>
              <span>Page {contactPage} of {totalContactPages}</span>
              <button disabled={contactPage === totalContactPages} onClick={() => setContactPage((p) => p + 1)} className="pagination-btn">Next ➡️</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;
