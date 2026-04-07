# User Story

Read the list of requirements  in the `docs/requirements.md` file.
Think about the users who will interact with this feature and what they want to achieve. Create a plan to write user stories that capture these needs. (If the requirements are too complex, you may need to write multiple user stories to cover different aspects of the requirement.)

Also check out the Bounded Contexts document in `docs/bounded_contexts.md` to understand the Ubiquitous Language and the Bounded Contexts.

See the architecture vision document in `docs/architecture_vision.md` to understand how the system is structured.

Write user one or more user stories for each requirement. Consider writing more than one user story per requirement if the requirement is complex or has multiple aspects.
Put each user story as a Markdown file inside the folder `docs/stories` with the file name pattern `XXX_YYY.md` where `XXX` is the story number and YYY is the story title (see story template below).


## Hints:

- good user stories are
  - accurate enough to capture the goal
  - vague enough to allow multiple solutions
  - describe what a user wants the software to do
  - don't include technical specifications
  - written in the language of the user, not the system
- write a user story using this user story card template:
  - **Story Number**: requirement id + sequential number starting with "001"
  - **Story Title**: short one-liner
  - **Estimate**: T-Shirt sizes S, M, L, XL
  - **Narrative**: pattern: "As a user I want some behavior so that I can achieve some benefit"
  - **Acceptance Criteria**: a short list of things to check to confirm that the software is done. Characteristics of good acceptance criteria are:
    - **Clarity and conciseness**: Write acceptance criteria in plain language that all stakeholders, including developers, product owners, and testers, can easily understand. Avoid technical jargon or ambiguous phrasing. State the criteria concisely and directly, focusing on **specific outcomes**. 
    - **Testability**: Well-written acceptance criteria are demonstrably verifiable. Each criterion should translate into one or more clear tests that determine whether the implemented functionality meets the defined requirements. This allows for objective evaluation and eliminates room for misinterpretation. 
    - **Outcome**: Focus on the desired result from a **business perspective** rather than the technical implementation details. The criteria should define the feature's goal, not how to build it. This empowers developers while ensuring the final product aligns with user needs. 
    - **Measurability**: Whenever possible, express the criteria in measurable terms. This allows for a clear pass/fail determination during testing.
    - **Independence**: Ideally, each acceptance criterion should be independent of others. This enables you to test and evaluate in isolation, streamlining the testing process.
- use **INVEST** model to evaluate the quality of your user stories:
  - **Independent**: Stories can be implemented in any order.
  - **Negotiable**: Stories can be completely malleable. What they mean, when they should be done, and how they can be implemented are all up for negotiation.
  - **Valuable**: Every story should deliver concrete value to a user.
  - **Estimable**: You must be able to estimate how much work is in a story.
  - **Small**: Stories should be small, the biggest story should be completed within one or two weeks.
  - **Testable:** No story is complete until all of its tests pass.
- Separate What from How:
  - Focus on outcomes
  - Promote use of Ubiquitous Language
  - Avoid technical jargon
  - Avoid implementation details

## Example of a well-written user story:

```markdown
# Story 1201-015: Player starts single-player game
**Estimate:** M

**Narrative:** As a player I want to play a single-player game so that I can play alone.

**Acceptance Criteria:**
- Given I start a new game, when I select "One Player" then the game should respond with "Welcome Player One" and the game should offer the option to "Start Game".
- ...
```

## Example of a poorly-written user story:

```markdown
# Story 3205-002: Addition
**Estimate:** S

**Narrative:** In order to avoid silly mistakes as a math idiot, I want to be told the sum of two numbers.

**Acceptance Criteria:**
- Given I have selected the calculator homepage, and I have typed 50 into the number-input field, and I have pressed Enter, and I have typed 70 into the number-input field, and I have pressed Enter, when I press the Add button, then the result should be 120 in the result field.
- ...
```
