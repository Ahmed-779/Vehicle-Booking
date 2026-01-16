import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout, ProtectedRoute, PublicRoute } from './components/layout';
import { Landing, Login, Signup, Dashboard, MyBookings, Admin } from './pages';
import { useAuth } from './context/AuthContext';

// Admin route wrapper
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuth();
  
  if (isLoading) return null;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  
  return <>{children}</>;
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/"
        element={
          <PublicRoute>
            <Landing />
          </PublicRoute>
        }
      />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicRoute>
            <Signup />
          </PublicRoute>
        }
      />

      {/* Protected routes with layout */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/my-bookings" element={<MyBookings />} />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Admin />
            </AdminRoute>
          }
        />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
