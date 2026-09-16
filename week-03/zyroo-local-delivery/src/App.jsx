import { lazy, Suspense, useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { OrdersProvider } from "./context/OrdersContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";

import Home from "./pages/Home";
import Track from "./pages/Track";
import NotFound from "./pages/NotFound";

const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));

const BusinessDashboard = lazy(() => import("./pages/business/Dashboard"));
const BusinessOrders = lazy(() => import("./pages/business/Orders"));
const OrderForm = lazy(() => import("./pages/business/OrderForm"));
const OrderDetails = lazy(() => import("./pages/OrderDetails"));

const RiderDashboard = lazy(() => import("./pages/rider/RiderDashboard"));
const CustomerOrders = lazy(() => import("./pages/customer/CustomerOrders"));

const BOOT_MS = 350;

function useAppBoot() {
  const [booting, setBooting] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setBooting(false), BOOT_MS);
    return () => clearTimeout(t);
  }, []);
  return booting;
}

export default function App() {
  const booting = useAppBoot();

  return (
    <AuthProvider>
      <OrdersProvider>
        <ToastProvider>
          <HashRouter>
            {booting ? (
              <Loader fullPage size="lg" label="Loading Waypoint…" />
            ) : (
              <div className="app-shell">
                <Navbar />
                <main className="app-main">
                  <Suspense
                    fallback={
                      <Loader fullPage size="lg" label="Loading page…" />
                    }
                  >
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/track" element={<Track />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      <Route
                        path="/business/dashboard"
                        element={
                          <ProtectedRoute role="business">
                            <BusinessDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/business/orders"
                        element={
                          <ProtectedRoute role="business">
                            <BusinessOrders />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/business/orders/new"
                        element={
                          <ProtectedRoute role="business">
                            <OrderForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/business/orders/:id/edit"
                        element={
                          <ProtectedRoute role="business">
                            <OrderForm />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/business/orders/:id"
                        element={
                          <ProtectedRoute role="business">
                            <OrderDetails backTo="/business/orders" />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/rider/dashboard"
                        element={
                          <ProtectedRoute role="rider">
                            <RiderDashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/rider/orders/:id"
                        element={
                          <ProtectedRoute role="rider">
                            <OrderDetails backTo="/rider/dashboard" />
                          </ProtectedRoute>
                        }
                      />

                      <Route
                        path="/customer/orders"
                        element={
                          <ProtectedRoute role="customer">
                            <CustomerOrders />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/customer/orders/:id"
                        element={
                          <ProtectedRoute role="customer">
                            <OrderDetails backTo="/customer/orders" />
                          </ProtectedRoute>
                        }
                      />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </main>
                <Footer />
              </div>
            )}
          </HashRouter>
        </ToastProvider>
      </OrdersProvider>
    </AuthProvider>
  );
}
