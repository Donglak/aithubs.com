import { ArrowRight, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { BLACK_FRIDAY } from "../data/deals";

/** Hiện từ nay tới hết mùa Black Friday; trước ngày bắt đầu thì mời đăng ký nhận deal sớm */
export default function BlackFridayBanner({ className = "" }: { className?: string }) {
  const now = new Date();
  const start = new Date(`${BLACK_FRIDAY.start}T00:00:00`);
  const end = new Date(`${BLACK_FRIDAY.end}T23:59:59`);
  if (now > end) return null;
  const live = now >= start;

  return (
    <Link
      to="/deals"
      className={`group flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 bg-gray-900 text-white px-4 py-3 text-sm text-center ${className}`}
    >
      <span className="inline-flex items-center gap-2 font-semibold">
        <Flame className="w-4 h-4 text-orange-400" />
        {live
          ? `Black Friday ${BLACK_FRIDAY.year}: AI deals for solopreneurs are live`
          : `Black Friday ${BLACK_FRIDAY.year} AI deals start Nov 20. Get them first`}
      </span>
      <span className="inline-flex items-center gap-1 text-orange-300 group-hover:text-orange-200">
        {live ? "See the deals" : "Open the deal tracker"}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </span>
    </Link>
  );
}
