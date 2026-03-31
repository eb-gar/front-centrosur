import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersQuestion from "./pages/client/question";
import CategoryManager from "./pages/admin/CategoryManager";
import HistoryPage from "./pages/admin/HistoryPage";
import QRPage from "./pages/qr/qr";
import AdminQuestionsAnswersPage from "./pages/admin/AdminQuestionsAnswersPage";
import { APP_ROUTES } from "./constants/appRoutes";

export default function App() {
  return (
    <Routes>
      <Route
        path={APP_ROUTES.ROOT}
        element={<Navigate to={APP_ROUTES.QR} replace />}
      />

      {/* ADMIN */}
      <Route path={APP_ROUTES.ADMIN_DASHBOARD} element={<AdminDashboard />} />
      <Route path={APP_ROUTES.ADMIN_CATEGORIES} element={<CategoryManager />} />
      <Route path={APP_ROUTES.ADMIN_HISTORY} element={<HistoryPage />} />

      <Route
        path={APP_ROUTES.ADMIN_QA}
        element={<AdminQuestionsAnswersPage hideSidebar />}
      />

      {/* CLIENT */}
      <Route path={APP_ROUTES.USER_QUESTION} element={<UsersQuestion />} />

      {/* QR */}
      <Route path={APP_ROUTES.QR} element={<QRPage />} />

      <Route path="*" element={<Navigate to={APP_ROUTES.QR} replace />} />
    </Routes>
  );
}
