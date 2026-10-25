import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { supabase } from "../../lib/supabase";

interface ProtectedRouteProps {
  children?: React.ReactNode;
  requireAdmin?: boolean;
}

function Spinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
    </div>
  );
}

export default function ProtectedRoute({ children, requireAdmin }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    if (!requireAdmin || !user) return;
    // Quyền admin lấy từ profiles.role (qua hàm is_admin), KHÔNG dùng user_metadata vì user tự sửa được.
    // Đây chỉ là lớp UI — dữ liệu admin được bảo vệ bằng RLS.
    supabase.rpc("is_admin").then(({ data }) => setIsAdmin(data === true));
  }, [requireAdmin, user]);

  if (loading) return <Spinner />;

  if (!user) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (requireAdmin) {
    if (isAdmin === null) return <Spinner />;
    if (!isAdmin) return <Navigate to="/dashboard" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
