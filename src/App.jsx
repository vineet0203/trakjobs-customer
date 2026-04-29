import { Navigate, Route, Routes } from 'react-router-dom';
import CustomerLayout from './components/CustomerLayout';
import DashboardPage from './pages/DashboardPage';
import JobDetailPage from './pages/JobDetailPage';
import JobsListPage from './pages/JobsListPage';
import LoginPage from './pages/LoginPage';
import QuoteDetailPage from './pages/QuoteDetailPage';
import QuotesListPage from './pages/QuotesListPage';
import SetPasswordPage from './pages/SetPasswordPage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get("authToken");
  if (urlToken) { localStorage.setItem("customer_token", urlToken); window.history.replaceState({}, "", "/dashboard"); }
  const token = localStorage.getItem("customer_token");

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/set-password" element={<SetPasswordPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <CustomerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="quotes" element={<QuotesListPage />} />
        <Route path="quotes/:id" element={<QuoteDetailPage />} />
        <Route path="jobs" element={<JobsListPage />} />
        <Route path="jobs/:id" element={<JobDetailPage />} />
      </Route>

      <Route index element={<Navigate to={token ? "/dashboard" : "/login"} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;