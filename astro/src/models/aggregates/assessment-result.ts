export type DoraCapabilityScore = {
  doraCapabilityId: string;
  doraCapabilityName: string;
  score: number | null;
  responseCount: number;
};

export type OverallSummary = {
  overallScore: number | null;
  totalDoraCapabilities: number;
  totalResponses: number;
};

export type AssessmentResult = {
  surveyRunId: string;
  teamId: string;
  doraCapabilityScores: DoraCapabilityScore[];
  overallSummary: OverallSummary;
};
