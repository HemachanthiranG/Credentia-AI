import React from 'react';

interface MetabaseIframeProps {
  dashboardId: number;
  title: string;
}

export const MetabaseIframe: React.FC<MetabaseIframeProps> = ({ dashboardId, title }) => {
  // Production Note: The backend API must generate a signed JWT iframe URL using MB_SECRET_KEY
  // We represent the embedding infrastructure stub below:
  const embedUrl = `http://localhost:3000/public/dashboard/${dashboardId}#bordered=false&titled=false`;

  return (
    <div className="w-full h-full min-h-[400px] flex flex-col relative rounded-2xl overflow-hidden glass-panel group">
      
      {/* Overlay to inform that it is embedding Metabase Analytics gracefully */}
      <div className="absolute inset-0 bg-dark-bg/60 backdrop-blur-sm flex items-center justify-center opacity-100 hover:opacity-0 transition-opacity duration-500 z-10 pointer-events-none">
        <div className="text-center">
            <h3 className="text-brand-500 font-medium tracking-wide mb-1">Metabase Embedded View Active</h3>
            <p className="text-slate-400 text-sm font-light">Loading Analytics Graph ID: {dashboardId}</p>
        </div>
      </div>
      
      <iframe
        src={embedUrl}
        frameBorder="0"
        width="100%"
        height="100%"
        allowTransparency
        title={title}
        className="flex-1 opacity-20 filter grayscale blur-[2px] transition-all duration-700 group-hover:blur-0 group-hover:grayscale-0 group-hover:opacity-100" 
      ></iframe>
      
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-dark-bg via-dark-bg/80 to-transparent pointer-events-none">
        <div className="text-xs text-slate-500 font-medium tracking-wide">Secured analytics powered by Metabase + PostgreSQL</div>
      </div>
    </div>
  );
}
