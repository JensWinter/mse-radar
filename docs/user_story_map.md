# User Story Map

This document provides a User Story Map for MSE Radar, organizing user stories by activities and tasks to support implementation planning.

---

## Overview

The User Story Map is organized around:
- **User Activities** (backbone): High-level goals users want to achieve
- **User Tasks**: Specific actions within each activity
- **User Stories**: Detailed requirements mapped to tasks
- **Release Slices**: Grouped by MoSCoW priority (Must/Should/Could)

### User Personas

| Persona | Description |
|:--------|:------------|
| **New User** | A person who wants to register and access the system |
| **Authenticated User** | A signed-in user who can create teams and participate |
| **Team Member** | A user authorized for a team who can answer surveys and view results |
| **Team Lead** | A team member with permissions to manage team, members, and survey runs |

---

## Story Map Visualization

```mermaid
block-beta
    columns 6
    
    %% Activities (Backbone)
    block:activities:6
        A1["🔐 Identity &\nAccess"]
        A2["👥 Team\nManagement"]
        A3["📋 Survey\nDefinition"]
        A4["✏️ Survey\nExecution"]
        A5["📊 Assessment &\nInsights"]
        A6["🎯 Improvement\nGuidance"]
    end
    
    space:6
    
    %% Must Have (Release 1)
    block:must1:1
        M1["Register\n(0001-001)"]
    end
    block:must2:1
        M2["Create Team\n(0003-001)"]
    end
    block:must3:1
        M3["DORA Survey\n(0007-001)"]
    end
    block:must4:1
        M4["Create Run\n(0008-001)"]
    end
    block:must5:1
        M5["Calculate\nScores\n(0015-001)"]
    end
    block:must6:1
        M6["Tailored\nGuidance\n(0017-001)"]
    end
    
    block:must1b:1
        M1b["Sign In\n(0002-001)"]
    end
    block:must2b:1
        M2b["Add Member\n(0004-001)"]
    end
    space:1
    block:must4b:1
        M4b["Open/Close\n(0009-001/2)"]
    end
    block:must5b:1
        M5b["View Profile\n(0016-001)"]
    end
    space:1
    
    block:must1c:1
        M1c["Sign Out\n(0002-002)"]
    end
    block:must2c:1
        M2c["Change Role\n(0005-001)"]
    end
    space:1
    block:must4c:1
        M4c["Submit\n(0011-001)"]
    end
    space:2

    %% Styling
    style A1 fill:#e1f5fe
    style A2 fill:#e8f5e9
    style A3 fill:#fff3e0
    style A4 fill:#fce4ec
    style A5 fill:#f3e5f5
    style A6 fill:#e0f2f1
```

---

## Detailed Story Map by Activity

### Activity 1: Identity & Access (Generic Subdomain)

Manages user identity, authentication, and global access control.

```mermaid
flowchart TB
    subgraph Activity["🔐 Identity & Access"]
        subgraph Tasks["Tasks"]
            T1[Register Account]
            T2[Authenticate]
            T3[Manage Session]
        end
    end
    
    subgraph Must["Must Have (M)"]
        S0001["0001-001<br/>User Registration"]
        S0002a["0002-001<br/>User Sign In"]
        S0002b["0002-002<br/>User Sign Out"]
    end
    
    subgraph Could["Could Have (C)"]
        S0034["0034-001<br/>SSO Authentication"]
    end
    
    T1 --> S0001
    T2 --> S0002a
    T2 --> S0034
    T3 --> S0002b
    
    style Must fill:#c8e6c9
    style Could fill:#fff9c4
```

| Story ID | Title | Priority | Estimate | Task |
|:---------|:------|:--------:|:--------:|:-----|
| 0001-001 | User Registration | M | M | Register Account |
| 0002-001 | User Sign In | M | M | Authenticate |
| 0002-002 | User Sign Out | M | S | Manage Session |
| 0034-001 | SSO Authentication | C | L | Authenticate |

---

### Activity 2: Team Management (Supporting Subdomain)

Manages team structure, membership, and role assignments.

