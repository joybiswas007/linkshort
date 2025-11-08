import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "@/lib/api";

const Redirect = () => {
  const { code } = useParams();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("Resolving link…");

  useEffect(() => {
    let mounted = true;

    const fetchAndRedirect = async () => {
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
        setMessage("Redirecting…");

        setTimeout(() => {
          window.location.assign(original);
        }, 650);
      } catch (err) {
        if (!mounted) return;
        const apiErr =
          err?.response?.data?.error ||
          err?.message ||
          "link not found for code";
        setStatus("error");
        setMessage(apiErr);
      }
    };

    fetchAndRedirect();
    return () => {
      mounted = false;
    };
  }, [code]);

  return (
    <div className="mx-auto w-full max-w-3xl px-4">
      <div className="min-h-[calc(100vh-56px-44px)] flex items-center justify-center">
        <div className="w-full">
          <p
            className="text-base md:text-lg font-semibold truncate"
            style={{
              color:
                status === "error" ? "var(--color-red)" : "var(--color-yellow)",
            }}
          >
            {message}
          </p>

          {status === "success" && target && (
            <p
              className="mt-2 text-sm truncate"
              style={{ color: "var(--color-fg-secondary)" }}
            >
              Destination: {target}
            </p>
          )}

          {status === "error" && (
            <div className="mt-3 flex items-center gap-4">
              <Link
                to="/"
                className="text-sm font-semibold underline-offset-4 hover:underline"
                style={{ color: "var(--color-blue)" }}
              >
                Go Home
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="text-sm font-semibold underline-offset-4 hover:underline"
                style={{ color: "var(--color-purple)" }}
              >
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Redirect;
