import { useEffect } from "react";
export default function SEO() {
  const { VITE_GTAGID: gTagID } = import.meta.env;

  // Get current URL safely for SSR compatibility
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <>
      <link rel="canonical" href={currentUrl} />
      {gTagID && <GoogleAnalytics gTagID={gTagID} />}

      <meta property="og:url" content={currentUrl} />
      <meta
        property="og:image"
        content={`${currentUrl}linkshort-og-image.jpg`}
      />
      <meta
        name="twitter:image"
        content={`${currentUrl}linkshort-og-image.jpg`}
      />
    </>
  );
}

const GoogleAnalytics = ({ gTagID }) => {
  useEffect(() => {
    if (!gTagID) return;

    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }

    window.gtag = gtag;

    gtag("js", new Date());
    gtag("config", gTagID);
  }, [gTagID]);

  if (!gTagID) return null;

  return (
    <script
      async
      src={`https://www.googletagmanager.com/gtag/js?id=${gTagID}`}
    />
  );
};
