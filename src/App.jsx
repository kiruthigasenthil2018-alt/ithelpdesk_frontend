import React from "react";
import { Link, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./auth.jsx";
import Layout from "./components/Layout.jsx";
import Admin from "./pages/Admin.jsx";
import Analytics from "./pages/Analytics.jsx";
import AuthPage from "./pages/Auth.jsx";
import Catalog from "./pages/Catalog.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import IncidentDetail from "./pages/IncidentDetail.jsx";
import Help from "./pages/Help.jsx";
import Incidents from "./pages/Incidents.jsx";
import { KnowledgeArticle, KnowledgeHome } from "./pages/Knowledge.jsx";

const NotFound = () => (
  <div className="notice"><h3>Page not found</h3><p>That page does not exist.</p><Link className="btn dark" to="/">Go home</Link></div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/incidents" element={<Incidents />} />
        <Route path="/incidents/:id" element={<IncidentDetail />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/help" element={<Help />} />
        <Route path="/knowledge" element={<KnowledgeHome />} />
        <Route path="/knowledge/:source" element={<KnowledgeArticle />} />
        <Route path="/analytics" element={<RequireAuth roles={["agent", "admin"]}><Analytics /></RequireAuth>} />
        <Route path="/admin" element={<RequireAuth roles={["admin"]}><Admin /></RequireAuth>} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
