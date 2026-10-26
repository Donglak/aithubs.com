import { Check, Copy } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";

const SITE = "https://aithubs.com";
const VARIANTS = [
  { key: "light", label: "Light", src: "/badges/featured-on-aithubs-light.svg", bg: "bg-white" },
  { key: "dark", label: "Dark", src: "/badges/featured-on-aithubs-dark.svg", bg: "bg-gray-900" },
] as const;

export default function BadgePage() {
  const [variant, setVariant] = useState<(typeof VARIANTS)[number]["key"]>("light");
  const [productUrl, setProductUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const current = VARIANTS.find((v) => v.key === variant)!;
  // Chỉ chấp nhận link trỏ về aithubs.com (thường là trang sản phẩm của vendor)
  const target = productUrl.trim().startsWith(SITE) ? productUrl.trim() : SITE;
  const snippet = `<a href="${target}" target="_blank" title="Featured on AIThubs"><img src="${SITE}${current.src}" alt="Featured on AIThubs" width="220" height="54" /></a>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this code:", snippet);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-gray-900">
      <Helmet>
        <title>Featured on AIThubs Badge | AIThubs</title>
        <meta name="description" content="Add the Featured on AIThubs badge to your website to get a free listing." />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">The &quot;Featured on AIThubs&quot; badge</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Free listings need this badge on your website (home page, footer or press page). Once it is live, add that
          page&apos;s URL to your product under <em>Exclusive deal &amp; badge</em>. Prefer not to? Offer our readers an
          exclusive deal instead and{" "}
          <Link to="/become-vendor" className="underline">
            become a Deal Partner
          </Link>
          .
        </p>

        <div className="flex gap-2 mb-4" role="radiogroup" aria-label="Badge style">
          {VARIANTS.map((v) => (
            <button
              key={v.key}
              type="button"
              role="radio"
              aria-checked={variant === v.key}
              onClick={() => setVariant(v.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                variant === v.key
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              {v.label}
            </button>
          ))}
        </div>

        <div className={`flex items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-700 p-10 ${current.bg}`}>
          <img src={current.src} alt="Featured on AIThubs" width={220} height={54} />
        </div>

        <label className="block mt-8">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Link the badge to your AIThubs page (optional)
          </span>
          <input
            className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm"
            placeholder={`${SITE}/products/your-product`}
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
          />
        </label>

        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Embed code</span>
            <button
              type="button"
              onClick={copy}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 dark:text-primary-400"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap break-all rounded-lg bg-gray-900 text-gray-100 p-4 text-xs">{snippet}</pre>
        </div>

        <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
          Please keep the link as a normal (dofollow) link. We check that the badge is live before approving a free
          listing.
        </p>
      </div>
    </div>
  );
}
