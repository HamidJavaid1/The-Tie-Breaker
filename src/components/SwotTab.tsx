import React, { useState } from "react";
import { OptionAnalysis } from "../types";
import { ArrowUpRight, AlertTriangle, ShieldCheck, Zap } from "lucide-react";

interface SwotTabProps {
  optionsAnalysis: OptionAnalysis[];
}

export default function SwotTab({ optionsAnalysis }: SwotTabProps) {
  const [selectedOption, setSelectedOption] = useState(optionsAnalysis[0]?.optionName || "");

  const activeAnalysis = optionsAnalysis.find((a) => a.optionName === selectedOption) || optionsAnalysis[0];

  if (!activeAnalysis) {
    return <div className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs">No SWOT data available.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Option Selector Toggle */}
      <div className="flex gap-2 border-b-2 border-slate-100 pb-4 overflow-x-auto">
        {optionsAnalysis.map((analysis) => (
          <button
            key={analysis.optionName}
            id={`swot-opt-toggle-${analysis.optionName.replace(/\s+/g, "-")}`}
            className={`px-5 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-full transition-all cursor-pointer whitespace-nowrap border-2 ${
              selectedOption === analysis.optionName
                ? "bg-slate-950 border-slate-950 text-white shadow-md"
                : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-900"
            }`}
            onClick={() => setSelectedOption(analysis.optionName)}
          >
            {analysis.optionName}
          </button>
        ))}
      </div>

      {/* SWOT Quadrant Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STRENGTHS */}
        <div className="bg-white border-2 border-slate-200 hover:border-blue-600 rounded-3xl p-6 space-y-4 flex flex-col transition-all duration-200">
          <div className="flex items-center gap-2.5 text-blue-600">
            <div className="p-1.5 bg-blue-50 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-display font-black text-xs uppercase tracking-[0.15em]">
              STRENGTHS (INTERNAL POSITIVES)
            </h4>
          </div>
          <ul className="space-y-3 flex-1 border-t border-slate-100 pt-3">
            {activeAnalysis.swot.strengths.map((item, idx) => (
              <li key={idx} className="flex gap-2 text-slate-900 text-xs items-start leading-relaxed font-semibold">
                <span className="text-blue-500 font-black select-none shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
            {activeAnalysis.swot.strengths.length === 0 && (
              <li className="text-slate-400 italic text-xs">No strengths defined.</li>
            )}
          </ul>
        </div>

        {/* WEAKNESSES */}
        <div className="bg-white border-2 border-slate-200 hover:border-red-500 rounded-3xl p-6 space-y-4 flex flex-col transition-all duration-200">
          <div className="flex items-center gap-2.5 text-red-500">
            <div className="p-1.5 bg-red-50 rounded-lg">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h4 className="font-display font-black text-xs uppercase tracking-[0.15em]">
              WEAKNESSES (INTERNAL NEGATIVES)
            </h4>
          </div>
          <ul className="space-y-3 flex-1 border-t border-slate-100 pt-3">
            {activeAnalysis.swot.weaknesses.map((item, idx) => (
              <li key={idx} className="flex gap-2 text-slate-900 text-xs items-start leading-relaxed font-semibold">
                <span className="text-red-500 font-black select-none shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
            {activeAnalysis.swot.weaknesses.length === 0 && (
              <li className="text-slate-400 italic text-xs">No weaknesses defined.</li>
            )}
          </ul>
        </div>

        {/* OPPORTUNITIES */}
        <div className="bg-white border-2 border-slate-200 hover:border-emerald-500 rounded-3xl p-6 space-y-4 flex flex-col transition-all duration-200">
          <div className="flex items-center gap-2.5 text-emerald-500">
            <div className="p-1.5 bg-emerald-50 rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="font-display font-black text-xs uppercase tracking-[0.15em]">
              OPPORTUNITIES (EXTERNAL POSITIVES)
            </h4>
          </div>
          <ul className="space-y-3 flex-1 border-t border-slate-100 pt-3">
            {activeAnalysis.swot.opportunities.map((item, idx) => (
              <li key={idx} className="flex gap-2 text-slate-900 text-xs items-start leading-relaxed font-semibold">
                <span className="text-emerald-500 font-black select-none shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
            {activeAnalysis.swot.opportunities.length === 0 && (
              <li className="text-slate-400 italic text-xs">No opportunities defined.</li>
            )}
          </ul>
        </div>

        {/* THREATS */}
        <div className="bg-white border-2 border-slate-200 hover:border-orange-500 rounded-3xl p-6 space-y-4 flex flex-col transition-all duration-200">
          <div className="flex items-center gap-2.5 text-orange-500">
            <div className="p-1.5 bg-orange-50 rounded-lg">
              <ArrowUpRight className="w-4 h-4" />
            </div>
            <h4 className="font-display font-black text-xs uppercase tracking-[0.15em]">
              THREATS (EXTERNAL NEGATIVES)
            </h4>
          </div>
          <ul className="space-y-3 flex-1 border-t border-slate-100 pt-3">
            {activeAnalysis.swot.threats.map((item, idx) => (
              <li key={idx} className="flex gap-2 text-slate-900 text-xs items-start leading-relaxed font-semibold">
                <span className="text-orange-500 font-black select-none shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
            {activeAnalysis.swot.threats.length === 0 && (
              <li className="text-slate-400 italic text-xs">No threats defined.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
