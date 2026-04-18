Read the attached document and focus on the specified DORA capability.

Task 1: Summarize the DORA capability
Extract the essence of the DORA capability and write a short explanation that clearly describes what this capability means for software project teams in practice.

Requirements for the capability explanation:
- Length must be 4 to 6 sentences
- Summarize the key intent of the capability
- Focus on practical meaning and observable team practices
- Do not copy phrases directly from the source unless necessary
- Do not include improvement advice or maturity-level language
- Write in neutral language and avoid phrases like “our team” or “we”
- Explanation should help respondents to understand the survey question

Task 2: Create one survey question
Write exactly one survey question for members of software project teams. The question should assess the extent to which the capability is demonstrated in day-to-day team practices.

Requirements for the survey question:
- The response scale is a 7-point Likert scale:
  1 = Strongly disagree
  7 = Strongly agree
- The question must be answerable against that scale
- Length must be 30 to 40 words
- Cover the most important aspects of the capability, prioritizing concrete and observable team behaviors
- Use neutral language
- Do not use phrases like “our team” or “we”
- Avoid vague, abstract, or overly broad wording

Task 3: Create guidance for each response level
Write guidance for Levels 1 through 7, where each level corresponds to the survey response selected by a team member:
- Level 1 = Strongly disagree
- Level 7 = Strongly agree

Requirements for the guidance:
- Provide one guidance statement for each level from 1 to 7
- Each level must contain 3 to 5 sentences
- Guidance should help a software development team improve to the next level
- For Level 7, describe how to sustain performance and avoid regression
- Base the guidance only on the DORA capability text
- Make the advice specific, practical, and action-oriented
- Focus on what teams can start, stop, strengthen, or measure
- Avoid repeating the same advice across multiple levels
- Prefer concrete, observable practices and outcomes over subjective quality terms unless those terms are anchored in specific behaviors.

Output Requirements:
- Return valid JSON only
- Do not use markdown code fences
- Use exactly these keys:
    - name
    - question
    - description
    - guidance
- guidance must contain exactly 7 items
- Each item must contain:
    - level
    - guidance
- name must contain the name of the DORA capability being assessed
- level must be an integer from 1 to 7
- question must contain 30 to 40 words
- Each guidance text must contain 3 to 5 sentences
- description must contain 4 to 6 sentences (explanation of Task 1)

Quality checks before finalizing:
- Ensure the explanation, question, and guidance all reflect the same core capability
- Ensure the question reflects the capability’s central behaviors, not secondary details
- Ensure the question can realistically be answered by individual dev team members
- Ensure guidance describes how to progress to the next level
- Ensure wording is consistent with a 7-point agreement scale

General rules:
- The target audience is software developers and other members of software project teams with varying levels of professional experience. Assume a baseline understanding of common software development concepts and practices. Use clear, precise, technically credible language. Established software engineering terms may be used where they improve accuracy, but avoid unnecessary jargon, niche framework terminology, and overly academic wording.
- Return only the final output in this format, with no additional commentary.
- Text content should contain valid markdown syntax