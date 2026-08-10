import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ContentManagers.css";

function BackupRestore() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const [message, setMessage] = useState({ type: "", text: "" });
  const [backupData, setBackupData] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!token) { navigate("/admin/login"); return; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const showMsg = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleBackup = async () => {
    try {
      const { data } = await api.get("/system/backup", authHeaders);
      setBackupData(data);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      showMsg("success", `Backup exported (${Object.keys(data.data || {}).length} collections).`);
    } catch (err) {
      showMsg("error", err.response?.data?.message || "Backup failed.");
    }
  };

  const handleRestoreFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (!parsed.data || typeof parsed.data !== "object") {
          showMsg("error", "Invalid backup file: missing 'data' object.");
          return;
        }
        setRestoring(true);
        const { data } = await api.post("/system/restore", { data: parsed.data }, authHeaders);
        showMsg("success", data.message || "Backup restored successfully!");
        setBackupData(parsed);
      } catch (err) {
        showMsg("error", err.response?.data?.message || "Restore failed. Invalid file.");
      } finally {
        setRestoring(false);
        if (fileRef.current) fileRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const collectionCounts = backupData?.data
    ? Object.keys(backupData.data).map((k) => ({ name: k, count: backupData.data[k]?.length || 0 }))
    : [];

  return (
<div className="cm-page">
      {message.text && <div className={`cm-alert ${message.type}`}>{message.text}</div>}

      <div className="cm-card">
        <h3>📤 Backup Database</h3>
        <p className="cm-hint">Download a full JSON backup of every collection (trials, contacts, trainers, CMS content, settings, activity logs).</p>
        <button className="cm-btn cm-btn-primary" onClick={handleBackup}>📥 Download Full Backup</button>
      </div>

      <div className="cm-card">
        <h3>📥 Restore Database</h3>
        <p className="cm-hint">Upload a previously downloaded backup JSON file to restore all collections. This will overwrite existing data.</p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          <input ref={fileRef} type="file" accept="application/json,.json" onChange={handleRestoreFile} className="cm-file-input" style={{ flex: 1, minWidth: 220, padding: 10, border: "1px dashed #bbb", borderRadius: 8, background: "#fafbfc" }} />
          {restoring && <span className="cm-hint">⏳ Restoring...</span>}
        </div>
      </div>

      {collectionCounts.length > 0 && (
        <div className="cm-card">
          <h3>📋 Backup Contents</h3>
          <div className="cm-table-wrap">
            <table className="cm-table">
              <thead>
                <tr><th>Collection</th><th>Records</th></tr>
              </thead>
              <tbody>
                {collectionCounts.map((c) => (
                  <tr key={c.name}>
                    <td>{c.name}</td>
                    <td>{c.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default BackupRestore;
