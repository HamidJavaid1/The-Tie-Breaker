import React, { useState } from "react";
import { Plus, Trash2, HelpCircle, Sparkles, Sliders, Info, Scale } from "lucide-react";

interface DecisionInputProps {
  onAnalyze: (payload: {
    dilemma: string;
    options: string[];
    context: string;
    weightPreferences: { [key: string]: number };
  }) => void;
  isLoading: boolean;
  prefillData?: { dilemma: string; options: string[]; context: string };
}

const PRESETS = [
  {
    title: "Quit job to go freelance?",
    dilemma: "Should I quit my corporate role to become a freelance developer?",
    options: ["Stay in corporate role", "Go fully freelance"],
    context: "I have 6 months of living expenses saved. I love autonomous work but dislike chasing clients. Financial stability is moderately important to me right now.",
  },
  {
    title: "Relocate from NYC to Austin?",
    dilemma: "Should I relocate from New York City to Austin, Texas?",
    options: ["Stay in New York City", "Move to Austin"],
    context: "I work in tech and enjoy warm weather. NYC is expensive but has unmatched energy. Austin is cheaper and warmer, but has less robust public transit.",
  },
  {
    title: "Buy an electric car?",
    dilemma: "Should I purchase a brand new electric car or keep my current reliable hybrid?",
    options: ["Purchase new electric vehicle", "Keep existing hybrid"],
    context: "My hybrid has no issues but is 6 years old. I care about carbon footprint, but also want to keep my monthly cash flow high for savings.",
  },
];

