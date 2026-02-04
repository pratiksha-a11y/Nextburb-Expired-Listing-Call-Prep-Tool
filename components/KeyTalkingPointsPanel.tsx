
import React, { useState, useEffect } from 'react';
import { Lead } from '../types';
import { GoogleGenAI, Type } from "@google/genai";

interface KeyTalkingPointsPanelProps {
  lead: Lead;
}

const KeyTalkingPointsPanel: React.FC<KeyTalkingPointsPanelProps> = ({ lead }) => {
  const [points, setPoints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    const generatePoints = async () => {
      setStatusMessage(null);
      // Dynamic fallback points tailored to the lead's specific data (Locally computed Nextburb AI Insights)
      const dataDrivenFallbacks = [
        `Address the discrepancy between the $${(lead.originalListPrice || 0).toLocaleString()} initial ask and the $${(lead.finalListPrice || 0).toLocaleString()} final list price.`,
        `Focus on the ${lead.daysOnMarket}-day market exposure period and why the current local demand didn't absorb the property at this price.`,
        `Propose a "market reset" strategy to overcome the stigma of the expired status and re-engage qualified local buyers.`
      ];

      setIsLoading(true);
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Generate 3 strategic talking points for a real estate agent calling a seller whose listing just expired.
        
        Property Context:
        - Address: ${lead.address}
        - Type: ${lead.propertyType}
        - Days on Market: ${lead.daysOnMarket}
        - Original Price: $${(lead.originalListPrice || 0).toLocaleString()}
        - Final Price: $${(lead.finalListPrice || 0).toLocaleString()}
        - Price Drop: ${lead.totalPriceReductionPct || 0}%
        
        Requirements:
        - Professional, data-driven tone.
        - One concise sentence per point.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                talkingPoints: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of 3 talking points"
                }
              },
              required: ["talkingPoints"]
            }
          }
        });

        const data = JSON.parse(response.text || "{}");
        setPoints(data.talkingPoints || dataDrivenFallbacks);
      } catch (error: any) {
        /**
         * Catch Quota (429) or other API errors.
         * We serve high-quality data-driven fallbacks so the user is never stuck.
         */
        const isQuotaError = error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED');
        
        if (isQuotaError) {
          setStatusMessage("[AI Insights] API quota exceeded. Providing data-driven fallbacks.");
        } else {
          console.error("[AI Insights Error]", error);
        }
        setPoints(dataDrivenFallbacks);
      } finally {
        setIsLoading(false);
      }
    };

    if (lead.address) {
      generatePoints();
    }
  }, [lead.address, lead.originalListPrice, lead.finalListPrice, lead.daysOnMarket, lead.totalPriceReductionPct, lead.propertyType]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6 animate-in fade-in slide-in-from-top-1 duration-500">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-blue-50 p-1.5 rounded-lg">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3 className="font-bold text-slate-900 text-[13px] uppercase tracking-wide">Nextburb AI Insights</h3>
        </div>
        
        <div className="flex items-center gap-4">
          {statusMessage && (
            <div className="bg-amber-50 text-amber-700 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-amber-100 flex items-center gap-2 animate-in fade-in zoom-in-95">
              <svg className="w-3 h-3 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {statusMessage}
            </div>
          )}
          {isLoading && (
            <span className="flex items-center gap-2 text-[11px] font-bold text-blue-600 uppercase animate-pulse">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              Analyzing Lead...
            </span>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {isLoading && points.length === 0 ? (
          [1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <span className="shrink-0 w-1 h-12 bg-slate-100 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-slate-100 rounded w-full"></div>
                <div className="h-3 bg-slate-100 rounded w-4/5"></div>
              </div>
            </div>
          ))
        ) : (
          points.length > 0 ? points.map((point, idx) => (
            <div key={idx} className="flex gap-4 group">
              <span className="shrink-0 w-1 h-auto bg-blue-500 rounded-full transition-all group-hover:scale-y-110" />
              <p className="text-[13px] text-slate-600 leading-relaxed font-semibold">{point}</p>
            </div>
          )) : (
            <p className="text-[13px] text-slate-400 italic">Insights currently unavailable.</p>
          )
        )}
      </div>
    </div>
  );
};

export default KeyTalkingPointsPanel;
