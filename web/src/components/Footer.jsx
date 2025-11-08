import { useMemo } from "react";

const Footer = () => {
  const year = useMemo(() => new Date().getFullYear(), []);

  return (
    <footer style={{ backgroundColor: "var(--color-bg-primary)" }}>
      <div className="mx-auto w-full max-w-3xl px-4 py-3 flex items-center justify-between">
        <span
          className="text-[11px]"
          style={{ color: "var(--color-fg-muted)" }}
        >
          LinkShort — no-nonsense url shortener
        </span>
        <span
          className="text-[11px]"
          style={{ color: "var(--color-fg-muted)" }}
        >
          &copy;{year}
        </span>
      </div>
    </footer>
  );
};

export default Footer;
