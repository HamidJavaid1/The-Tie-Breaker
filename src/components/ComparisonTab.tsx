import React from "react";
import { ComparisonCriterion } from "../types";
import { Star } from "lucide-react";

interface ComparisonTabProps {
  comparisonCriteria: ComparisonCriterion[];
}

export default function ComparisonTab({ comparisonCriteria }: ComparisonTabProps) {
  if (!comparisonCriteria || comparisonCriteria.length === 0) {
    return <div className="text-center py-10 text-slate-400 font-bold uppercase tracking-widest text-xs">No comparison criteria available.</div>;
  }

  // List of options present in the criteria rating array
  const optionsList = comparisonCriteria[0]?.ratings.map((r) => r.optionName) || [];

  return (
    <div className="space-y-6">
      {/* Desktop Responsive Table View */}
      <div className="hidden md:block overflow-hidden border-2 border-slate-200 rounded-3xl bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-200 bg-slate-50">
              <th className="px-6 py-4 text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] w-[25%]">
                DIMENSION
              </th>
              {optionsList.map((opt, i) => (
                <th
                  key={opt}
                  className={`px-6 py-4 text-xs font-black uppercase tracking-wider border-l-2 border-slate-200 ${
                    i === 0 ? "bg-blue-50/50 text-blue-900" : "bg-emerald-50/50 text-emerald-900"
                  }`}
                >
                  {opt}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {comparisonCriteria.map((criterion, idx) => (
              <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-5 align-top">
                  <span className="font-display font-black text-slate-950 text-sm tracking-tight uppercase block mb-1">
                    {criterion.criterion}
                  </span>
                </td>

                {optionsList.map((optName, i) => {
                  const optRating = criterion.ratings.find((r) => r.optionName === optName);

                  return (
                    <td
                      key={optName}
                      className={`px-6 py-5 align-top border-l-2 border-slate-100 text-slate-700 text-xs space-y-2 ${
                        i === 0 ? "bg-blue-50/10" : "bg-emerald-50/10"
                      }`}
                    >
                      {/* Star Rating visualization */}
                      <div className="flex gap-1 items-center">
                        <div className="flex gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3.5 h-3.5 ${
                                i < (optRating?.rating || 0)
                                  ? "text-blue-600 fill-blue-600"
                                  : "text-slate-200"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono font-black text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded ml-1">
                          {optRating?.rating}/5
                        </span>
                      </div>

                      <p className="leading-relaxed text-slate-800 font-medium">
                        {optRating?.description}
                      </p>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Stacked View */}
      <div className="md:hidden space-y-4">
        {comparisonCriteria.map((criterion, idx) => (
          <div key={idx} className="bg-white rounded-2xl border-2 border-slate-200 p-5 space-y-4 shadow-xs">
            <h4 className="font-display font-black text-slate-950 text-sm tracking-tight uppercase border-b border-slate-100 pb-2">
              {criterion.criterion}
            </h4>
            <div className="grid grid-cols-1 gap-3">
              {criterion.ratings.map((rating, rIdx) => (
                <div key={rIdx} className="space-y-2 bg-[#F8FAFC] p-3.5 rounded-xl border border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-850">{rating.optionName}</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < rating.rating ? "text-blue-600 fill-blue-600" : "text-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-700 text-xs leading-relaxed font-medium">
                    {rating.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