```mermaid
flowchart TB
    subgraph Activity["👥 Team Management"]
        subgraph Tasks["Tasks"]
            T1[Create & Manage Team]
            T2[Manage Members]
            T3[Manage Roles]
            T4[Multi-Team Participation]
        end
    end
    
    subgraph Must["Must Have (M)"]
        S0003a["0003-001<br/>Create Team"]
        S0003b["0003-002<br/>View Team Details"]
        S0003c["0003-003<br/>Edit Team Details"]
        S0004a["0004-001<br/>Add Team Member"]
        S0004b["0004-002<br/>Remove Team Member"]
        S0005["0005-001<br/>Change Member Role"]
        S0006["0006-001<br/>Multiple Teams"]
    end
    
    T1 --> S0003a
    T1 --> S0003b
    T1 --> S0003c
    T2 --> S0004a
    T2 --> S0004b
    T3 --> S0005
    T4 --> S0006
    
    style Must fill:#c8e6c9
```

| Story ID | Title | Priority | Estimate | Task |
|:---------|:------|:--------:|:--------:|:-----|
| 0003-001 | Create Team | M | M | Create & Manage Team |
| 0003-002 | View Team Details | M | S | Create & Manage Team |
| 0003-003 | Edit Team Details | M | S | Create & Manage Team |
| 0004-001 | Add Team Member | M | M | Manage Members |
| 0004-002 | Remove Team Member | M | S | Manage Members |
| 0005-001 | Change Member Role | M | M | Manage Roles |
| 0006-001 | Multiple Teams | M | M | Multi-Team Participation |

---

### Activity 3: Survey Definition (Core Subdomain)

Defines the structure and content of surveys based on DORA capabilities.

```mermaid
flowchart TB
    subgraph Activity["📋 Survey Definition"]
        subgraph Tasks["Tasks"]
            T1[Define Survey Model]
            T2[Manage Capabilities]
            T3[Version Questions]
            T4[Customize Survey]
        end
    end
    
    subgraph Must["Must Have (M)"]
        S0007["0007-001<br/>DORA Capabilities Survey"]
    end
    
    subgraph Should["Should Have (S)"]
        S0019["0019-001<br/>Capability Drill-down"]
        S0022["0022-001<br/>Question Versioning"]
    end
    
    subgraph Could["Could Have (C)"]
        S0029["0029-001<br/>Customizable Survey"]
    end
    
    T1 --> S0007
    T2 --> S0019
    T3 --> S0022
    T4 --> S0029
    
    style Must fill:#c8e6c9
    style Should fill:#bbdefb
    style Could fill:#fff9c4
```

| Story ID | Title | Priority | Estimate | Task |
|:---------|:------|:--------:|:--------:|:-----|
| 0007-001 | DORA Capabilities Survey | M | L | Define Survey Model |
| 0019-001 | Capability Drill-down | S | M | Manage Capabilities |
| 0022-001 | Question Versioning | S | L | Version Questions |
| 0029-001 | Customizable Survey | C | L | Customize Survey |

---

### Activity 4: Survey Execution (Core Subdomain)

Manages the lifecycle of survey runs and collecting responses.

```mermaid
flowchart TB
    subgraph Activity["✏️ Survey Execution"]
        subgraph Tasks["Tasks"]
            T1[Manage Survey Runs]
            T2[Control Lifecycle]
            T3[Submit Responses]
            T4[Enforce Rules]
            T5[Track & Notify]
        end
    end
    
    subgraph Must["Must Have (M)"]
        S0008["0008-001<br/>Create Survey Run"]
        S0009a["0009-001<br/>Open Survey Run"]
        S0009b["0009-002<br/>Close Survey Run"]
        S0009c["0009-003<br/>Reopen Survey Run"]
        S0010["0010-001<br/>Survey Run Isolation"]
        S0011a["0011-001<br/>Submit Response"]
        S0011b["0011-002<br/>Edit Response"]
        S0012["0012-001<br/>Block When Not Open"]
        S0013["0013-001<br/>Block Non-Members"]
        S0014["0014-001<br/>Response Audit Trail"]
    end
    
    subgraph Should["Should Have (S)"]
        S0020["0020-001<br/>Schedule Survey Run"]
        S0021["0021-001<br/>Add Comments"]
        S0023["0023-001<br/>Pseudonymous Responses"]
    end
    
    subgraph Could["Could Have (C)"]
        S0024["0024-001<br/>Participation Tracking"]
        S0028["0028-001<br/>Survey Notifications"]
    end
    
    T1 --> S0008
    T1 --> S0010
    T2 --> S0009a
    T2 --> S0009b
    T2 --> S0009c
    T2 --> S0020
    T3 --> S0011a
    T3 --> S0011b
    T3 --> S0021
    T3 --> S0023
    T4 --> S0012
    T4 --> S0013
    T4 --> S0014
    T5 --> S0024
    T5 --> S0028
    
    style Must fill:#c8e6c9
    style Should fill:#bbdefb
    style Could fill:#fff9c4
```

