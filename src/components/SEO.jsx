import { memo } from "react";
import { Helmet } from "react-helmet-async";

const SEOData = memo(function SEOData({ data = {} }) {
  const {
    title,
    description,
    canonical,
    noIndex,
    openGraph = {},
    twitter = {},
    schema = null,
  } = data;

  const domain = "https://dsa-experiments.vercel.app";

  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      {/* OpenGraph Tags */}
      {openGraph.title && (
        <meta property="og:title" content={openGraph.title} />
      )}
      {openGraph.description && (
        <meta property="og:description" content={openGraph.description} />
      )}
      {openGraph.url && <meta property="og:url" content={openGraph.url} />}
      <meta
        property="og:image"
        content={`${domain}${openGraph.image ? openGraph.image : "/images/defaults/preview.png"}`}
      />
      {openGraph.type && <meta property="og:type" content={openGraph.type} />}

      {/* Twitter Tags */}
      {twitter.card && <meta name="twitter:card" content={twitter.card} />}
      {twitter.site && <meta name="twitter:site" content={twitter.site} />}
      {twitter.title && <meta name="twitter:title" content={twitter.title} />}
      {twitter.description && (
        <meta name="twitter:description" content={twitter.description} />
      )}
      {twitter.image && (
        <meta name="twitter:image" content={domain + twitter.image} />
      )}

      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      )}
    </Helmet>
  );
});

export default SEOData;
