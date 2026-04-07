import type { User } from '@models/aggregates/user.ts';

export class UserAlreadyTeamMemberError extends Error {
  constructor(userEmail: string) {
    super(`User ${userEmail} is already a member of this team`);
    this.name = 'UserAlreadyTeamMemberError';
  }
}

export class CannotRemoveLastTeamLeadError extends Error {
  constructor() {
    super('Cannot remove the last team lead');
    this.name = 'CannotRemoveLastTeamLeadError';
  }
}

export class CannotDemoteLastTeamLeadError extends Error {
  constructor() {
    super('Cannot demote the last team lead');
    this.name = 'CannotDemoteLastTeamLeadError';
  }
}

export class MemberNotFoundError extends Error {
  constructor(userId: string) {
    super(`Member with user ID ${userId} not found in this team`);
    this.name = 'MemberNotFoundError';
  }
}

export class Team {
  private _name: string;
  private _members: TeamMember[] = [];

  constructor(
    public readonly id: string,
    name: string,
    public description: string | null,
  ) {
    this.validateName(name);
    this._name = name;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this.validateName(value);
    this._name = value;
  }

  get members(): TeamMember[] {
    return [...this._members];
  }

  addMember(user: User, role: TeamMemberRole): TeamMember {
    if (this._members.some((m) => m.userId === user.id)) {
      throw new UserAlreadyTeamMemberError(user.email);
    }

    const member = new TeamMember(
      crypto.randomUUID(),
      this.id,
      user.id,
      user.email,
      role,
    );
    this._members.push(member);
    return member;
  }

  removeMember(userId: string): void {
    const memberIndex = this._members.findIndex((m) => m.userId === userId);
    if (memberIndex === -1) {
      throw new MemberNotFoundError(userId);
    }

    const member = this._members[memberIndex];

    if (member.role === 'team-lead') {
      const teamLeadCount = this._members.filter(
        (m) => m.role === 'team-lead',
      ).length;
      if (teamLeadCount <= 1) {
        throw new CannotRemoveLastTeamLeadError();
      }
    }

    this._members.splice(memberIndex, 1);
  }

  changeMemberRole(userId: string, newRole: TeamMemberRole): void {
    const memberIndex = this._members.findIndex((m) => m.userId === userId);
    if (memberIndex === -1) {
      throw new MemberNotFoundError(userId);
    }

    const member = this._members[memberIndex];

    if (member.role === 'team-lead' && newRole === 'regular-member') {
      const teamLeadCount = this._members.filter(
        (m) => m.role === 'team-lead',
      ).length;
      if (teamLeadCount <= 1) {
        throw new CannotDemoteLastTeamLeadError();
      }
    }

    member.role = newRole;
  }

  static reconstitute(
    id: string,
    name: string,
    description: string | null,
    members: TeamMember[],
  ): Team {
    const team = new Team(id, name, description);
    team._members = members;
    return team;
  }

  private validateName(name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Team name cannot be empty');
    }
    if (trimmedName.length < 3) {
      throw new Error('Name must be at least 3 characters long');
    }
    if (trimmedName.length > 100) {
      throw new Error('Team name cannot exceed 100 characters');
    }
  }
}

export class TeamMember {
  constructor(
    public readonly id: string,
    public readonly teamId: string,
    public readonly userId: string,
    public readonly userEmail: string,
    public role: TeamMemberRole,
  ) {}
}

export type TeamMemberRole = 'team-lead' | 'regular-member';
