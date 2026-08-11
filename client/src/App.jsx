import { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import ResetPassword from "./pages/ResetPassword";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import About from "./components/About/About";
import Programs from "./components/Programs/Programs";
import Gallery from "./components/Gallery/Gallery";
import Contact from "./components/Contact/Contact";
import TrialBooking from "./components/TrialBooking/TrialBooking";
import AdminLogin from "./pages/AdminLogin";

// 🟢 Admin Layout & Pages Imports
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import TrialBookings from "./pages/TrialBookings";
import ContactMessages from "./pages/ContactMessages";
import Settings from "./pages/Settings";
import Reports from "./pages/Reports";
import TrainersManager from "./pages/TrainersManager";

// 🟢 CMS Content Manager Pages
import HeroManager from "./pages/HeroManager";
import AboutManager from "./pages/AboutManager";
import LogoManager from "./pages/LogoManager";
import ProgramsManager from "./pages/ProgramsManager";
import GalleryManager from "./pages/GalleryManager";
import TimetableManager from "./pages/TimetableManager";
import TestimonialsManager from "./pages/TestimonialsManager";
import ContactFooterManager from "./pages/ContactFooterManager";
import ActivityLogs from "./pages/ActivityLogs";
import BackupRestore from "./pages/BackupRestore";
import "./App.css";

function App() {
  const location = useLocation();

  // Check karein ki current page Admin ka toh nahi hai
  const isAdminRoute = location.pathname.startsWith("/admin") || location.pathname === "/login";
  const contentVersion = useRef(localStorage.getItem("rs-content-updated"));

  useEffect(() => {
    if (isAdminRoute) return undefined;

    const refreshPublicSite = (version) => {
      if (!version || version === contentVersion.current) return;
      contentVersion.current = version;
      window.location.reload();
    };

    const handleStorage = (event) => {
      if (event.key === "rs-content-updated") refreshPublicSite(event.newValue);
    };
    const handleFocus = () => refreshPublicSite(localStorage.getItem("rs-content-updated"));

    window.addEventListener("storage", handleStorage);
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isAdminRoute]);

  return (
    <>
      <ScrollToTop />
      {/* 🟢 Navbar saare public pages par dikhega */}
      {!isAdminRoute && <Navbar />}

      <Routes>
        {/* Public Website Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/gallery" element={<Gallery />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/trial" element={<TrialBooking />} />

        {/* Admin Login & Reset Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/reset-password/:resetToken" element={<ResetPassword />} />

        {/* 🔒 Shared Admin Layout (Isse Sidebar + Menu Button Saare Admin Pages Par Dikhega) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="trials" element={<TrialBookings />} />
          <Route path="contacts" element={<ContactMessages />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reports" element={<Reports />} />
          <Route path="trainers" element={<TrainersManager />} />
          <Route path="hero" element={<HeroManager />} />
          <Route path="about" element={<AboutManager />} />
          <Route path="logo" element={<LogoManager />} />
          <Route path="programs" element={<ProgramsManager />} />
          <Route path="galleries" element={<GalleryManager />} />
          <Route path="timetable" element={<TimetableManager />} />
<Route path="testimonials" element={<TestimonialsManager />} />
          <Route path="contact-footer" element={<ContactFooterManager />} />
          <Route path="activities" element={<ActivityLogs />} />
          <Route path="backup" element={<BackupRestore />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* 🟢 Footer saare public pages ke niche hamesha dikhega */}
      {!isAdminRoute && <Footer />}
    </>
  );
}

export default App;