| Story ID | Title | Priority | Estimate | Task |
|:---------|:------|:--------:|:--------:|:-----|
| 0008-001 | Create Survey Run | M | M | Manage Survey Runs |
| 0009-001 | Open Survey Run | M | S | Control Lifecycle |
| 0009-002 | Close Survey Run | M | S | Control Lifecycle |
| 0009-003 | Reopen Survey Run | M | S | Control Lifecycle |
| 0010-001 | Survey Run Isolation | M | M | Manage Survey Runs |
| 0011-001 | Submit Survey Response | M | M | Submit Responses |
| 0011-002 | Edit Survey Response | M | M | Submit Responses |
| 0012-001 | Block Responses When Not Open | M | S | Enforce Rules |
| 0013-001 | Block Non-Member Responses | M | S | Enforce Rules |
| 0014-001 | Response Audit Trail | M | M | Enforce Rules |
| 0020-001 | Schedule Survey Run | S | M | Control Lifecycle |
| 0021-001 | Add Comments to Answers | S | S | Submit Responses |
| 0023-001 | Pseudonymous Responses | S | L | Submit Responses |
| 0024-001 | Participation Tracking | C | M | Track & Notify |
| 0028-001 | Survey Notifications | C | M | Track & Notify |

---

### Activity 5: Assessment & Insights (Core Subdomain)

Computes scores, aggregates results, and provides visualizations.

```mermaid
flowchart TB
    subgraph Activity["📊 Assessment & Insights"]
        subgraph Tasks["Tasks"]
            T1[Calculate Scores]
            T2[Visualize Results]
            T3[Analyze Trends]
            T4[Export & Share]
        end
    end
    
    subgraph Must["Must Have (M)"]
        S0015["0015-001<br/>Calculate Capability Scores"]
        S0016["0016-001<br/>View Capability Profile"]
    end
    
    subgraph Should["Should Have (S)"]
        S0018["0018-001<br/>Trend View"]
    end
    
    subgraph Could["Could Have (C)"]
        S0025["0025-001<br/>Confidence & Disagreement"]
        S0026["0026-001<br/>Export Results"]
        S0027["0027-001<br/>Workshop View"]
    end
    
    T1 --> S0015
    T2 --> S0016
    T2 --> S0025
    T3 --> S0018
    T4 --> S0026
    T4 --> S0027
    
    style Must fill:#c8e6c9
    style Should fill:#bbdefb
    style Could fill:#fff9c4
```

| Story ID | Title | Priority | Estimate | Task |
|:---------|:------|:--------:|:--------:|:-----|
| 0015-001 | Calculate Capability Scores | M | M | Calculate Scores |
| 0016-001 | View Capability Profile | M | M | Visualize Results |
| 0018-001 | Trend View | S | M | Analyze Trends |
| 0025-001 | Confidence and Disagreement | C | M | Visualize Results |
| 0026-001 | Export Results | C | M | Export & Share |
| 0027-001 | Workshop View | C | M | Export & Share |

---

### Activity 6: Improvement Guidance (Core Subdomain)

Provides tailored improvement advice based on assessed capability levels.

