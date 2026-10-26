import { Check, Copy, ExternalLink, Tag } from "lucide-react";
import { useState } from "react";

export interface DealCardProps {
  /** Ví dụ "30% off" hoặc "Lifetime deal $59" */
  headline: string;
  code?: string | null;
  terms?: string | null;
  expiresAt?: string | null;
  /** Ngày AIThubs kiểm tra deal còn hoạt động */
  checkedAt?: string | null;
  url?: string | null;
  /** Link affiliate -> rel="sponsored" theo hướng dẫn của Google */
  sponsored?: boolean;
  onClick?: () => void;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function DealCard({ headline, code, terms, expiresAt, checkedAt, url, sponsored, onClick }: DealCardProps) {
  const [copied, setCopied] = useState(false);
  const expired = !!expiresAt && new Date(expiresAt) < new Date(new Date().toDateString());

  const copy = async () => {
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this code:", code);
    }
  };

  return (
    <div className="rounded-xl border-2 border-dashed border-green-500/60 bg-green-50 dark:bg-green-900/10 p-5">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-green-700 dark:text-green-400">
        <Tag className="w-3.5 h-3.5" /> Exclusive AIThubs deal
      </p>
      <p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{headline}</p>
      {terms && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{terms}</p>}

      {code && (
        <button
          type="button"
          onClick={copy}
          className="mt-3 w-full flex items-center justify-between gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 font-mono text-sm text-gray-900 dark:text-white hover:border-green-500"
          aria-label={`Copy code ${code}`}
        >
          {code}
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-gray-400" />}
        </button>
      )}

      {url && !expired && (
        <a
          href={url}
          target="_blank"
          rel={sponsored ? "sponsored noopener noreferrer" : "noopener noreferrer"}
          onClick={onClick}
          className="mt-3 flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 hover:bg-green-700 px-4 py-2.5 text-sm font-medium text-white"
        >
          Get the deal <ExternalLink className="w-4 h-4" />
        </a>
      )}

      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
        {expired ? "This deal has expired." : expiresAt ? `Ends ${formatDate(expiresAt)}.` : null}
        {checkedAt && ` Checked ${formatDate(checkedAt)}.`}
        {sponsored && " We may earn a commission at no extra cost to you."}
      </p>
    </div>
  );
}
