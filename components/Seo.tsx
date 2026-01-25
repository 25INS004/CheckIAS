
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTheme } from '../context/ThemeContext';

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
  image,
  url = window.location.href,
}) => {
  const { theme } = useTheme();
  const defaultImage = theme === 'dark' ? '/images/logo-dark.png' : '/images/logo-light.png';
  const finalImage = image || defaultImage;
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
      <meta property="og:image" content={finalImage} />
      <meta property="og:url" content={url} />

      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:creator" content={name} />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={finalImage} />
    </Helmet>
  );
};

export default Seo;
