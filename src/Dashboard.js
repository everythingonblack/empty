// Dashboard.jsx
import React, { useState, useRef, useEffect } from "react";
import styles from "./Dashboard.module.css";
import { useNavigate } from "react-router-dom";
import FileListComponent from "./FileListComponent";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const Dashboard = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [user, setUser] = useState({});
  const [totalFilesSentToday, setTotalFilesSentToday] = useState(0);
  const [totalFilesSentMonth, setTotalFilesSentMonth] = useState(0);
  const [totalFilesSentOverall, setTotalFilesSentOverall] = useState(0);
  const [officerPerformanceData, setOfficerPerformanceData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
    }
  }, []);

  useEffect(() => {
    const verifyTokenAndFetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      try {
        const response = await fetch(
          "https://bot.kediritechnopark.com/webhook/dashboard/psi",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok || !data[0].payload.username) {
          throw new Error("Unauthorized");
        }

        setUser(data[0].payload);

        if (data[0].payload.stats) {
          setTotalFilesSentToday(data[0].payload.stats.today);
          setTotalFilesSentMonth(data[0].payload.stats.month);
          setTotalFilesSentOverall(data[0].payload.stats.overall);
        }

        if (data[0].payload.officerPerformance) {
          setOfficerPerformanceData(data[0].payload.officerPerformance);
        }
      } catch (error) {
        console.error("Token tidak valid:", error.message);
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
    };

    verifyTokenAndFetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  const handleAddOfficer = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        "https://bot.kediritechnopark.com/webhook/add-officer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || data.success === false) {
        throw new Error(data.message || "Gagal menambahkan officer");
      }

      setSuccessMessage("Officer berhasil ditambahkan");
      setUsername("");
      setPassword("");
      setErrorMessage("");
    } catch (error) {
      setErrorMessage(error.message || "Gagal menambahkan officer");
      setSuccessMessage("");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.dashboardHeader}>
        <div className={styles.logoAndTitle}>
          <img src="/PSI.png" alt="Bot Avatar" />
          <h1 className={styles.h1}>Kawal PSI Dashboard</h1>
        </div>

        <div className={styles.dropdownContainer} ref={menuRef}>
          <span className={styles.userDisplayName}>
            {user.username || "Guest"}
          </span>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={styles.dropdownToggle}
            aria-expanded={isMenuOpen ? "true" : "false"}
            aria-haspopup="true"
          >
            <svg
              width="15"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          {isMenuOpen && (
            <div className={styles.dropdownMenu}>
              <button
                onClick={() => {
                  navigate("/profile");
                  setIsMenuOpen(false);
                }}
                className={styles.dropdownItem}
              >
                Profile
              </button>
              <button
                onClick={() => {
                  navigate("/scan");
                  setIsMenuOpen(false);
                }}
                className={styles.dropdownItem}
              >
                Scan
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className={styles.dropdownItem}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.mainContent}>
        {/* Summary Cards */}
        <div className={styles.summaryCardsContainer}>
          <div className={styles.summaryCard}>
            <h3>Hari Ini</h3>
            <p>{totalFilesSentToday.toLocaleString()}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Bulan Ini</h3>
            <p>{totalFilesSentMonth.toLocaleString()}</p>
          </div>
          <div className={styles.summaryCard}>
            <h3>Total Keseluruhan</h3>
            <p>{totalFilesSentOverall.toLocaleString()}</p>
          </div>
        </div>

        {/* Grid for Form (Admin) and Chart (Admin & Officer) */}
        <div className={styles.dashboardGrid}>
          {user.role === "admin" && (
            <div className={styles.formSection}>
              <h2>Tambah Petugas Baru</h2>
              <form onSubmit={handleAddOfficer} className={styles.form}>
                <label>
                  Username
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    required
                  />
                </label>
                <label>
                  Password
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password"
                    required
                  />
                </label>
                <button type="submit" className={styles.submitButton}>
                  Tambah Officer
                </button>
              </form>

              {successMessage && (
                <p className={styles.success}>{successMessage}</p>
              )}
              {errorMessage && <p className={styles.error}>{errorMessage}</p>}
            </div>
          )}

          <div className={styles.chartSection}>
            <h2>Grafik Pertumbuhan Anggota</h2>
            {officerPerformanceData.length > 0 ? (
              <div className={styles.chartPlaceholder}>
                📊 Grafik performa akan ditampilkan di sini
                <br />
                <small>Integrasikan dengan Recharts atau Chart.js</small>
              </div>
            ) : (
              <div className={styles.warning}>
                📋 Belum ada data performa untuk ditampilkan
              </div>
            )}
          </div>
        </div>

        {/* ✅ Tambahkan FileListComponent di sini */}
        <FileListComponent />
      </div>

      <div className={styles.footer}>
        © 2025 Kediri Technopark • Dashboard PSI
      </div>
    </div>
  );
};

export default Dashboard;
