import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Calculator from "@/pages/Calculator";
import Booking from "@/pages/Booking";
import Track from "@/pages/Track";
import Dashboard from "@/pages/Dashboard";
import BookingDetail from "@/pages/BookingDetail";
import Admin from "@/pages/Admin";
import Blog from "@/pages/Blog";

export default function App() {
    return (
        <div className="App">
            <AuthProvider>
                <BrowserRouter>
                    <Toaster position="top-center" richColors />
                    <Routes>
                        <Route path="/" element={<Landing />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/calculator" element={<Calculator />} />
                        <Route path="/track" element={<Track />} />
                        <Route path="/track/:code" element={<Track />} />
                        <Route path="/blog" element={<Blog />} />
                        <Route
                            path="/booking"
                            element={
                                <ProtectedRoute>
                                    <Booking />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/bookings/:id"
                            element={
                                <ProtectedRoute>
                                    <BookingDetail />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <ProtectedRoute adminOnly>
                                    <Admin />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </BrowserRouter>
            </AuthProvider>
        </div>
    );
}