```mermaid
flowchart TB
    subgraph Activity["🎯 Improvement Guidance"]
        subgraph Tasks["Tasks"]
            T1[Provide Guidance]
            T2[Suggest Improvements]
            T3[AI Assistance]
            T4[Tool Integration]
        end
    end
    
    subgraph Must["Must Have (M)"]
        S0017["0017-001<br/>Tailored Improvement Guidance"]
    end
    
    subgraph Could["Could Have (C)"]
        S0030["0030-001<br/>Next Best Improvements"]
        S0031["0031-001<br/>Chat Assistant"]
        S0032["0032-001<br/>Project Tools Integration"]
        S0033["0033-001<br/>Multi-Language UI"]
    end
    
    T1 --> S0017
    T2 --> S0030
    T3 --> S0031
    T4 --> S0032
    T4 --> S0033
    
    style Must fill:#c8e6c9
    style Could fill:#fff9c4
```

| Story ID | Title | Priority | Estimate | Task |
|:---------|:------|:--------:|:--------:|:-----|
| 0017-001 | Tailored Improvement Guidance | M | L | Provide Guidance |
| 0030-001 | Next Best Improvements | C | M | Suggest Improvements |
| 0031-001 | Chat Assistant | C | L | AI Assistance |
| 0032-001 | Project Tools Integration | C | L | Tool Integration |
| 0033-001 | Multi-Language UI | C | L | Tool Integration |

---

## Release Slices

### Release 1: MVP (Must Have)

Core functionality to enable basic team assessment workflow.

```mermaid
flowchart LR
    subgraph R1["Release 1: MVP"]
        direction TB
        subgraph IA["Identity & Access"]
            R1_1["0001-001 Register"]
            R1_2["0002-001 Sign In"]
            R1_3["0002-002 Sign Out"]
        end
        subgraph TM["Team Management"]
            R1_4["0003-001 Create Team"]
            R1_5["0003-002 View Team"]
            R1_6["0003-003 Edit Team"]
            R1_7["0004-001 Add Member"]
            R1_8["0004-002 Remove Member"]
            R1_9["0005-001 Change Role"]
            R1_10["0006-001 Multi Teams"]
        end
        subgraph SD["Survey Definition"]
            R1_11["0007-001 DORA Survey"]
        end
        subgraph SE["Survey Execution"]
            R1_12["0008-001 Create Run"]
            R1_13["0009-001/2/3 Lifecycle"]
            R1_14["0010-001 Isolation"]
            R1_15["0011-001/2 Responses"]
            R1_16["0012-001 Block Closed"]
            R1_17["0013-001 Block Non-Member"]
            R1_18["0014-001 Audit Trail"]
        end
        subgraph AI["Assessment"]
            R1_19["0015-001 Scores"]
            R1_20["0016-001 Profile"]
        end
        subgraph IG["Guidance"]
            R1_21["0017-001 Guidance"]
        end
    end
    
    IA --> TM --> SD --> SE --> AI --> IG
```

**Total Stories: 21** | **Estimated Effort: M-L**

| # | Story | Context | Estimate |
|:-:|:------|:--------|:--------:|
| 1 | 0001-001 User Registration | Identity & Access | M |
| 2 | 0002-001 User Sign In | Identity & Access | M |
| 3 | 0002-002 User Sign Out | Identity & Access | S |
| 4 | 0003-001 Create Team | Team Management | M |
| 5 | 0003-002 View Team Details | Team Management | S |
| 6 | 0003-003 Edit Team Details | Team Management | S |
| 7 | 0004-001 Add Team Member | Team Management | M |
| 8 | 0004-002 Remove Team Member | Team Management | S |
| 9 | 0005-001 Change Member Role | Team Management | M |
| 10 | 0006-001 Multiple Teams | Team Management | M |
| 11 | 0007-001 DORA Capabilities Survey | Survey Definition | L |
| 12 | 0008-001 Create Survey Run | Survey Execution | M |
| 13 | 0009-001 Open Survey Run | Survey Execution | S |
| 14 | 0009-002 Close Survey Run | Survey Execution | S |
| 15 | 0009-003 Reopen Survey Run | Survey Execution | S |
| 16 | 0010-001 Survey Run Isolation | Survey Execution | M |
| 17 | 0011-001 Submit Survey Response | Survey Execution | M |
| 18 | 0011-002 Edit Survey Response | Survey Execution | M |
| 19 | 0012-001 Block Responses When Not Open | Survey Execution | S |
| 20 | 0013-001 Block Non-Member Responses | Survey Execution | S |
| 21 | 0014-001 Response Audit Trail | Survey Execution | M |
| 22 | 0015-001 Calculate Capability Scores | Assessment & Insights | M |
| 23 | 0016-001 View Capability Profile | Assessment & Insights | M |
| 24 | 0017-001 Tailored Improvement Guidance | Improvement Guidance | L |

