import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="tr" style={{ backgroundColor: '#1a1a1a' }}>
      <Head>
        <meta name="theme-color" content="#1a1a1a" />
      </Head>
      <body className="bg-dark-bg-primary text-text-light antialiased" style={{ backgroundColor: '#1a1a1a', color: '#f5f0e6' }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
