import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ItemsPage from "./pages/ItemsPage";
import ItemFormPage from "./pages/ItemFormPage";
import CountsPage from "./pages/CountsPage";
import CountFormPage from "./pages/CountFormPage";
import CountDetailPage from "./pages/CountDetailPage";
import PendingRequestsPage from "./pages/PendingRequestsPage";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./components/ToastProvider";
import { authService } from "./services/auth";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="items" element={<ItemsPage />} />
              <Route path="items/new" element={<ItemFormPage />} />
              <Route path="items/:id/edit" element={<ItemFormPage />} />
              <Route path="counts" element={<CountsPage />} />
              <Route path="counts/new" element={<CountFormPage />} />
              <Route path="counts/:id" element={<CountDetailPage />} />
              <Route path="counts/:id/edit" element={<CountFormPage />} />
              <Route path="pending-requests" element={<PendingRequestsPage />} />
            </Route>

            <Route
              path="*"
              element={
                authService.isAuthenticated() ? (
                  <Navigate to="/" replace />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </QueryClientProvider>
  );
}

export default App;
