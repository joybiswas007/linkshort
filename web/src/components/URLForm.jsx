import { useState } from "react";
import { useURLShortener } from "@/hooks/useURLShortener";
import ExpirySelector from "@/components/ExpirySelector";
import URLResult from "@/components/URLResult";

export default function URLForm() {
  const [url, setUrl] = useState("");
  const [expiry, setExpiry] = useState("");
  const { result, loading, error, shortenURL } = useURLShortener();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    const payload = { url: url.trim() };
    if (expiry) {
      payload.expires_at = expiry;
    }

    await shortenURL(payload);
  };

  return (
    <div className="min-h-screen bg-[--color-bg-primary] flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold text-[--color-accent-green] mb-2">
            Link Shrinker
          </h1>
          <p className="text-[--color-text-secondary]">
            Transform long URLs into short, shareable links
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-6 mb-6">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-semibold text-[--color-accent-blue] mb-2">
              Your Long URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/very-long-url"
              className="input-base"
              disabled={loading}
            />
          </div>

          {/* Expiry Selector */}
          <ExpirySelector
            value={expiry}
            onChange={setExpiry}
            disabled={loading}
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className={`w-full button-primary font-bold text-lg ${
              loading || !url.trim()
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            {loading ? "Creating..." : "Shorten URL"}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="card border-[--color-accent-red] border-2 bg-[--color-bg-secondary] p-4 mb-6">
            <p className="text-[--color-accent-red] font-semibold">
              Error: {error}
            </p>
          </div>
        )}

        {/* Result Display */}
        {result && <URLResult result={result} originalUrl={url} />}
      </div>
    </div>
  );
}
