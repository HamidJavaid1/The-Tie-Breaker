import React, { useState } from "react";
import { Verdict } from "../types";
import { Sparkles, ShieldAlert, CheckCircle, ArrowRight, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface VerdictCardProps {
  verdict: Verdict;
  onReset: () => void;
}

export default function VerdictCard({ verdict, onReset }: VerdictCardProps) {
  const [showDevilsAdvocate, setShowDevilsAdvocate] = useState(false);

  return (
    <div className="overflow-hidden rounded-3xl shadow-xl border border-slate-200">
      {/* Recommended Option Header (The Stark Black Footer block from template design) */}
      <div className="bg-slate-950 text-white px-6 py-6 md:px-10 md:py-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10 flex-1">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-500 mb-1">
              DECISION VERDICT
            </p>
            <p className="text-2xl md:text-3xl font-black uppercase tracking-tight text-emerald-400">
              {verdict.recommendedOption}
            </p>
          </div>

          <div className="hidden md:block h-12 w-[1px] bg-white/15"></div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-1">
              ALIGNMENT SCORE
            </p>
            <p className="text-2xl md:text-3xl font-black tracking-tight text-white">
              {verdict.matchScore}%
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap gap-3 shrink-0">
          <button
            id="toggle-devils-advocate"
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
              showDevilsAdvocate
                ? "bg-red-950 border-red-800 text-red-200 hover:bg-red-900"
                : "border-white/20 text-white hover:bg-white/10"
            }`}
            onClick={() => setShowDevilsAdvocate(!showDevilsAdvocate)}
          >
            {showDevilsAdvocate ? "Deactivate Advocate" : "Devil's Advocate"}
          </button>
          
          <button
            id="new-decision-btn"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-[0.98] cursor-pointer"
            onClick={onReset}
          >
            New Dilemma
          </button>
        </div>
      </div>

      {/* Rationale and Advocacy Body */}
      <div className="bg-white p-6 md:p-8 space-y-6">
        {/* Devil's Advocate Argument (Expanded conditionally inline) */}
        <AnimatePresence>
          {showDevilsAdvocate && (
            <motion.div
              initial={{ height: 0, opacity: 0, marginBottom: 0 }}
              animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
              exit={{ height: 0, opacity: 0, marginBottom: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden border border-red-200 bg-red-50/50 rounded-2xl"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center gap-2.5 text-red-900">
                  <div className="p-1.5 bg-red-100 text-red-600 rounded-lg shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <h4 className="font-display font-black text-xs uppercase tracking-wider">
                    DEVIL'S ADVOCATE CRITIQUE
                  </h4>
                </div>
                <p className="text-red-950 text-sm leading-relaxed italic bg-white/80 rounded-xl p-4 border border-red-100">
                  {verdict.devilsAdvocate}
                </p>
                <p className="text-[10px] text-red-600 font-bold leading-normal uppercase tracking-wider">
                  ⚠️ Note: This critique highlights extreme failure vectors. Treat these risks as core parameters in your execution strategy.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Narrative Strategic Rationale */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2">
            STRATEGIC RATIONALE REPORT
          </h2>
          <p className="text-slate-800 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium pl-1">
            {verdict.analysisText}
          </p>
        </div>
      </div>
    </div>
  );
}
