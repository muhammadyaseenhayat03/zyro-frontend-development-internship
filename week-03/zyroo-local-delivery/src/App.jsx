import { lazy, Suspense, useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { OrdersProvider } from "./context/OrdersContext";
import { ToastProvider } from "./context/ToastContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Loader from "./components/Loader";

// Home, Track, and NotFound are small and needed right away (the first thing
// most visitors land on, or the fallback for any unmatched URL), so they stay
// in the main bundle. Everything role-specific — auth screens plus every
// Business/Rider/Customer page — is only needed after a real navigation, so
// it's code-split with React.lazy and only downloaded when visited.
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

// AuthProvider/OrdersProvider read localStorage synchronously, so there's no
// real async gap for session/role/order data today — but gating the whole
// app behind one boot loader still matters: it's the single place that
// represents "checking who's logged in and loading their data" for every
// role, it's what stops a protected route from ever having a chance to
// render before the session is known, and it keeps that logic from being
// duplicated (or missed) on individual pages later if a real API replaces
// localStorage.
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
                  <Suspense fallback={<Loader fullPage size="lg" label="Loading page…" />}>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/track" element={<Track />} />
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />

                      {/* Business */}
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

                      {/* Rider */}
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

                      {/* Customer */}
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
