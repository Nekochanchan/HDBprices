import React from 'react';
import { MessageSquare, ExternalLink } from 'lucide-react';

interface TalkToUsSectionProps {
  id?: string;
}

export const TalkToUsSection: React.FC<TalkToUsSectionProps> = ({ id = 'talk-to-us-section' }) => {
  const disqusSrcDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <base target="_blank">
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: transparent;
    }
    #disqus_thread {
      width: 100%;
      min-height: 440px;
    }
  </style>
</head>
<body>
  <div id="disqus_thread"></div>
  <script>
    var disqus_config = function () {
      this.page.url = 'https://hdbprices-app.disqus.com';
      this.page.identifier = 'singapore-hdb-resale-forum-main';
    };
    (function() {
      var d = document, s = d.createElement('script');
      s.src = 'https://hdbprices-app.disqus.com/embed.js';
      s.setAttribute('data-timestamp', +new Date());
      (d.head || d.body).appendChild(s);
    })();
  </script>
  <script id="dsq-count-scr" src="https://hdbprices-app.disqus.com/count.js" async></script>
  <noscript>Please enable JavaScript to view the <a href="https://disqus.com/?ref_noscript">comments powered by Disqus.</a></noscript>
</body>
</html>`;

  return (
    <section
      id={id}
      className="w-full bg-[#fbfbfd] border-t border-black/[0.06] py-12 sm:py-16 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Main Card Container */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_12px_40px_rgba(0,0,0,0.04)] overflow-hidden">
          {/* Card Top Header */}
          <div className="px-6 py-5 sm:px-8 sm:py-6 border-b border-slate-100 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-[#eff4fb] border border-blue-100/80 flex items-center justify-center text-[#2563eb] shrink-0 shadow-2xs">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                  Talk to Us
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 font-normal mt-0.5">
                  Feedback, carpark rate updates, or questions for Singapore drivers &amp; community.
                </p>
              </div>
            </div>

            <a
              href="https://hdbprices-app.disqus.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#f0f4f9] hover:bg-[#e4ebf5] text-[#2563eb] text-xs font-semibold rounded-xl border border-blue-100/80 transition-colors shrink-0 shadow-2xs"
            >
              <span>Open Forum</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Disqus Embed Container isolated inside iframe */}
          <div className="p-4 sm:p-6 min-h-[480px]">
            <iframe
              title="Disqus Community Discussion"
              srcDoc={disqusSrcDoc}
              className="w-full min-h-[500px] h-[560px] border-0 rounded-2xl"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            />

            <noscript>
              Please enable JavaScript to view the{' '}
              <a
                href="https://disqus.com/?ref_noscript"
                className="text-[#2563eb] underline"
                target="_blank"
                rel="noreferrer"
              >
                comments powered by Disqus.
              </a>
            </noscript>
          </div>
        </div>
      </div>
    </section>
  );
};
