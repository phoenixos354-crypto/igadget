import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, adminOnly = false }) {
    const { user, ready } = useAuth();
    const location = useLocation();

    if (!ready) {
        return (
            <div className="flex h-screen items-center justify-center" data-testid="auth-loading">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#f97316]" />
            </div>
        );
    }

    if (!user || user === false) {
        return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }

    if (adminOnly && user.role !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}