---

### Release 2: Enhanced Experience (Should Have)

Features that enhance the user experience and provide deeper insights.

```mermaid
flowchart LR
    subgraph R2["Release 2: Enhanced Experience"]
        direction TB
        subgraph SD["Survey Definition"]
            R2_1["0019-001 Drill-down"]
            R2_2["0022-001 Versioning"]
        end
        subgraph SE["Survey Execution"]
            R2_3["0020-001 Scheduling"]
            R2_4["0021-001 Comments"]
            R2_5["0023-001 Pseudonymity"]
        end
        subgraph AI["Assessment"]
            R2_6["0018-001 Trends"]
        end
    end
```

**Total Stories: 6** | **Estimated Effort: M**

| # | Story | Context | Estimate |
|:-:|:------|:--------|:--------:|
| 1 | 0018-001 Trend View | Assessment & Insights | M |
| 2 | 0019-001 Capability Drill-down | Survey Definition | M |
| 3 | 0020-001 Schedule Survey Run | Survey Execution | M |
| 4 | 0021-001 Add Comments to Answers | Survey Execution | S |
| 5 | 0022-001 Question Versioning | Survey Definition | L |
| 6 | 0023-001 Pseudonymous Responses | Survey Execution | L |

---

### Release 3: Advanced Features (Could Have)

Nice-to-have features for advanced use cases and integrations.

```mermaid
flowchart LR
    subgraph R3["Release 3: Advanced Features"]
        direction TB
        subgraph IA["Identity"]
            R3_1["0034-001 SSO"]
        end
        subgraph SD["Survey"]
            R3_2["0029-001 Customize"]
        end
        subgraph SE["Execution"]
            R3_3["0024-001 Participation"]
            R3_4["0028-001 Notifications"]
        end
        subgraph AI["Assessment"]
            R3_5["0025-001 Confidence"]
            R3_6["0026-001 Export"]
            R3_7["0027-001 Workshop"]
        end
        subgraph IG["Guidance"]
            R3_8["0030-001 Next Best"]
            R3_9["0031-001 Chat AI"]
            R3_10["0032-001 Integration"]
            R3_11["0033-001 Multi-Lang"]
        end
    end
```

**Total Stories: 11** | **Estimated Effort: L**

| # | Story | Context | Estimate |
|:-:|:------|:--------|:--------:|
| 1 | 0024-001 Participation Tracking | Survey Execution | M |
| 2 | 0025-001 Confidence and Disagreement | Assessment & Insights | M |
| 3 | 0026-001 Export Results | Assessment & Insights | M |
| 4 | 0027-001 Workshop View | Assessment & Insights | M |
| 5 | 0028-001 Survey Notifications | Survey Execution | M |
| 6 | 0029-001 Customizable Survey | Survey Definition | L |
| 7 | 0030-001 Next Best Improvements | Improvement Guidance | M |
| 8 | 0031-001 Chat Assistant | Improvement Guidance | L |
| 9 | 0032-001 Project Tools Integration | Improvement Guidance | L |
| 10 | 0033-001 Multi-Language UI | Improvement Guidance | L |
| 11 | 0034-001 SSO Authentication | Identity & Access | L |

---

## Implementation Dependencies

