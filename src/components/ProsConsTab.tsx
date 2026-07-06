import React from "react";
import { OptionAnalysis, ProConItem } from "../types";
import { Plus, Sliders, ThumbsUp, ThumbsDown, Info, HelpCircle } from "lucide-react";

interface ProsConsTabProps {
  optionsAnalysis: OptionAnalysis[];
  multipliers: { [key: string]: number }; // Maps a unique key (optionName + text) to a multiplier (0 to 3)
  onMultiplierChange: (key: string, val: number) => void;
  calculatedScores: { [optionName: string]: number }; // Dynamically calculated match percentages
}

export default function ProsConsTab({
  optionsAnalysis,
  multipliers,
  onMultiplierChange,
  calculatedScores,
}: ProsConsTabProps) {
  // Helper to generate a unique key for any item
  const getItemKey = (optionName: string, text: string, type: "pro" | "con") => {
    return `${optionName}-${type}-${text.substring(0, 20)}`;
  };

  const getImpactBadge = (impact: "high" | "medium" | "low") => {
    switch (impact) {
      case "high":
        return "bg-red-50 text-red-600 border-red-200";
      case "medium":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "low":
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro info box */}
      <div className="bg-white border-2 border-slate-900 rounded-2xl p-5 flex gap-3 text-xs leading-relaxed text-slate-700 shadow-sm">
        <Info className="w-4 h-4 text-slate-900 shrink-0 mt-0.5" />
        <div>
          <span className="font-black text-slate-900 uppercase tracking-wide">Interactive Confidence Tuning: </span>
          Adjust the <strong>Importance Multiplier</strong> slider on any Pro or Con below. If a point is crucial to you, slide it to 2x or 3x. If you don't care about it, slide it to 0x. The decision scores will recalculate in real-time.
        </div>
      </div>

      {/* Side by side cards for each option */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {optionsAnalysis.map((analysis) => {
          const optionScore = calculatedScores[analysis.optionName] || 0;

          return (
            <div
              key={analysis.optionName}
              id={`option-card-${analysis.optionName.replace(/\s+/g, "-")}`}
              className="bg-white rounded-3xl border-2 border-slate-200 overflow-hidden shadow-sm flex flex-col"
            >
              {/* Card Header */}
              <div className="bg-slate-50 px-6 py-5 border-b-2 border-slate-200 flex justify-between items-center">
                <h3 className="font-display font-black text-slate-950 text-xl uppercase tracking-tight">{analysis.optionName}</h3>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">Weighted Fit:</span>
                  <span className="font-mono font-black text-slate-950 bg-white border-2 border-slate-900 px-3 py-1 rounded-lg text-sm shadow-sm">
                    {optionScore}%
                  </span>
                </div>
              </div>

              {/* Card body - Pros and Cons lists */}
              <div className="p-6 flex-1 space-y-6">
                {/* PROS LIST */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-600 flex items-center gap-1.5 border-b-2 border-emerald-100 pb-2">
                    <ThumbsUp className="w-4 h-4" /> PROS
                  </h4>

                  {analysis.pros.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No significant pros found.</p>
                  ) : (
                    <div className="space-y-4">
                      {analysis.pros.map((pro, idx) => {
                        const mKey = getItemKey(analysis.optionName, pro.text, "pro");
                        const currentMult = multipliers[mKey] !== undefined ? multipliers[mKey] : 1;

                        return (
                          <div
                            key={idx}
                            id={`pro-item-${idx}`}
                            className="bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 rounded-2xl p-4 space-y-3 transition-all"
                          >
                            <div className="flex gap-4 items-start justify-between">
                              <p className="text-slate-900 text-xs font-semibold leading-relaxed">{pro.text}</p>
                              <div className="flex gap-1.5 shrink-0 items-center">
                                <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                                  {pro.category}
                                </span>
                                <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${getImpactBadge(pro.impact)}`}>
                                  {pro.impact}
                                </span>
                              </div>
                            </div>

                            {/* Weighting Slider */}
                            <div className="flex items-center gap-3 pt-2.5 border-t border-slate-200/60">
                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                                Value Importance:
                              </span>
                              <input
                                id={`slider-${mKey}`}
                                type="range"
                                min="0"
                                max="3"
                                step="0.5"
                                className="flex-1 accent-emerald-600 h-1 bg-slate-200 rounded appearance-none cursor-pointer"
                                value={currentMult}
                                onChange={(e) => onMultiplierChange(mKey, parseFloat(e.target.value))}
                              />
                              <span className="text-[10px] font-mono font-black text-slate-900 w-8 text-right shrink-0">
                                {currentMult}x
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* CONS LIST */}
                <div className="space-y-4">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-1.5 border-b-2 border-rose-100 pb-2">
                    <ThumbsDown className="w-4 h-4" /> CONS
                  </h4>

                  {analysis.cons.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No significant cons found.</p>
                  ) : (
                    <div className="space-y-4">
                      {analysis.cons.map((con, idx) => {
                        const mKey = getItemKey(analysis.optionName, con.text, "con");
                        const currentMult = multipliers[mKey] !== undefined ? multipliers[mKey] : 1;

                        return (
                          <div
                            key={idx}
                            id={`con-item-${idx}`}
                            className="bg-[#F8FAFC] hover:bg-slate-100 border border-slate-200 rounded-2xl p-4 space-y-3 transition-all"
                          >
                            <div className="flex gap-4 items-start justify-between">
                              <p className="text-slate-900 text-xs font-semibold leading-relaxed">{con.text}</p>
                              <div className="flex gap-1.5 shrink-0 items-center">
                                <span className="text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                                  {con.category}
                                </span>
                                <span className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded border ${getImpactBadge(con.impact)}`}>
                                  {con.impact}
                                </span>
                              </div>
                            </div>

                            {/* Weighting Slider */}
                            <div className="flex items-center gap-3 pt-2.5 border-t border-slate-200/60">
                              <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider flex items-center gap-1 shrink-0">
                                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                                Risk Importance:
                              </span>
                              <input
                                id={`slider-${mKey}`}
                                type="range"
                                min="0"
                                max="3"
                                step="0.5"
                                className="flex-1 accent-rose-600 h-1 bg-slate-200 rounded appearance-none cursor-pointer"
                                value={currentMult}
                                onChange={(e) => onMultiplierChange(mKey, parseFloat(e.target.value))}
                              />
                              <span className="text-[10px] font-mono font-black text-slate-900 w-8 text-right shrink-0">
                                {currentMult}x
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
