
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SeoProps {
  title?: string;
  description?: string;
  name?: string;
  type?: string;
  image?: string;
  url?: string;
}

const Seo: React.FC<SeoProps> = ({
  title,
  description,
  name = 'CheckIAS',
  type = 'website',
  image = '/images/logo-dark.png',
  url = window.location.href,
}) => {
  const siteTitle = title ? `${title} | CheckIAS` : 'CheckIAS - UPSC Answer Evaluation & Mentorship';
  const metaDescription = description || 'CheckIAS provides expert UPSC answer evaluation, personalized mentorship, and guidance calls to help you ace your civil services exam.';

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={metaDescription} />

      {/* Open Graph tags */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={name} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />

      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};

export default Seo;
