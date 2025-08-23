import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastProvider } from './contexts/ToastContext';
import { ActivityProvider } from './contexts/ActivityContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Layout/Header';
import PageLoader from './components/Layout/PageLoader';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import SupplyPage from './pages/modules/SupplyPage';
import SuppliersPage from './pages/modules/SuppliersPage';
import StockPage from './pages/modules/StockPage';
import SalesPage from './pages/modules/SalesPage';
import CommissionsPage from './pages/modules/CommissionsPage';
import InvoicingPage from './pages/modules/InvoicingPage';
import AnalyticsPage from './pages/modules/AnalyticsPage';
import PaymentsPage from './pages/modules/PaymentsPage';
import SupportPage from './pages/modules/SupportPage';
import POSPage from './pages/POSPage';
import ActivityPage from './pages/ActivityPage';
import NotificationsPage from './pages/NotificationsPage';
import DocumentsRequiredPage from './pages/DocumentsRequiredPage';
import AccountPendingPage from './pages/AccountPendingPage';
import SubscriptionInactivePage from './pages/SubscriptionInactivePage';
import AgentsPage from './pages/modules/AgentsPage';
import ReturnsPage from './pages/modules/ReturnsPage';
import NotFoundPage from './pages/NotFoundPage';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
      >
        <Suspense fallback={<PageLoader />}>
          <Routes location={location}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login-client" element={<LoginPage />} />
            <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
            <Route path="/reinitialiser-mot-de-passe" element={<ResetPasswordPage />} />
            <Route path="/inscription" element={<RegisterPage />} />
            <Route
              path="/profil"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/approvisionnements"
              element={
                <ProtectedRoute>
                  <SupplyPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/returns"
              element={
                <ProtectedRoute>
                  <ReturnsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/returns/new"
              element={
                <ProtectedRoute>
                  <ReturnsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/fournisseurs"
              element={
                <ProtectedRoute>
                  <SuppliersPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/stocks"
              element={
                <ProtectedRoute>
                  <StockPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/ventes"
              element={
                <ProtectedRoute>
                  <SalesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/commissions"
              element={
                <ProtectedRoute>
                  <CommissionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/facturation"
              element={
                <ProtectedRoute>
                  <InvoicingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/paiements"
              element={
                <ProtectedRoute>
                  <PaymentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <SupportPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pos"
              element={
                <ProtectedRoute>
                  <POSPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/activites"
              element={
                <ProtectedRoute>
                  <ActivityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents-requis"
              element={
                <ProtectedRoute>
                  <DocumentsRequiredPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/compte-en-attente"
              element={
                <ProtectedRoute>
                  <AccountPendingPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/abonnement-inactif"
              element={
                <ProtectedRoute>
                  <SubscriptionInactivePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/agents"
              element={
                <ProtectedRoute>
                  <AgentsPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <NotificationProvider>
          <ActivityProvider>
            <AuthProvider>
              <Router>
                <div className="min-h-screen">
                  <Header />
                  <AnimatedRoutes />
                </div>
              </Router>
            </AuthProvider>
          </ActivityProvider>
        </NotificationProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;