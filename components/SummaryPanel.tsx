
import React from 'react';
import { Confidence } from '../types';

interface SummaryPanelProps {
  title: string;
  bullets: string[];
  confidence: Confidence;
  confidenceReason?: string;
  badge?: string;
  onCopy: () => void;
}

const SummaryPanel: React.FC<SummaryPanelProps> = ({ title, bullets, confidence, confidenceReason, badge }) => {
  const confidenceColors = {
    [Confidence.HIGH]: 'text-green-700 bg-green-50 border-green-200',
    [Confidence.MEDIUM]: 'text-yellow-700 bg-yellow-50 border-yellow-200',
    [Confidence.LOW]: 'text-red-700 bg-red-50 border-red-200',
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6">
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-bold text-slate-900">{title} Summary</h3>
            {badge && (
              <span className="bg-red-50 text-red-600 text-[11px] font-bold px-2 py-0.5 rounded border border-red-100 uppercase tracking-wide">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <div className="relative group">
              <span 
                tabIndex={0}
                className={`cursor-help text-[11px] font-bold px-2.5 py-0.5 rounded-full border focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-400 uppercase tracking-tight ${confidenceColors[confidence]}`}
                aria-label={`Confidence level: ${confidence}. ${confidenceReason}`}
              >
                {confidence} Confidence
              </span>
              {confidenceReason && (
                <div className="absolute left-0 bottom-full mb-3 hidden group-hover:block group-focus:block z-[60] w-64 bg-slate-900 text-white text-[11px] p-3 rounded-xl shadow-2xl pointer-events-none leading-relaxed font-medium">
                  {confidenceReason}
                  <div className="absolute left-4 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-slate-900"></div>
                </div>
              )}
            </div>
            <span className="text-[11px] font-medium text-slate-400">Analysis complete</span>
          </div>
        </div>
      </div>
      <ul className="space-y-3.5">
        {bullets.map((bullet, idx) => (
          <li key={idx} className="flex items-start gap-4 text-slate-600 group">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 shrink-0 group-hover:scale-125 transition-transform" aria-hidden="true" />
            <span className="leading-relaxed text-[13px] font-medium">{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SummaryPanel;