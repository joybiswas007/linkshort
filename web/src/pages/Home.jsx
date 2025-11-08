import { useState } from "react";
import axios from "axios";

const EXPIRY_OPTIONS = [
  { value: "", label: "No Expiry" },
  { value: "10", label: "10 Minutes" },
  { value: "30", label: "30 Minutes" },
  { value: "60", label: "1 Hour" },
  { value: "180", label: "3 Hours" },
  { value: "360", label: "6 Hours" },
  { value: "720", label: "12 Hours" },
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

      if (expiryMinutes && expiryMinutes !== "") {
        const minutes = parseInt(expiryMinutes, 10);
        const expiryTimestamp = Date.now() + minutes * 60 * 1000;
        payload.expires_at = expiryTimestamp;
      }

      const response = await axios.post(
        "http://localhost:8000/api/v1/links",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

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
    try {
      await navigator.clipboard.writeText(result.short_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const formatExpiry = (timestamp) => {
    if (!timestamp) return null;
    const date = new Date(timestamp);
    const now = new Date();
    const diff = date - now;

    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-16">
          <h1
            className="text-6xl font-bold mb-4 tracking-tight"
            style={{ color: "var(--color-yellow)" }}
          >
            URL Shortener
          </h1>
          <p className="text-xl" style={{ color: "var(--color-fg-secondary)" }}>
            Shorten your links with optional expiry time
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="url"
              className="block text-sm font-medium mb-2 tracking-wide uppercase"
              style={{ color: "var(--color-aqua)" }}
            >
              URL to Shorten
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very/long/url"
              required
              className="w-full px-5 py-3 text-base border-2 focus:outline-none transition-all duration-200"
              style={{
                backgroundColor: "var(--color-bg-secondary)",
                borderColor: "var(--color-bg-tertiary)",
                color: "var(--color-fg-primary)",
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = "var(--color-yellow)")
              }
              onBlur={(e) =>
                (e.target.style.borderColor = "var(--color-bg-tertiary)")
              }
            />
          </div>

          <div>
            <label
              htmlFor="expiry"
              className="block text-sm font-medium mb-2 tracking-wide uppercase"
              style={{ color: "var(--color-aqua)" }}
            >
              Expiry Time
            </label>
            <div className="relative">
              <select
                id="expiry"
                value={expiryMinutes}
                onChange={(e) => setExpiryMinutes(e.target.value)}
                className="w-full px-5 py-3 text-base border-2 focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  borderColor: "var(--color-bg-tertiary)",
                  color: "var(--color-fg-primary)",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "var(--color-yellow)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "var(--color-bg-tertiary)")
                }
              >
                {EXPIRY_OPTIONS.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                    style={{
                      backgroundColor: "var(--color-bg-secondary)",
                      color: "var(--color-fg-primary)",
                    }}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="2"
                stroke="currentColor"
                className="h-5 w-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-base font-semibold tracking-wide transition-all duration-200 hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{
              backgroundColor: "var(--color-yellow)",
              color: "var(--color-bg-primary)",
            }}
          >
            {loading ? "Shortening..." : "Shorten URL"}
          </button>
        </form>

        {error && (
          <div
            className="mt-6 p-3 border-l-4"
            style={{
              borderColor: "var(--color-red)",
              backgroundColor: "var(--color-bg-secondary)",
            }}
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
                <ul className="mt-1 text-sm space-y-1">
                  {error.errors.map((err, index) => (
                    <li
                      key={index}
                      style={{ color: "var(--color-fg-primary)" }}
                    >
                      {Object.entries(err)
                        .map(([key, value]) => value)
                        .join(", ")}
                    </li>
                  ))}
                </ul>
              )}
          </div>
        )}

        {result && (
          <div
            className="mt-6 p-4 border-l-4 flex items-center gap-3"
            style={{
              borderColor: "var(--color-green)",
              backgroundColor: "var(--color-bg-secondary)",
            }}
          >
            <div className="flex-1 min-w-0">
              <a
                href={result.short_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-semibold hover:underline block truncate"
                style={{ color: "var(--color-yellow)" }}
              >
                {result.short_url}
              </a>
              {result.expires_at && (
                <span
                  className="text-sm"
                  style={{ color: "var(--color-orange)" }}
                >
                  Expires in {formatExpiry(result.expires_at)}
                </span>
              )}
            </div>
            <button
              onClick={handleCopy}
              className="px-5 py-2 text-sm font-semibold transition-all duration-200 hover:translate-y-[-1px] shrink-0"
              style={{
                backgroundColor: copied
                  ? "var(--color-green)"
                  : "var(--color-blue)",
                color: "var(--color-bg-primary)",
              }}
            >
              {copied ? "✓" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
