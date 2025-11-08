import { useState } from "react";
import { Link } from "react-router-dom";

export default function URLResult({ result, originalUrl }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.short_url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card border-[--color-accent-green] border-2">
      <h2 className="text-lg font-bold text-[--color-accent-green] mb-4">
        ✓ Link Created Successfully!
      </h2>

      <div className="space-y-4">
        {/* Short URL */}
        <div>
          <p className="text-xs font-semibold text-[--color-text-secondary] uppercase mb-2">
            Your Short URL
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={result.short_url}
              readOnly
              className="flex-1 input-base cursor-default bg-[--color-bg-tertiary]"
            />
            <button
              onClick={handleCopy}
              className={`button-primary px-4 ${
                copied ? "bg-[--color-accent-blue]" : ""
              }`}
            >
              {copied ? "✓ Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Original URL */}
        <div>
          <p className="text-xs font-semibold text-[--color-text-secondary] uppercase mb-2">
            Original URL
          </p>
          <p className="text-[--color-text-primary] break-all text-sm">
            {result.original_url}
          </p>
        </div>

        {/* Code */}
        <div>
          <p className="text-xs font-semibold text-[--color-text-secondary] uppercase mb-2">
            Short Code
          </p>
          <code className="inline-block px-3 py-2 rounded bg-[--color-bg-tertiary] text-[--color-accent-orange] font-bold">
            {result.code}
          </code>
        </div>

        {/* Expiry Info */}
        {result.expires_at && (
          <div>
            <p className="text-xs font-semibold text-[--color-text-secondary] uppercase mb-2">
              Expires At
            </p>
            <p className="text-[--color-accent-orange]">
              {new Date(result.expires_at).toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Another Link Button */}
      <button
        onClick={() => window.location.reload()}
        className="w-full button-secondary mt-6"
      >
        Create Another Link
      </button>
    </div>
  );
}
