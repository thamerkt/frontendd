import { Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from '../components/administrateur/AdminDashboard';
import EquipmentManagement from '../components/administrateur/EquipmentManagement';
import UserManagement from '../components/administrateur/UserManagement';
import CategoryManagement from '../components/administrateur/CategoryManagement';
import AnalyticsDashboard from '../components/administrateur/AnalyticsDashboard';

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />}>
        <Route index element={<AnalyticsDashboard />} />
        <Route path="equipment" element={<EquipmentManagement />} />
        <Route path="users" element={<UserManagement />} />
        <Route path="categories" element={<CategoryManagement />} />
        <Route path="analytics" element={<AnalyticsDashboard />} />
        <Route path="*" element={<Navigate to="/admin" replace />} />
      </Route>
    </Routes>
  );
} 