import type { Metadata } from "next";
import { Inter, Manrope, Geist } from "next/font/google";
import "./globals.css";
import { SeoSettingsModel } from "@/models/seo-settings.model";
import { AnalyticsSettingsModel } from "@/models/analytics-settings.model";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { CartProvider } from "@/contexts/CartContext";
import PublicLayoutWrapper from "@/components/PublicLayoutWrapper";
import QueryProvider from "@/components/QueryProvider";
import CustomToaster from "@/components/common/CustomToaster";
import { cn } from "@/lib/utils";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await SeoSettingsModel.get();
    return {
      metadataBase: new URL(seo.canonicalDomain || "https://zenvro.com"),
      title: {
        default: seo.defaultTitle || "VELOUR | International Fashion",
        template: seo.titleTemplate || "%s | VELOUR",
      },
      description: seo.defaultDescription || "Explore curated collections and everyday essentials thoughtfully designed.",
      keywords: seo.defaultKeywords,
      openGraph: {
        title: seo.defaultTitle,
        description: seo.defaultDescription,
        siteName: seo.siteName,
        locale: "en_US",
        type: "website",
        ...(seo.defaultOgImage
          ? { images: [{ url: seo.defaultOgImage, width: 1200, height: 630 }] }
          : {}),
      },
      twitter: {
        card: "summary_large_image",
        title: seo.defaultTitle,
        description: seo.defaultDescription,
        ...(seo.defaultOgImage ? { images: [seo.defaultOgImage] } : {}),
      },
      robots: seo.robotsDefault || "index, follow",
      verification: {
        ...(seo.googleVerification ? { google: seo.googleVerification } : {}),
        ...(seo.yandexVerification ? { yandex: seo.yandexVerification } : {}),
        other: {
          ...(seo.bingVerification ? { "msvalidate.01": seo.bingVerification } : {}),
        },
      },
      ...(seo.favicon ? { icons: { icon: seo.favicon } } : {}),
    };
  } catch {
    return {
      title: "VELOUR | International Fashion",
      description: "Explore curated collections and everyday essentials thoughtfully designed.",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let analytics = null;
  let seo = null;

  try {
    analytics = await AnalyticsSettingsModel.get().catch(() => null);
    seo = await SeoSettingsModel.get().catch(() => null);
  } catch {
    // Fallback if DB connection is unavailable
  }

  const schemas = [];
  if (seo?.schemaOrganization && Object.keys(seo.schemaOrganization).length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      ...seo.schemaOrganization,
    });
  }
  if (seo?.schemaWebsite && Object.keys(seo.schemaWebsite).length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      ...seo.schemaWebsite,
    });
  }

  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, manrope.variable, "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css"
        />

        {/* Google Analytics */}
        {analytics?.googleAnalyticsId && (
          <>
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${analytics.googleAnalyticsId}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analytics.googleAnalyticsId}');`,
              }}
            />
          </>
        )}

        {/* Google Tag Manager */}
        {analytics?.googleTagManagerId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${analytics.googleTagManagerId}');`,
            }}
          />
        )}

        {/* Facebook Pixel */}
        {analytics?.facebookPixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${analytics.facebookPixelId}');fbq('track','PageView');`,
            }}
          />
        )}

        {/* Microsoft Clarity */}
        {analytics?.microsoftClarityId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${analytics.microsoftClarityId}");`,
            }}
          />
        )}

        {/* Hotjar */}
        {analytics?.hotjarId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(h,o,t,j,a,r){h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};h._hjSettings={hjid:${analytics.hotjarId},hjsv:6};a=o.getElementsByTagName('head')[0];r=o.createElement('script');r.async=1;r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;a.appendChild(r);})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');`,
            }}
          />
        )}

        {/* TikTok Pixel */}
        {analytics?.tiktokPixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${analytics.tiktokPixelId}');ttq.page();}(window,document,'ttq');`,
            }}
          />
        )}

        {/* Snapchat Pixel */}
        {analytics?.snapchatPixelId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(e,t,n){if(e.snaptr)return;var a=e.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var s='script';var r=t.createElement(s);r.async=!0;r.src=n;var u=t.getElementsByTagName(s)[0];u.parentNode.insertBefore(r,u);})(window,document,'https://sc-static.net/scevent.min.js');snaptr('init', '${analytics.snapchatPixelId}');snaptr('track', 'PAGE_VIEW');`,
            }}
          />
        )}

        {/* LinkedIn Insight Tag */}
        {analytics?.linkedInInsightId && (
          <script
            dangerouslySetInnerHTML={{
              __html: `_linkedin_partner_id = "${analytics.linkedInInsightId}"; window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || []; window._linkedin_data_partner_ids.push(_linkedin_partner_id); (function(l) { if (!l){window.lintrk = function(a,b){window.lintrk.q.push([a,b])};window.lintrk.q=[]} var s = document.getElementsByTagName("script")[0]; var b = document.createElement("script"); b.type = "text/javascript";b.async = true; b.src = "https://snap.licdn.com/li.lms-analytics/insight.min.js"; s.parentNode.insertBefore(b, s);})(window.lintrk);`,
            }}
          />
        )}

        {/* Custom Head Scripts */}
        {analytics?.customScriptsHead && (
          <div dangerouslySetInnerHTML={{ __html: analytics.customScriptsHead }} />
        )}

        {/* JSON-LD Schemas */}
        {schemas.map((schema, i) => (
          <script
            key={`schema-${i}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          />
        ))}
      </head>
      <body className="min-h-full flex flex-col font-sans selection:bg-[#ff5c00] selection:text-white overflow-x-hidden bg-background text-foreground transition-colors duration-200">
        {/* GTM noscript */}
        {analytics?.googleTagManagerId && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${analytics.googleTagManagerId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        )}

        {/* Custom Body Scripts */}
        {analytics?.customScriptsBody && (
          <div dangerouslySetInnerHTML={{ __html: analytics.customScriptsBody }} />
        )}

        <ThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <CartProvider>
                <SmoothScrollProvider>
                  <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
                </SmoothScrollProvider>
              </CartProvider>
            </AuthProvider>
            <CustomToaster />
          </QueryProvider>
        </ThemeProvider>

        {/* Custom Footer Scripts */}
        {analytics?.customScriptsFooter && (
          <div dangerouslySetInnerHTML={{ __html: analytics.customScriptsFooter }} />
        )}
      </body>
    </html>
  );
}
