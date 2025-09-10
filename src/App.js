import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/FirebaseAuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import AuthCallback from './components/AuthCallback';
import MainLayout from './components/MainLayout';
import POSPage from './components/POSPage';
import SummaryPage from './components/SummaryPage';
import ProductsPage from './components/ProductsPage';
import StaffPage from './components/StaffPage';
import OrdersPage from './components/OrdersPage';
import { mockProducts } from './data/mockData';
import customerService from './services/customerService';
import styles from './styles/styles';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/pos" replace />} />
            <Route
              path="pos"
              element={
                <POSPage
                  mockProducts={mockProducts}
                  customerService={customerService}
                />
              }
            />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="summary" element={<SummaryPage styles={styles} />} />
            <Route
              path="products"
              element={
                <ProtectedRoute requiredRole="admin">
                  <ProductsPage styles={styles} />
                </ProtectedRoute>
              }
            />
            <Route
              path="staff"
              element={
                <ProtectedRoute requiredRole="admin">
                  <StaffPage styles={styles} />
                </ProtectedRoute>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;