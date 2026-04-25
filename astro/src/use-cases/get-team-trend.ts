import type { TeamDto, TeamsService } from '@services/teams-service.ts';
import type { SurveyRunService } from '@services/survey-run-service.ts';
import type { AssessmentService } from '@services/assessment-service.ts';

export type TrendPoint = {
  surveyRunId: string;
  surveyRunTitle: string;
  score: number | null;
};

export type DoraCapabilityTrend = {
  doraCapabilityId: string;
  doraCapabilityName: string;
  latestScore: number | null;
  points: TrendPoint[];
};

export type TeamTrend = {
  team: TeamDto;
  capabilityTrends: DoraCapabilityTrend[];
  surveyCount: number;
};

export class TeamTrendNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TeamTrendNotFoundError';
  }
}

export class GetTeamTrendUseCase {
  constructor(
    private readonly teamsService: Pick<TeamsService, 'getTeam'>,
    private readonly surveyRunService: Pick<
      SurveyRunService,
      'getSurveyRunsByTeam'
    >,
    private readonly assessmentService: Pick<
      AssessmentService,
      'getAssessmentResultsForSurveys'
    >,
  ) {}

  async execute(teamId: string): Promise<TeamTrend> {
    const team = await this.getTeamOrThrow(teamId);
    const surveyRuns = await this.getSurveyRunsOrThrow(teamId);
    const chronological = [...surveyRuns].reverse();

    const assessmentResults =
      await this.assessmentService.getAssessmentResultsForSurveys(
        chronological,
      );

    const assessments = chronological.map((run, i) => ({
      run,
      assessment: assessmentResults[i] ?? null,
    }));

    const capabilityTrends = this.buildCapabilityTrends(assessments);

    return {
      team,
      capabilityTrends,
      surveyCount: chronological.length,
    };
  }

  private buildCapabilityTrends(
    assessments: Array<{
      run: { id: string; title: string };
      assessment: {
        doraCapabilityScores: Array<{
          doraCapabilityId: string;
          doraCapabilityName: string;
          score: number | null;
        }>;
      } | null;
    }>,
  ): DoraCapabilityTrend[] {
    const orderedCapabilityIds: string[] = [];
    const capabilityNames = new Map<string, string>();
    for (const { assessment } of assessments) {
      if (!assessment) continue;
      for (const score of assessment.doraCapabilityScores) {
        if (!capabilityNames.has(score.doraCapabilityId)) {
          orderedCapabilityIds.push(score.doraCapabilityId);
          capabilityNames.set(score.doraCapabilityId, score.doraCapabilityName);
        }
      }
    }

    return orderedCapabilityIds.map((capabilityId) => {
      const points: TrendPoint[] = assessments.map(({ run, assessment }) => {
        const capabilityScore = assessment?.doraCapabilityScores.find(
          (s) => s.doraCapabilityId === capabilityId,
        );
        return {
          surveyRunId: run.id,
          surveyRunTitle: run.title,
          score: capabilityScore?.score ?? null,
        };
      });

      const latestScore =
        [...points].reverse().find((p) => p.score !== null)?.score ?? null;

      return {
        doraCapabilityId: capabilityId,
        doraCapabilityName: capabilityNames.get(capabilityId) ?? 'Unknown',
        latestScore,
        points,
      };
    });
  }

  private async getTeamOrThrow(teamId: string) {
    try {
      return await this.teamsService.getTeam(teamId);
    } catch (error) {
      if (error instanceof Error && error.message === 'Team not found') {
        throw new TeamTrendNotFoundError('Team not found');
      }
      throw error;
    }
  }

  private async getSurveyRunsOrThrow(teamId: string) {
    try {
      return await this.surveyRunService.getSurveyRunsByTeam(
        teamId,
        true,
        'closed',
      );
    } catch (error) {
      if (error instanceof Error && error.message === 'Team not found') {
        throw new TeamTrendNotFoundError('Team not found');
      }
      throw error;
    }
  }
}
