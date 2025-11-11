import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import { Link } from "react-router-dom";

const Footer = () => {
  const year = useMemo(() => new Date().getFullYear(), []);
  const [buildInfo, setBuildInfo] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchBuildInfo = async () => {
      try {
        const res = await api.get("/build-info");
        if (res.status !== 200) {
          throw new Error("Failed to fetch build info");
        }
        setBuildInfo(res.data);
        setError(false);
      } catch (err) {
        console.error("Build info fetch error:", err);
        setError(true);
      }
    };

    fetchBuildInfo();
  }, []);

  const formatBuildTime = (timestamp) => {
    if (!timestamp) return "";

    // Handle milliseconds timestamp (13 digits)
    const date = new Date(timestamp);

    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  };

  const repoUrl = "https://github.com/joybiswas007/linkshort";

  return (
    <footer style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-3">
        {!error && buildInfo ? (
          <>
            {/* Desktop layout */}
            <div className="hidden md:flex md:items-center md:justify-between text-xs">
              <div className="flex items-center gap-2">
                <span style={{ color: "var(--color-fg-muted)" }}>
                  Built on:
                </span>
                {buildInfo.build_info?.time && (
                  <span style={{ color: "var(--color-fg-secondary)" }}>
                    {formatBuildTime(buildInfo.build_info.time)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Link
                  to={`${repoUrl}/commit/${buildInfo.build_info?.commit}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono hover:underline"
                  style={{ color: "var(--color-yellow)" }}
                  title={buildInfo.build_info?.commit}
                >
                  {buildInfo.build_info?.commit?.substring(0, 7)}
                </Link>
                <span style={{ color: "var(--color-fg-muted)" }}>•</span>
                <span style={{ color: "var(--color-purple)" }}>
                  {buildInfo.build_info?.branch}
                </span>
                <span style={{ color: "var(--color-fg-muted)" }}>•</span>
                <span style={{ color: "var(--color-aqua)" }}>
                  {buildInfo.go_version}
                </span>
              </div>

              <div>
                <span style={{ color: "var(--color-fg-muted)" }}>
                  &copy; {year}
                </span>
              </div>
            </div>

            {/* Mobile layout */}
            <div className="md:hidden space-y-2 text-xs text-center">
              <div className="flex items-center justify-center gap-2">
                <span style={{ color: "var(--color-aqua)" }}>
                  {buildInfo.go_version}
                </span>
                <span style={{ color: "var(--color-fg-muted)" }}>•</span>
                <span style={{ color: "var(--color-purple)" }}>
                  {buildInfo.build_info?.branch}
                </span>
                <span style={{ color: "var(--color-fg-muted)" }}>•</span>
                <Link
                  to={`${repoUrl}/commit/${buildInfo.build_info?.commit}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono hover:underline"
                  style={{ color: "var(--color-yellow)" }}
                  title={buildInfo.build_info?.commit}
                >
                  {buildInfo.build_info?.commit?.substring(0, 7)}
                </Link>
              </div>

              {buildInfo.build_info?.time && (
                <div>
                  <span style={{ color: "var(--color-fg-muted)" }}>
                    Built on:{" "}
                  </span>
                  <span style={{ color: "var(--color-fg-secondary)" }}>
                    {formatBuildTime(buildInfo.build_info.time)}
                  </span>
                </div>
              )}

              <div>
                <span style={{ color: "var(--color-fg-muted)" }}>
                  &copy; {year}
                </span>
              </div>
            </div>
          </>
        ) : error ? (
          <div className="text-center text-xs">
            <span style={{ color: "var(--color-fg-muted)" }}>
              &copy; {year}
            </span>
          </div>
        ) : (
          <div className="text-center text-xs">
            <span style={{ color: "var(--color-fg-muted)" }}>Loading...</span>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
