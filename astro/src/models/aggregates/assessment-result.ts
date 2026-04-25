export type DoraCapabilityScore = {
  doraCapabilityId: string;
  doraCapabilityName: string;
  score: number | null;
  responseCount: number;
};

export type AssessmentResult = {
  surveyRunId: string;
  teamId: string;
  doraCapabilityScores: DoraCapabilityScore[];
};
