import React from "react";
import { SavedDecision } from "../types";
import { History, Trash2, Calendar, ChevronRight } from "lucide-react";

interface HistorySidebarProps {
  history: SavedDecision[];
  onSelect: (decision: SavedDecision) => void;
  onDelete: (id: string) => void;
  activeId?: string;
}

export default function HistorySidebar({
  history,
  onSelect,
  onDelete,
  activeId,
}: HistorySidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r-2 border-slate-200">
      <div className="p-5 border-b-2 border-slate-100 flex flex-col justify-start">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-blue-600">
            THE TIE BREAKER
          </p>
          {history.length > 0 && (
            <span className="bg-slate-100 border-2 border-slate-200 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded font-mono">
              {history.length} ITEMS
            </span>
          )}
        </div>
        <h2 className="font-display font-black text-lg uppercase tracking-tight text-slate-950 mt-1">
          Decision History
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {history.length === 0 ? (
          <div className="text-center py-12 px-4 text-slate-400">
            <History className="w-8 h-8 mx-auto mb-3 opacity-30 stroke-[2]" />
            <p className="text-[10px] font-black uppercase tracking-wider">Your saved tie breakers will appear here.</p>
          </div>
        ) : (
          history.map((item) => {
            const formattedDate = new Date(item.createdAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });

            const isActive = item.id === activeId;

            return (
              <div
                key={item.id}
                id={`history-item-${item.id}`}
                className={`group relative flex flex-col p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  isActive
                    ? "bg-slate-950 border-slate-950 text-white shadow-md"
                    : "bg-[#F8FAFC] hover:bg-white hover:border-slate-950 border-slate-200 text-slate-700"
                }`}
                onClick={() => onSelect(item)}
              >
                <div className="pr-6">
                  <h3 className={`font-black line-clamp-2 text-sm leading-snug uppercase tracking-tight ${isActive ? "text-white" : "text-slate-950"}`}>
                    {item.dilemma}
                  </h3>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {item.options.map((opt, idx) => (
                    <span
                      key={idx}
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isActive ? "bg-slate-850 text-slate-200" : "bg-white border border-slate-200 text-slate-600"
                      }`}
                    >
                      {opt}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between text-[9px] font-mono font-black uppercase tracking-wider opacity-80">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formattedDate}
                  </span>
                  <span className="flex items-center gap-0.5 text-blue-600 group-hover:translate-x-0.5 transition-transform">
                    VIEW <ChevronRight className="w-3 h-3" />
                  </span>
                </div>

                <button
                  id={`delete-btn-${item.id}`}
                  title="Delete decision"
                  className={`absolute right-3 top-3 p-1 rounded transition-colors ${
                    isActive
                      ? "text-slate-400 hover:text-red-400 hover:bg-slate-800"
                      : "text-slate-400 hover:text-red-500 hover:bg-red-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
