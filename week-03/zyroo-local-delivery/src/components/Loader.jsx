import Spinner from "./Spinner";

const SPINNER_SIZE = { sm: 16, md: 22, lg: 30 };

// Single reusable loading indicator for the whole app: a Suspense fallback for
// lazy-loaded pages, a section-level loader for a page still fetching its
// data, or a small inline loader inside a panel. Same visual language
// everywhere so "the app is working on it" always looks the same.
export default function Loader({ label = "Loading…", size = "md", fullPage = false, inline = false }) {
  const content = (
    <div className={`loader loader-${size}${inline ? " loader-inline" : ""}`} role="status" aria-live="polite">
      <Spinner size={SPINNER_SIZE[size] || SPINNER_SIZE.md} />
      {label && <span className="loader-label">{label}</span>}
    </div>
  );

  if (fullPage) {
    return <div className="loader-page">{content}</div>;
  }

  return content;
}
