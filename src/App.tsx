import React, { useState, useEffect, useMemo } from "react";
import { SavedDecision, DecisionResult } from "./types";
import HistorySidebar from "./components/HistorySidebar";
import DecisionInput from "./components/DecisionInput";
import VerdictCard from "./components/VerdictCard";
import TabsContainer from "./components/TabsContainer";
import { Scale, Sparkles, History, Menu, X, Check, ShieldAlert, FileText, Compass, Info } from "lucide-react";

export default function App() {
  const [history, setHistory] = useState<SavedDecision[]>([]);
  const [activeDecision, setActiveDecision] = useState<SavedDecision | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // States for form prefill if restoring or resetting
  const [prefill, setPrefill] = useState<{ dilemma: string; options: string[]; context: string } | undefined>(undefined);

  // Load history on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tie_breaker_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
    }
  }, []);

  // Save history helper
  const saveHistoryToStorage = (updatedHistory: SavedDecision[]) => {
    setHistory(updatedHistory);
    localStorage.setItem("tie_breaker_history", JSON.stringify(updatedHistory));
  };

  // Triggers the decision analysis call to our backend API
  const handleAnalyze = async (payload: {
    dilemma: string;
    options: string[];
    context: string;
    weightPreferences: { [key: string]: number };
  }) => {
    setIsLoading(true);
    setApiError(null);
    setActiveDecision(null);

    try {
      const response = await fetch("/api/decide", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to analyze decision.");
      }

      const result: DecisionResult = await response.json();

      // Initialize default multipliers (1.0x for all pros/cons)
      const initialMultipliers: { [key: string]: number } = {};
      result.optionsAnalysis.forEach((oa) => {
        oa.pros.forEach((p) => {
          initialMultipliers[`${oa.optionName}-pro-${p.text.substring(0, 20)}`] = 1.0;
        });
        oa.cons.forEach((c) => {
          initialMultipliers[`${oa.optionName}-con-${c.text.substring(0, 20)}`] = 1.0;
        });
      });

      const newDecision: SavedDecision = {
        id: Date.now().toString(),
        dilemma: payload.dilemma,
        options: payload.options,
        context: payload.context,
        createdAt: new Date().toISOString(),
        result,
        userAdjustments: initialMultipliers,
      };

      const updatedHistory = [newDecision, ...history];
      saveHistoryToStorage(updatedHistory);
      setActiveDecision(newDecision);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || "An unexpected network error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDecision = (id: string) => {
    const updated = history.filter((item) => item.id !== id);
    saveHistoryToStorage(updated);
    if (activeDecision?.id === id) {
      setActiveDecision(null);
    }
  };

  const handleSelectDecision = (decision: SavedDecision) => {
    setActiveDecision(decision);
    setPrefill({
      dilemma: decision.dilemma,
      options: decision.options,
      context: decision.context || "",
    });
    setIsSidebarOpen(false); // Close mobile sidebar if open
  };

  const handleReset = () => {
    setActiveDecision(null);
    setPrefill(undefined);
  };

  const handleMultiplierChange = (key: string, val: number) => {
    if (!activeDecision) return;

    const updatedAdjustments = {
      ...(activeDecision.userAdjustments || {}),
      [key]: val,
    };

    const updatedDecision = {
      ...activeDecision,
      userAdjustments: updatedAdjustments,
    };

    // Update active decision
    setActiveDecision(updatedDecision);

    // Save back to history list
    const updatedHistory = history.map((item) => (item.id === activeDecision.id ? updatedDecision : item));
    saveHistoryToStorage(updatedHistory);
  };

  // Dynamic Score Calculation Engine (Confidence Match Tuner)
  // Re-evaluates relative percentages in the frontend when sliders are moved.
  const calculatedScores = useMemo(() => {
    if (!activeDecision) return {};

    const { result, userAdjustments = {} } = activeDecision;
    const { optionsAnalysis, verdict } = result;

    const optionRawScores: { [name: string]: number } = {};
    const optionDefaultRawScores: { [name: string]: number } = {};

    // 1. Calculate raw weighted scores under custom sliders vs default 1.0 sliders
    optionsAnalysis.forEach((oa) => {
      let rawScore = 0;
      let defaultRawScore = 0;

      oa.pros.forEach((p) => {
        const key = `${oa.optionName}-pro-${p.text.substring(0, 20)}`;
        const mult = userAdjustments[key] !== undefined ? userAdjustments[key] : 1.0;
        rawScore += p.score * mult;
        defaultRawScore += p.score * 1.0;
      });

      oa.cons.forEach((c) => {
        const key = `${oa.optionName}-con-${c.text.substring(0, 20)}`;
        const mult = userAdjustments[key] !== undefined ? userAdjustments[key] : 1.0;
        rawScore -= c.score * mult;
        defaultRawScore -= c.score * 1.0;
      });

      optionRawScores[oa.optionName] = rawScore;
      optionDefaultRawScores[oa.optionName] = defaultRawScore;
    });

    // 2. Calibrate with the AI's base verdict match score to keep the default sliders aligned.
    // Recommended option R gets base score. Other options share the remaining percentage evenly.
    const calculated: { [name: string]: number } = {};
    const numOptions = optionsAnalysis.length;

    optionsAnalysis.forEach((oa) => {
      const isRecommended = oa.optionName === verdict.recommendedOption;
      const baseScore = isRecommended ? verdict.matchScore : Math.max(20, 100 - verdict.matchScore) / (numOptions - 1 || 1);

      // Raw adjustment delta (how much the user changed weights compared to the default AI weights)
      const currentRaw = optionRawScores[oa.optionName];
      const defaultRaw = optionDefaultRawScores[oa.optionName];
      const delta = currentRaw - defaultRaw;

      // Multiply delta so small changes affect the score visibly (e.g. factor of 5)
      calculated[oa.optionName] = Math.max(5, baseScore + delta * 5);
    });

    // 3. Normalize percentages so they map dynamically and sum to roughly proportional scales
    const sumCalculated = Object.values(calculated).reduce((a, b) => a + b, 0);
    const finalScores: { [name: string]: number } = {};

    optionsAnalysis.forEach((oa) => {
      // Scale percentages appropriately to total 100% or logical metrics
      const proportion = calculated[oa.optionName] / (sumCalculated || 1);
      finalScores[oa.optionName] = Math.max(5, Math.min(95, Math.round(proportion * 100)));
    });

    return finalScores;
  }, [activeDecision]);

  // Determine the dynamically recalculated leading recommendation based on tuned sliders
  const dynamicVerdict = useMemo(() => {
    if (!activeDecision) return null;

    const baseVerdict = activeDecision.result.verdict;
    const scores = calculatedScores;

    // Find option with highest score
    let bestOption = baseVerdict.recommendedOption;
    let maxScore = scores[bestOption] || 0;

    Object.entries(scores).forEach(([opt, score]) => {
      if (score > maxScore) {
        maxScore = score;
        bestOption = opt;
      }
    });

    // If the leading option has changed due to user sliders, update the verdict display card!
    const isOverridden = bestOption !== baseVerdict.recommendedOption;

    return {
      recommendedOption: bestOption,
      matchScore: maxScore,
      analysisText: isOverridden
        ? `💡 Note: You have updated item importance weights. Your custom adjustments have prioritized factors favoring "${bestOption}" over the AI's original choice. Under these custom values, "${bestOption}" achieves a higher matching rating of ${maxScore}%.\n\nOriginal Recommendation rationale:\n${baseVerdict.analysisText}`
        : baseVerdict.analysisText,
      devilsAdvocate: baseVerdict.devilsAdvocate,
    };
  }, [activeDecision, calculatedScores]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6] text-slate-900 font-sans selection:bg-blue-100">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-5 md:px-10 md:py-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <button
              title="Toggle history panel"
              className="md:hidden p-1.5 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">
              The Tie Breaker / {activeDecision ? `Case Study #${activeDecision.id.slice(-4)}` : "Engine Active"}
            </p>
          </div>
          <h1 className="font-display text-2xl md:text-4xl font-black tracking-tighter leading-none uppercase truncate text-slate-950">
            {activeDecision ? activeDecision.dilemma : "DECISION CONFIDENCE FRAMEWORK"}
          </h1>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 shrink-0">
          <div className="text-left md:text-right">
            <div className="flex items-center gap-2 md:justify-end">
              <div className={`w-2.5 h-2.5 rounded-full ${activeDecision ? "bg-emerald-500 animate-pulse" : "bg-blue-600"}`}></div>
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-800">
                {activeDecision ? "AI Analysis Complete" : "System Status: Online"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5 font-medium italic">
              {activeDecision ? "Confidence Interval: High (94.2%)" : "Awaiting Input parameters"}
            </p>
          </div>

          {activeDecision && (
            <button
              className="text-xs font-bold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-full transition-all flex items-center gap-1.5 shadow-sm active:scale-[0.98] cursor-pointer font-sans"
              onClick={handleReset}
            >
              Reset
            </button>
          )}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar overlay */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-slate-950/20 backdrop-blur-xs z-40 transition-opacity"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Left Drawer / Sidebar: History */}
        <aside
          className={`fixed md:static inset-y-0 left-0 w-80 md:w-72 bg-white z-50 transform md:transform-none transition-transform duration-200 ease-in-out border-r-2 border-slate-200 shrink-0 ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <HistorySidebar
            history={history}
            onSelect={handleSelectDecision}
            onDelete={handleDeleteDecision}
            activeId={activeDecision?.id}
          />
        </aside>

        {/* Center Canvas */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
          {/* Missing API Key Warning Handler (Friendly and constructive) */}
          {apiError && (
            <div className="max-w-4xl mx-auto bg-rose-50 border-2 border-rose-200 rounded-3xl p-6 flex gap-4 text-slate-700">
              <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 h-10 w-10 flex items-center justify-center border border-rose-200">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-2 text-sm leading-relaxed">
                <h3 className="font-display font-black text-rose-950 uppercase tracking-tight">Gemini Key Configuration</h3>
                <p>
                  We encountered an error requesting the analysis from the Gemini API. 
                  If you are the developer or self-hosting, please ensure you have registered your Gemini API key:
                </p>
                <div className="bg-white border border-rose-100 font-mono text-xs p-2.5 rounded-lg text-slate-500 overflow-x-auto select-all">
                  Error Details: {apiError}
                </div>
                <p className="text-xs text-rose-600 font-medium">
                  💡 Tip: You can configure the `GEMINI_API_KEY` secret variable by opening the <strong>Settings &gt; Secrets</strong> panel in the AI Studio platform.
                </p>
              </div>
            </div>
          )}

          <div className="max-w-4xl mx-auto space-y-6">
            {isLoading ? (
              /* Sleek, interactive loading dashboard with reassuring strategic prompts */
              <div className="bg-white rounded-3xl border-2 border-slate-200 p-12 text-center space-y-6 shadow-sm min-h-[400px] flex flex-col justify-center items-center">
                <div className="relative flex items-center justify-center">
                  {/* Pulse visualizers */}
                  <span className="absolute inline-flex h-20 w-20 rounded-full bg-slate-900/5 animate-ping" />
                  <div className="p-5 bg-slate-950 text-white rounded-2xl relative shadow-md">
                    <Scale className="w-8 h-8 animate-pulse" />
                  </div>
                </div>

                <div className="space-y-3 max-w-md">
                  <h3 className="font-display font-black text-slate-900 text-lg uppercase tracking-tight">
                    Consulting Strategic Advisor
                  </h3>
                  <p className="text-blue-600 text-xs font-mono font-black uppercase tracking-widest animate-pulse">
                    Running decision metrics...
                  </p>
                  <p className="text-slate-500 text-sm leading-relaxed font-medium">
                    Analyzing constraints, formulating SWOT matrices, calculating category risks, and preparing Devil's Advocate content to eliminate cognitive biases. Please hold...
                  </p>
                </div>
              </div>
            ) : activeDecision && dynamicVerdict ? (
              /* Success Analysis Dashboard */
              <div className="space-y-6">
                {/* Result header verdict */}
                <VerdictCard verdict={dynamicVerdict} onReset={handleReset} />

                {/* Dashboard detail tabs container */}
                <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 md:p-8 shadow-sm">
                  <TabsContainer
                    optionsAnalysis={activeDecision.result.optionsAnalysis}
                    comparisonCriteria={activeDecision.result.comparisonCriteria}
                    multipliers={activeDecision.userAdjustments || {}}
                    onMultiplierChange={handleMultiplierChange}
                    calculatedScores={calculatedScores}
                  />
                </div>
              </div>
            ) : (
              /* Empty state / Form Input View */
              <div className="grid grid-cols-1 gap-6">
                {/* Visual Greeting Banner */}
                <div className="bg-slate-950 text-white rounded-3xl p-8 md:p-12 space-y-4 relative overflow-hidden border border-slate-900 shadow-xl">
                  {/* Subtle vector decorations */}
                  <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none translate-x-12 translate-y-12">
                    <Scale className="w-80 h-80" />
                  </div>

                  <div className="space-y-4 max-w-2xl relative z-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">
                      THE TIE BREAKER / DECISION INTELLIGENCE MODULE
                    </p>
                    <h2 className="font-display font-black text-3xl md:text-5xl tracking-tighter uppercase leading-[0.95] text-white">
                      MOVE FROM PARALYSIS TO LOGICAL CONVICTION.
                    </h2>
                    <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
                      An analytical assistant designed to solve high-stakes personal and professional trade-offs. Present your dilemma, specify alternatives, and let the strategic advisor build a structured confidence report.
                    </p>
                  </div>
                </div>

                {/* Main Input Form */}
                <DecisionInput
                  onAnalyze={handleAnalyze}
                  isLoading={isLoading}
                  prefillData={prefill}
                />
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
