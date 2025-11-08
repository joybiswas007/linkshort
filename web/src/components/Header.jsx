import { Link } from "react-router-dom";

const Header = () => (
  <header style={{ backgroundColor: "var(--color-bg-primary)" }}>
    <div className="mx-auto w-full max-w-3xl px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span
          className="inline-block h-3 w-3 rounded-sm"
          style={{ backgroundColor: "var(--color-yellow)" }}
          aria-hidden="true"
        />
        <Link
          to="/"
          className="text-lg font-semibold tracking-tight"
          style={{ color: "var(--color-fg-primary)" }}
        >
          LinkShort
        </Link>
      </div>
      <span
        className="text-xs uppercase tracking-widest"
        style={{ color: "var(--color-fg-muted)" }}
      >
        no-nonsense url shortener
      </span>
    </div>
  </header>
);

export default Header;
