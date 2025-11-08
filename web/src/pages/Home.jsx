import { useState } from "react";
import api from "@/lib/api";

const EXPIRY_OPTIONS = [
  { value: "", label: "No Expiry" },
  { value: "10", label: "10 Minutes" },
  { value: "60", label: "1 Hour" },
  { value: "180", label: "3 Hours" },
  { value: "1440", label: "1 Day" },
  { value: "4320", label: "3 Days" },
  { value: "10080", label: "1 Week" },
  { value: "20160", label: "2 Weeks" },
  { value: "43200", label: "1 Month" },
];

const Home = () => {
  const [url, setUrl] = useState("");
  const [expiryMinutes, setExpiryMinutes] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = { url };
      if (expiryMinutes !== "") {
        const minutes = parseInt(expiryMinutes, 10);
        payload.expires_at = Date.now() + minutes * 60 * 1000;
      }

      const response = await api.post("/links", payload);

      setResult(response.data);
      setUrl("");
      setExpiryMinutes("");
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data);
      } else {
        setError({ error: "Failed to shorten URL. Please try again." });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!result?.short_url) return;
    try {
      await navigator.clipboard.writeText(result.short_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };

  const formatExpiry = (timestamp) => {
    if (!timestamp) return null;
    const diff = timestamp - Date.now();
    if (diff <= 0) return "Expired";
    const m = Math.floor(diff / 60000);
    const h = Math.floor(m / 60);
    const d = Math.floor(h / 24);
    if (d > 0) return `${d}d`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <div className="min-h-[calc(100vh-56px-44px)] flex items-center justify-center">
        <div className="w-full">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-[1fr,200px,140px]"
          >
            <div>
              <label
                htmlFor="url"
                className="block text-[11px] mb-1 tracking-wider uppercase"
                style={{ color: "var(--color-aqua)" }}
              >
                URL{" "}
                <span
                  className="normal-case text-[11px]"
                  style={{ color: "var(--color-red)" }}
                >
                  (required)
                </span>
              </label>
              <input
                type="url"
                id="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/something"
                required
                className="w-full px-5 py-3.5 text-base md:text-lg md:py-4 focus:outline-none transition-colors"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  color: "var(--color-fg-primary)",
                  boxShadow: "inset 0 0 0 2px var(--color-bg-tertiary)",
                }}
                onFocus={(e) =>
                  (e.target.style.boxShadow =
                    "inset 0 0 0 2px var(--color-yellow)")
                }
                onBlur={(e) =>
                  (e.target.style.boxShadow =
                    "inset 0 0 0 2px var(--color-bg-tertiary)")
                }
              />
            </div>

            <div>
              <label
                htmlFor="expiry"
                className="block text-[11px] mb-1 tracking-wider uppercase"
                style={{ color: "var(--color-aqua)" }}
              >
                Expiry{" "}
                <span
                  className="normal-case text-[11px]"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  (optional)
                </span>
              </label>
              <div className="relative">
                <select
                  id="expiry"
                  value={expiryMinutes}
                  onChange={(e) => setExpiryMinutes(e.target.value)}
                  className="w-full px-5 py-3.5 text-base md:text-lg md:py-4 focus:outline-none appearance-none cursor-pointer transition-colors"
                  style={{
                    backgroundColor: "var(--color-bg-secondary)",
                    color: "var(--color-fg-primary)",
                    boxShadow: "inset 0 0 0 2px var(--color-bg-tertiary)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.boxShadow =
                      "inset 0 0 0 2px var(--color-yellow)")
                  }
                  onBlur={(e) =>
                    (e.target.style.boxShadow =
                      "inset 0 0 0 2px var(--color-bg-tertiary)")
                  }
                >
                  {EXPIRY_OPTIONS.map((o) => (
                    <option
                      key={o.value}
                      value={o.value}
                      style={{
                        backgroundColor: "var(--color-bg-secondary)",
                        color: "var(--color-fg-primary)",
                      }}
                    >
                      {o.label}
                    </option>
                  ))}
                </select>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  style={{ color: "var(--color-fg-muted)" }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </div>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 md:py-4 text-base md:text-lg font-semibold tracking-wide transition-transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                style={{
                  backgroundColor: "var(--color-yellow)",
                  color: "var(--color-bg-primary)",
                }}
              >
                {loading ? "Shortening…" : "Shorten"}
              </button>
            </div>
          </form>

          {error && (
            <div
              className="mt-5 p-3"
              style={{ backgroundColor: "var(--color-bg-secondary)" }}
            >
              <p
                className="text-sm font-medium"
                style={{ color: "var(--color-red)" }}
              >
                {error.error || "An error occurred"}
              </p>
              {error.errors &&
                Array.isArray(error.errors) &&
                error.errors.length > 0 && (
                  <ul
                    className="mt-1 text-sm space-y-0.5"
                    style={{ color: "var(--color-fg-primary)" }}
                  >
                    {error.errors.map((err, idx) => (
                      <li key={idx}>{Object.values(err).join(", ")}</li>
                    ))}
                  </ul>
                )}
            </div>
          )}

          {result && (
            <div
              className="mt-5 p-3 flex items-center gap-3"
              style={{ backgroundColor: "var(--color-bg-secondary)" }}
            >
              <div className="flex-1 min-w-0">
                <a
                  href={result.short_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base md:text-lg font-semibold hover:underline block truncate"
                  style={{ color: "var(--color-yellow)" }}
                >
                  {result.short_url}
                </a>
                {result.expires_at && (
                  <span
                    className="text-xs md:text-sm"
                    style={{ color: "var(--color-orange)" }}
                  >
                    in {formatExpiry(result.expires_at)}
                  </span>
                )}
              </div>
              <button
                onClick={handleCopy}
                className="px-4 py-2 text-sm md:text-base font-semibold transition-transform hover:-translate-y-0.5 shrink-0"
                style={{
                  backgroundColor: copied
                    ? "var(--color-green)"
                    : "var(--color-blue)",
                  color: "var(--color-bg-primary)",
                }}
              >
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
