import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // tránh trình duyệt tự khôi phục vị trí cuộn cũ
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    // cuộn lên đầu trang mỗi khi đổi route (chỉ theo pathname)
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}
