import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { AdminOrdersPage } from './pages/AdminOrdersPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AdminSelectionsPage } from './pages/AdminSelectionsPage';
import { AdminExpertsPage } from './pages/AdminExpertsPage';
import { AdminChecklistsPage } from './pages/AdminChecklistsPage';
import { AdminTariffsPage } from './pages/AdminTariffsPage';
import { AdminCreateInspectionPage } from './pages/admin/AdminCreateInspectionPage';
import { AdminInspectionDetailsPage } from './pages/admin/AdminInspectionDetailsPage';
import { AdminSelectionDetailsPage } from './pages/admin/AdminSelectionDetailsPage';
import { ChatPage } from './pages/ChatPage';
import { ClientSelectPage } from './pages/client/ClientSelectPage';
import { ClientInspectionsPage } from './pages/client/ClientInspectionsPage';
import { ClientInspectionDetailsPage } from './pages/client/ClientInspectionDetailsPage';
import { ClientSelectionDetailsPage } from './pages/client/ClientSelectionDetailsPage';
import { ClientNewOrder } from './pages/client/ClientNewOrder';
import { ExpertSelectPage } from './pages/expert/ExpertSelectPage';
import { ExpertInspectionsPage } from './pages/expert/ExpertInspectionsPage';
import { ExpertInspectionDetailsPage } from './pages/expert/ExpertInspectionDetailsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Sidebar />
        <main className="main">
          <Routes>
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/inspections" element={<AdminOrdersPage />} />
            <Route path="/admin/inspections/new" element={<AdminCreateInspectionPage />} />
            <Route path="/admin/inspections/:id" element={<AdminInspectionDetailsPage />} />
            <Route path="/admin/selections" element={<AdminSelectionsPage />} />
            <Route path="/admin/selections/:id" element={<AdminSelectionDetailsPage />} />
            <Route path="/admin/experts" element={<AdminExpertsPage />} />
            <Route path="/admin/checklists" element={<AdminChecklistsPage />} />
            <Route path="/admin/tariffs" element={<AdminTariffsPage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/client" element={<ClientSelectPage />} />
            <Route path="/client/inspections" element={<ClientInspectionsPage />} />
            <Route path="/client/inspections/:id" element={<ClientInspectionDetailsPage />} />
            <Route path="/client/selections/:id" element={<ClientSelectionDetailsPage />} />
            <Route path="/client/new" element={<ClientNewOrder />} />
            <Route path="/expert" element={<ExpertSelectPage />} />
            <Route path="/expert/inspections" element={<ExpertInspectionsPage />} />
            <Route path="/expert/inspections/:id" element={<ExpertInspectionDetailsPage />} />
            <Route path="*" element={<Navigate to="/admin/inspections" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
