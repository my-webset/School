import { useState, useEffect } from "react";
import PublicHeader from "./components/public/PublicHeader";
import PublicFooter from "./components/public/PublicFooter";
import HomePage from "./components/public/HomePage";
import AdmissionPage from "./components/public/AdmissionPage";
import PublicNoticesPage from "./components/public/PublicNoticesPage";
import PublicEventsPage from "./components/public/PublicEventsPage";
import PublicGalleryPage from "./components/public/PublicGalleryPage";
import PublicAboutPage from "./components/public/PublicAboutPage";
import PublicAcademicsPage from "./components/public/PublicAcademicsPage";
import PublicFacilitiesPage from "./components/public/PublicFacilitiesPage";
import PublicContactPage from "./components/public/PublicContactPage";
import PublicFormView from "./components/public/PublicFormView";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";
import { AuthService } from "./services/authService";

type View = "public" | "adminLogin" | "adminDashboard" | "customForm";

export default function App() {
  const [view, setView] = useState<View>("public");
  const [currentPage, setCurrentPage] = useState("home");
  const [activeCustomFormId, setActiveCustomFormId] = useState<string | null>(null);

  const getFormIdFromUrl = () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      let formId = urlParams.get("formId");

      if (!formId && window.location.hash.includes("formId=")) {
        const hashQuery = window.location.hash.replace(/^#\/?\??/, "");
        const hashParams = new URLSearchParams(hashQuery);
        formId = hashParams.get("formId");
      }

      return formId;
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  // Check URL parameters for direct Form sharing (copied link / WhatsApp link)
  useEffect(() => {
    const formId = getFormIdFromUrl();

    if (formId) {
      setActiveCustomFormId(formId);
      setView("customForm");
      return;
    }

    if (view === "customForm") {
      setActiveCustomFormId(null);
      setView("public");
    }
  }, [view]);

  useEffect(() => {
    const handlePopState = () => {
      const formId = getFormIdFromUrl();
      if (formId) {
        setActiveCustomFormId(formId);
        setView("customForm");
      } else if (view === "customForm") {
        setActiveCustomFormId(null);
        setView("public");
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [view]);


  // Check existing session
  useEffect(() => {
    if (view === "adminDashboard" && !AuthService.isAuthenticated()) {
      setView("adminLogin");
    }
  }, [view]);

  // Render Admin Login
  if (view === "adminLogin") {
    return (
      <AdminLogin
        onLogin={() => setView("adminDashboard")}
        setView={(v) => setView(v as View)}
      />
    );
  }

  // Render Admin Dashboard
  if (view === "adminDashboard") {
    return (
      <div className="h-full">
        <AdminDashboard
          onLogout={() => {
            AuthService.logout();
            setView("public");
          }}
        />
      </div>
    );
  }

  // Render Stand-alone Custom Form View (from QR code or WhatsApp)
  if (view === "customForm" && activeCustomFormId) {
    return (
      <PublicFormView
        formId={activeCustomFormId}
        onBack={() => {
          const url = new URL(window.location.href);
          url.searchParams.delete("formId");
          window.history.replaceState({}, "", url.toString());
          setActiveCustomFormId(null);
          setView("public");
          setCurrentPage("home");
        }}
      />
    );
  }

  // Public website page renderer
  const renderPublicPage = () => {
    switch (currentPage) {
      case "home":
        return <HomePage setCurrentPage={setCurrentPage} />;
      case "admission":
        return <AdmissionPage setCurrentPage={setCurrentPage} />;
      case "notices":
        return <PublicNoticesPage setCurrentPage={setCurrentPage} />;
      case "events":
        return <PublicEventsPage />;
      case "gallery":
        return <PublicGalleryPage />;
      case "about":
        return <PublicAboutPage setCurrentPage={setCurrentPage} />;
      case "academics":
        return <PublicAcademicsPage setCurrentPage={setCurrentPage} />;
      case "facilities":
        return <PublicFacilitiesPage setCurrentPage={setCurrentPage} />;
      case "contact":
        return <PublicContactPage />;
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader
        currentPage={currentPage}
        setCurrentPage={(p) => {
          setCurrentPage(p);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
        setView={(v) => setView(v as View)}
      />
      <main className="flex-1">
        {renderPublicPage()}
      </main>
      <PublicFooter setCurrentPage={setCurrentPage} />
    </div>
  );
}
