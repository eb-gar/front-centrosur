import React from "react";
import { LayoutDashboard, Tags, History, NotebookPen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { APP_ROUTES } from "../constants/appRoutes";

export default function AdminSidebar({ activeItem, showQaMenu = false }) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="brand">
        <h2>Admin Evento</h2>
        <span>SESIÓN EN VIVO</span>
      </div>

      <nav className="nav-menu">
        <button
          className={activeItem === "panel" ? "active" : ""}
          onClick={() => navigate(APP_ROUTES.ADMIN_DASHBOARD)}
          type="button"
        >
          <LayoutDashboard size={20} /> Panel de preguntas
        </button>
        <button
          className={activeItem === "categorias" ? "active" : ""}
          onClick={() => navigate(APP_ROUTES.ADMIN_CATEGORIES)}
          type="button"
        >
          <Tags size={20} /> Categorías
        </button>
        <button
          className={activeItem === "historial" ? "active" : ""}
          onClick={() => navigate(APP_ROUTES.ADMIN_HISTORY)}
          type="button"
        >
          <History size={20} /> Historial
        </button>
      </nav>
    </aside>
  );
}
