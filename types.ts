
export interface Blocker {
  text: string;
  impact: number; // 0-100 percentage
}

export interface AnalysisResult {
  pulse: string;
  blockers: Blocker[];
  actionItems: string[];
}

export interface UserState {
  credits: number;
  userId: string;
  isLoggedIn: boolean;
}
