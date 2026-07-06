export interface DecisionOption {
  name: string;
}

export interface ProConItem {
  text: string;
  impact: 'high' | 'medium' | 'low';
  score: number; // 1-5
  category: string;
}

export interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface OptionAnalysis {
  optionName: string;
  pros: ProConItem[];
  cons: ProConItem[];
  swot: SWOTData;
}

export interface CriterionRating {
  optionName: string;
  rating: number; // 1-5
  description: string;
}

export interface ComparisonCriterion {
  criterion: string;
  ratings: CriterionRating[];
}

export interface Verdict {
  recommendedOption: string;
  matchScore: number; // 0-100
  analysisText: string;
  devilsAdvocate: string;
}

export interface DecisionResult {
  verdict: Verdict;
  optionsAnalysis: OptionAnalysis[];
  comparisonCriteria: ComparisonCriterion[];
}

export interface SavedDecision {
  id: string;
  dilemma: string;
  options: string[];
  context?: string;
  createdAt: string;
  result: DecisionResult;
  userAdjustments?: {
    [key: string]: number; // Maps pro/con text hash to custom multiplier (e.g., 0.5 to 2.5)
  };
}
