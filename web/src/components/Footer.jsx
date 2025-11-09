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
    const date = new Date(timestamp);
    const month = date.toLocaleString("en-US", { month: "short" });
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${month} ${day}, ${year} ${hours}:${minutes}`;
  };

  const repoUrl = "https://github.com/joybiswas007/linkshort";

  const BuildInfoContent = ({ isMobile }) => (
    <>
      <div
        className={`flex items-center ${isMobile ? "justify-center" : "justify-start"} gap-3`}
      >
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
        >
          {buildInfo.build_info?.commit?.substring(0, 7)}
        </Link>
      </div>

      <div className={isMobile ? "text-center" : ""}>
        <span style={{ color: "var(--color-fg-muted)" }}>&copy; {year}</span>
      </div>
    </>
  );

  return (
    <footer style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-4">
        {!error && buildInfo ? (
          <>
            <div className="hidden md:grid md:grid-cols-3 items-center gap-4 text-sm">
              <BuildInfoContent isMobile={false} />

              <div className="text-right">
                {buildInfo.build_info?.time && (
                  <span style={{ color: "var(--color-fg-muted)" }}>
                    Built {formatBuildTime(buildInfo.build_info.time)}
                  </span>
                )}
              </div>
            </div>

            <div className="md:hidden space-y-2 text-sm">
              <BuildInfoContent isMobile={true} />
            </div>
          </>
        ) : error ? (
          <div className="text-center">
            <span
              className="text-sm"
              style={{ color: "var(--color-fg-muted)" }}
            >
              &copy; {year}
            </span>
          </div>
        ) : (
          <div className="text-center">
            <span
              className="text-sm"
              style={{ color: "var(--color-fg-muted)" }}
            >
              Loading...
            </span>
          </div>
        )}
      </div>
    </footer>
  );
};

export default Footer;