```mermaid
flowchart TD
    subgraph Foundation["Foundation Layer"]
        IA[Identity & Access<br/>0001, 0002]
        TM[Team Management<br/>0003-0006]
    end
    
    subgraph Core["Core Layer"]
        SD[Survey Definition<br/>0007]
        SE[Survey Execution<br/>0008-0014]
        AI[Assessment & Insights<br/>0015-0016]
        IG[Improvement Guidance<br/>0017]
    end
    
    subgraph Enhanced["Enhanced Layer"]
        SD2[Survey Definition+<br/>0019, 0022]
        SE2[Survey Execution+<br/>0020-0021, 0023]
        AI2[Assessment+<br/>0018]
    end
    
    subgraph Advanced["Advanced Layer"]
        IA3[SSO<br/>0034]
        SD3[Customize<br/>0029]
        SE3[Track/Notify<br/>0024, 0028]
        AI3[Export/Workshop<br/>0025-0027]
        IG3[AI/Integration<br/>0030-0033]
    end
    
    IA --> TM
    TM --> SD
    SD --> SE
    SE --> AI
    AI --> IG
    
    SD --> SD2
    SE --> SE2
    AI --> AI2
    
    IA --> IA3
    SD2 --> SD3
    SE2 --> SE3
    AI2 --> AI3
    IG --> IG3
    
    style Foundation fill:#e1f5fe
    style Core fill:#c8e6c9
    style Enhanced fill:#bbdefb
    style Advanced fill:#fff9c4
```

---

## Story Summary by Priority

| Priority | Count | Stories |
|:---------|:-----:|:--------|
| **Must Have (M)** | 24 | 0001-001, 0002-001, 0002-002, 0003-001, 0003-002, 0003-003, 0004-001, 0004-002, 0005-001, 0006-001, 0007-001, 0008-001, 0009-001, 0009-002, 0009-003, 0010-001, 0011-001, 0011-002, 0012-001, 0013-001, 0014-001, 0015-001, 0016-001, 0017-001 |
| **Should Have (S)** | 6 | 0018-001, 0019-001, 0020-001, 0021-001, 0022-001, 0023-001 |
| **Could Have (C)** | 11 | 0024-001, 0025-001, 0026-001, 0027-001, 0028-001, 0029-001, 0030-001, 0031-001, 0032-001, 0033-001, 0034-001 |
| **Total** | **41** | |

---

## Story Summary by Bounded Context

| Context | Type | Must | Should | Could | Total |
|:--------|:-----|:----:|:------:|:-----:|:-----:|
| Identity & Access | Generic | 3 | 0 | 1 | 4 |
| Team Management | Supporting | 7 | 0 | 0 | 7 |
| Survey Definition | Core | 1 | 2 | 1 | 4 |
| Survey Execution | Core | 10 | 3 | 2 | 15 |
| Assessment & Insights | Core | 2 | 1 | 3 | 6 |
| Improvement Guidance | Core | 1 | 0 | 4 | 5 |
| **Total** | | **24** | **6** | **11** | **41** |

---

## Recommended Implementation Order

### Phase 1: Walking Skeleton
Build end-to-end flow with minimal implementation:
1. User Registration & Sign In (0001-001, 0002-001)
2. Create Team (0003-001)
3. DORA Survey Model (0007-001) - hardcoded initially
4. Create & Open Survey Run (0008-001, 0009-001)
5. Submit Response (0011-001)
6. Calculate & View Scores (0015-001, 0016-001)

### Phase 2: Complete MVP
Implement remaining Must-Have stories to complete the MVP:
1. Complete Identity & Access (0002-002)
2. Complete Team Management (0003-002, 0003-003, 0004-001, 0004-002, 0005-001, 0006-001)
3. Complete Survey Execution (0009-002, 0009-003, 0010-001, 0011-002, 0012-001, 0013-001, 0014-001)
4. Add Improvement Guidance (0017-001)

### Phase 3: Enhanced Experience
Implement Should-Have stories:
1. Trend View (0018-001)
2. Capability Drill-down (0019-001)
3. Scheduling & Comments (0020-001, 0021-001)
4. Question Versioning (0022-001)
5. Pseudonymous Responses (0023-001)

### Phase 4: Advanced Features
Implement Could-Have stories based on user feedback and priorities.

---

## References

- [Project Vision](project_vision.md)
- [Requirements](requirements.md)
- [Bounded Contexts](bounded_contexts.md)
- [Architecture Vision](architecture_vision.md)
- [User Stories](stories/)
