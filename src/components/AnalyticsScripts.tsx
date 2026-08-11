'use client';

import { useEffect } from 'react';
import { hotjar } from 'react-hotjar';

export default function AnalyticsScripts() {
  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((res) => {
        if (!res?.success || !res?.data) return;
        const data = res.data;

        // Hotjar Initialization via react-hotjar
        const hotjarId = data.hotjarId ? data.hotjarId.trim() : '';
        if (hotjarId && /^\d+$/.test(hotjarId)) {
          hotjar.initialize({ id: parseInt(hotjarId, 10), sv: 6 });
        }

        // Microsoft Clarity Injection
        if (data.microsoftClarityId && !document.getElementById('clarity-script')) {
          const script = document.createElement('script');
          script.id = 'clarity-script';
          script.innerHTML = `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${data.microsoftClarityId}");`;
          document.head.appendChild(script);
        }

        // Google Analytics
        if (data.googleAnalyticsId && !document.getElementById('ga-script')) {
          const scriptGtag = document.createElement('script');
          scriptGtag.id = 'ga-script-src';
          scriptGtag.async = true;
          scriptGtag.src = `https://www.googletagmanager.com/gtag/js?id=${data.googleAnalyticsId}`;
          document.head.appendChild(scriptGtag);

          const scriptInit = document.createElement('script');
          scriptInit.id = 'ga-script';
          scriptInit.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${data.googleAnalyticsId}');`;
          document.head.appendChild(scriptInit);
        }
      })
      .catch(() => {});
  }, []);

  return null;
}
