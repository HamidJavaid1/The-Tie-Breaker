import React, { useState } from "react";
import { OptionAnalysis, ComparisonCriterion } from "../types";
import ProsConsTab from "./ProsConsTab";
import ComparisonTab from "./ComparisonTab";
import SwotTab from "./SwotTab";
import { ThumbsUp, Layers, Compass } from "lucide-react";

interface TabsContainerProps {
  optionsAnalysis: OptionAnalysis[];
  comparisonCriteria: ComparisonCriterion[];
  multipliers: { [key: string]: number };
  onMultiplierChange: (key: string, val: number) => void;
  calculatedScores: { [optionName: string]: number };
}

type TabType = "proscons" | "comparison" | "swot";

export default function TabsContainer({
  optionsAnalysis,
  comparisonCriteria,
  multipliers,
  onMultiplierChange,
  calculatedScores,
}: TabsContainerProps) {
  const [activeTab, setActiveTab] = useState<TabType>("proscons");

  return (
    <div className="space-y-6">
      {/* Tab Triggers */}
      <div className="flex border-b-2 border-slate-200 overflow-x-auto scrollbar-none">
        <button
          id="tab-trigger-proscons"
          className={`flex items-center gap-2 py-4 px-6 text-xs font-black uppercase tracking-widest border-b-4 -mb-[2px] transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "proscons"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-900"
          }`}
          onClick={() => setActiveTab("proscons")}
        >
          <ThumbsUp className="w-4 h-4" />
          PROS & CONS TUNING
        </button>
        <button
          id="tab-trigger-comparison"
          className={`flex items-center gap-2 py-4 px-6 text-xs font-black uppercase tracking-widest border-b-4 -mb-[2px] transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "comparison"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-900"
          }`}
          onClick={() => setActiveTab("comparison")}
        >
          <Layers className="w-4 h-4" />
          COMPARISON MATRIX
        </button>
        <button
          id="tab-trigger-swot"
          className={`flex items-center gap-2 py-4 px-6 text-xs font-black uppercase tracking-widest border-b-4 -mb-[2px] transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "swot"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-400 hover:text-slate-900"
          }`}
          onClick={() => setActiveTab("swot")}
        >
          <Compass className="w-4 h-4" />
          SWOT ANALYSIS
        </button>
      </div>

      {/* Tab Content Panels */}
      <div className="focus:outline-none">
        {activeTab === "proscons" && (
          <ProsConsTab
            optionsAnalysis={optionsAnalysis}
            multipliers={multipliers}
            onMultiplierChange={onMultiplierChange}
            calculatedScores={calculatedScores}
          />
        )}
        {activeTab === "comparison" && (
          <ComparisonTab comparisonCriteria={comparisonCriteria} />
        )}
        {activeTab === "swot" && <SwotTab optionsAnalysis={optionsAnalysis} />}
      </div>
    </div>
  );
}