export default function DecisionInput({ onAnalyze, isLoading, prefillData }: DecisionInputProps) {
  const [dilemma, setDilemma] = useState(prefillData?.dilemma || "");
  const [options, setOptions] = useState<string[]>(prefillData?.options || ["", ""]);
  const [context, setContext] = useState(prefillData?.context || "");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [weights, setWeights] = useState({
    financial: 3,
    career: 3,
    personal: 3,
    wellness: 3,
    time: 3,
  });

  // Apply prefill data if triggered externally
  React.useEffect(() => {
    if (prefillData) {
      setDilemma(prefillData.dilemma);
      setOptions(prefillData.options);
      setContext(prefillData.context || "");
    }
  }, [prefillData]);

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  const addOption = () => {
    if (options.length < 5) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const updated = options.filter((_, i) => i !== index);
      setOptions(updated);
    }
  };

  const handleWeightChange = (key: keyof typeof weights, val: number) => {
    setWeights({
      ...weights,
      [key]: val,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOptions = options.map((o) => o.trim()).filter((o) => o !== "");
    if (!dilemma.trim()) return;
    if (cleanOptions.length < 2) return;

    onAnalyze({
      dilemma: dilemma.trim(),
      options: cleanOptions,
      context: context.trim(),
      weightPreferences: weights,
    });
  };

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setDilemma(preset.dilemma);
    setOptions(preset.options);
    setContext(preset.context);
  };

  return (
    <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 md:p-8 space-y-8 shadow-sm">
      <div className="flex flex-col pb-4 border-b-2 border-slate-100">
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600 mb-1">
          THE TIE BREAKER / STRATEGIC METRICS
        </p>
        <h2 className="font-display font-black text-2xl uppercase tracking-tight text-slate-950">
          Define Dilemma
        </h2>
      </div>

      {/* Preset suggestions */}
      <div className="space-y-3">
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 pb-2 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" /> QUICK-START PRESETS
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {PRESETS.map((preset, index) => (
            <button
              key={index}
              id={`preset-btn-${index}`}
              type="button"
              className="text-center text-[10px] font-black uppercase tracking-wider bg-[#F8FAFC] hover:bg-slate-100 border-2 border-slate-200 hover:border-slate-950 rounded-full py-3 px-4 transition-all text-slate-700 hover:text-slate-950 leading-tight"
              onClick={() => handleSelectPreset(preset)}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dilemma Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="dilemma-input" className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
            What decision do you need to make?
            <HelpCircle className="w-4 h-4 text-slate-400 cursor-help" title="Enter your primary question or choice conflict." />
          </label>
          <textarea
            id="dilemma-input"
            rows={2}
            className="w-full rounded-2xl border-2 border-slate-200 bg-[#F8FAFC] p-4 text-slate-900 text-sm font-semibold focus:bg-white focus:border-slate-950 transition-all outline-none placeholder:text-slate-400/80"
            placeholder="e.g., Should I move back to my hometown or stay in the city?"
            value={dilemma}
            onChange={(e) => setDilemma(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {/* Options Inputs */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-1">
            <label className="text-[11px] font-black uppercase tracking-widest text-slate-500">What are your choices/options?</label>
            {options.length < 5 && (
              <button
                id="add-option-btn"
                type="button"
                className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-500 flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 transition-all"
                onClick={addOption}
                disabled={isLoading}
              >
                <Plus className="w-3.5 h-3.5" /> Add Option
              </button>
            )}
          </div>
          <div className="space-y-3">
            {options.map((opt, index) => (
              <div key={index} className="flex gap-3 items-center">
                <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 border-2 border-slate-300 rounded-xl px-3 py-2 h-10 flex items-center justify-center min-w-[2.5rem]">
                  {index + 1}
                </span>
                <input
                  id={`option-input-${index}`}
                  type="text"
                  className="flex-1 rounded-2xl border-2 border-slate-200 bg-[#F8FAFC] px-4 py-2 text-slate-900 text-sm font-semibold focus:bg-white focus:border-slate-950 transition-all outline-none placeholder:text-slate-400"
                  placeholder={`Option ${index + 1} (e.g. Move hometown)`}
                  value={opt}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  required
                  disabled={isLoading}
                />
                {options.length > 2 && (
                  <button
                    id={`remove-option-btn-${index}`}
                    type="button"
                    className="p-2.5 text-slate-400 hover:text-red-500 rounded-xl hover:bg-red-50 transition-all"
                    onClick={() => removeOption(index)}
                    disabled={isLoading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Optional Context Input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="context-input" className="text-[11px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1">
            Personal Context & Constraints <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">(Optional)</span>
          </label>
          <textarea
            id="context-input"
            rows={2}
            className="w-full rounded-2xl border-2 border-slate-200 bg-[#F8FAFC] p-4 text-slate-900 text-sm font-semibold focus:bg-white focus:border-slate-950 transition-all outline-none placeholder:text-slate-400/80"
            placeholder="e.g., I have 10 years of professional experience. I value work-life balance over salary, and I am married with one child."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            disabled={isLoading}
          />
        </div>

        {/* Advanced Importance weights */}
        <div className="border-2 border-slate-200 rounded-2xl overflow-hidden bg-white">
          <button
            id="advanced-toggle-btn"
            type="button"
            className="w-full p-4 flex items-center justify-between text-left text-xs font-black uppercase tracking-widest text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-slate-500" />
              Adjust Metric Weightings
            </span>
            <span className="text-[9px] font-mono font-black text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded uppercase">
              {showAdvanced ? "Hide" : "Show Settings"}
            </span>
          </button>

          {showAdvanced && (
            <div className="p-5 border-t-2 border-slate-100 bg-white space-y-5 text-xs">
              <p className="text-slate-400 flex items-start gap-2 leading-relaxed">
                <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                These preferences guide the AI's final Recommendation Score based on what matters most to you.
              </p>

              <div className="space-y-4">
                {[
                  { key: "financial", label: "Financial Impact", desc: "Cost, earning potential, affordability" },
                  { key: "career", label: "Career & Growth", desc: "Skills development, professional growth" },
                  { key: "personal", label: "Personal Happiness", desc: "Joy, interest, family, standard of living" },
                  { key: "wellness", label: "Wellness & Peace", desc: "Stress level, peace of mind, health" },
                  { key: "time", label: "Time & Freedom", desc: "Schedule control, travel, daily commute" },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between font-black uppercase tracking-wider text-[10px]">
                      <span className="text-slate-700">{label}</span>
                      <span className="text-slate-900 font-mono">Weight: {weights[key as keyof typeof weights]}/5</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <input
                        id={`weight-slider-${key}`}
                        type="range"
                        min="1"
                        max="5"
                        className="flex-1 accent-slate-950 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                        value={weights[key as keyof typeof weights]}
                        onChange={(e) => handleWeightChange(key as keyof typeof weights, parseInt(e.target.value))}
                        disabled={isLoading}
                      />
                      <span className="text-[10px] text-slate-400 font-bold uppercase w-12 text-right tracking-wider">{desc.split(",")[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          id="analyze-submit-btn"
          type="submit"
          className={`w-full py-4 rounded-full text-white font-display font-black text-xs uppercase tracking-widest transition-all shadow-md active:scale-[0.98] cursor-pointer ${
            isLoading
              ? "bg-slate-700 text-slate-300 pointer-events-none"
              : "bg-blue-600 hover:bg-blue-500 hover:shadow-lg"
          }`}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              CONSULTING STRATEGIC MODELS...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              BREAK THE TIE <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
          )}
        </button>
      </form>
    </div>
  );
}
