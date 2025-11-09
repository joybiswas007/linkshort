import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";

const Redirect = () => {
  const { code } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("Resolving link…");
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef(null);

  // Fetch mapping
  useEffect(() => {
    let mounted = true;

    const fetchAndPrepare = async () => {
      try {
        setStatus("loading");
        setMessage("Resolving link…");

        const res = await api.get(`/links/${code}`);
        const data = res.data;
        const original = Array.isArray(data.original_url)
          ? data.original_url[0]
          : data.original_url;

        if (!original) throw new Error("Missing destination URL");

        if (!mounted) return;
        setTarget(original);
        setStatus("success");
        setMessage("Link resolved");
      } catch (err) {
        if (!mounted) return;
        const apiErr =
          err?.response?.data?.error || err?.message || "Link not found";
        setStatus("error");
        setMessage(apiErr);
      }
    };

    fetchAndPrepare();
    return () => {
      mounted = false;
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [code]);

  // Start countdown when ready
  useEffect(() => {
    if (status !== "success" || !target) return;
    setCountdown(5);
    timerRef.current = window.setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
          window.location.assign(target);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [status, target]);

  const originHost = useMemo(() => {
    try {
      return new URL(target).host;
    } catch (e) {
      return "";
    }
  }, [target]);

  const cancelAuto = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCountdown(0);
  };

  const proceedNow = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    window.location.assign(target);
  };

  const copyTarget = async () => {
    try {
      await navigator.clipboard.writeText(target);
      setMessage("Copied to clipboard");
      setTimeout(() => setMessage("Link resolved"), 1200);
    } catch {
      setMessage("Copy failed");
      setTimeout(() => setMessage("Link resolved"), 1200);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <div className="min-h-[calc(100vh-56px-44px)] flex items-center justify-center">
        <div className="w-full">
          {/* Status Header */}
          <div className="mb-6">
            <p
              className="text-xs tracking-widest uppercase mb-2"
              style={{ color: "var(--color-fg-muted)" }}
            >
              {status === "loading"
                ? "Status"
                : status === "error"
                  ? "Error"
                  : "Redirect"}
            </p>
            <p
              className="text-2xl md:text-3xl font-bold"
              style={{
                color:
                  status === "error"
                    ? "var(--color-red)"
                    : status === "loading"
                      ? "var(--color-yellow)"
                      : "var(--color-green)",
              }}
            >
              {message}
            </p>
          </div>

          {/* Success State */}
          {status === "success" && target && (
            <div className="space-y-4">
              {/* Warning Banner */}
              <div
                className="p-4 border-l-4"
                style={{
                  backgroundColor: "var(--color-bg-secondary)",
                  borderColor: "var(--color-orange)",
                }}
              >
                <p
                  className="text-xs tracking-wider uppercase mb-1 font-semibold"
                  style={{ color: "var(--color-orange)" }}
                >
                  External Link Warning
                </p>
                <p
                  className="text-sm"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  You are being redirected to an external site. Verify the
                  destination before proceeding.
                </p>
              </div>

              {/* Destination Box */}
              <div
                className="p-4"
                style={{ backgroundColor: "var(--color-bg-secondary)" }}
              >
                <p
                  className="text-xs tracking-wider uppercase mb-2"
                  style={{ color: "var(--color-aqua)" }}
                >
                  Destination
                </p>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm md:text-base break-all mb-1"
                      style={{ color: "var(--color-fg-primary)" }}
                    >
                      {target}
                    </p>
                    {originHost && (
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-fg-muted)" }}
                      >
                        Host: {originHost}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={copyTarget}
                    className="shrink-0 px-3 py-1.5 text-xs font-semibold tracking-wide transition-transform hover:-translate-y-0.5"
                    style={{
                      backgroundColor: "var(--color-blue)",
                      color: "var(--color-bg-primary)",
                    }}
                  >
                    Copy
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {countdown > 0 ? (
                  <>
                    <button
                      onClick={proceedNow}
                      className="flex-1 min-w-[140px] py-3 text-base font-semibold tracking-wide transition-transform hover:-translate-y-0.5"
                      style={{
                        backgroundColor: "var(--color-green)",
                        color: "var(--color-bg-primary)",
                      }}
                    >
                      Proceed Now
                    </button>
                    <button
                      onClick={cancelAuto}
                      className="flex-1 min-w-[140px] py-3 text-base font-semibold tracking-wide transition-transform hover:-translate-y-0.5"
                      style={{
                        backgroundColor: "var(--color-bg-tertiary)",
                        color: "var(--color-fg-primary)",
                      }}
                    >
                      Cancel ({countdown}s)
                    </button>
                  </>
                ) : (
                  <button
                    onClick={proceedNow}
                    className="flex-1 py-3 text-base font-semibold tracking-wide transition-transform hover:-translate-y-0.5"
                    style={{
                      backgroundColor: "var(--color-green)",
                      color: "var(--color-bg-primary)",
                    }}
                  >
                    Proceed
                  </button>
                )}
                <Link
                  to="/"
                  className="flex-1 min-w-[140px] py-3 text-base font-semibold tracking-wide text-center transition-transform hover:-translate-y-0.5"
                  style={{
                    backgroundColor: "var(--color-bg-secondary)",
                    color: "var(--color-fg-primary)",
                    boxShadow: "inset 0 0 0 2px var(--color-bg-tertiary)",
                  }}
                >
                  Go Home
                </Link>
              </div>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="space-y-4">
              <div
                className="p-4"
                style={{ backgroundColor: "var(--color-bg-secondary)" }}
              >
                <p
                  className="text-sm md:text-base"
                  style={{ color: "var(--color-fg-secondary)" }}
                >
                  The shortened link code{" "}
                  <span
                    className="font-mono"
                    style={{ color: "var(--color-yellow)" }}
                  >
                    /{code}
                  </span>{" "}
                  could not be resolved. It may have expired or never existed.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 min-w-[140px] py-3 text-base font-semibold tracking-wide transition-transform hover:-translate-y-0.5"
                  style={{
                    backgroundColor: "var(--color-purple)",
                    color: "var(--color-bg-primary)",
                  }}
                >
                  Retry
                </button>
                <Link
                  to="/"
                  className="flex-1 min-w-[140px] py-3 text-base font-semibold tracking-wide text-center transition-transform hover:-translate-y-0.5"
                  style={{
                    backgroundColor: "var(--color-yellow)",
                    color: "var(--color-bg-primary)",
                  }}
                >
                  Go Home
                </Link>
              </div>
            </div>
          )}

          {/* Loading State */}
          {status === "loading" && (
            <div
              className="p-8 text-center"
              style={{ backgroundColor: "var(--color-bg-secondary)" }}
            >
              <div className="inline-block">
                <div
                  className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
                  style={{
                    borderColor:
                      "var(--color-yellow) transparent transparent transparent",
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Redirect;
