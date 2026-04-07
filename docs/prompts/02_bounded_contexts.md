I need help identifying Bounded Contexts and defining the Ubiquitous Language for my software project using Domain-Driven Design (DDD) principles.

# Project Context

Find the project vision in file "project_vision.md" and a list of requirements in file "requirements.md".

# Task
Analyze the requirements and generate:

1. **Identified Bounded Contexts**: List each bounded context with:
    - Name of the context
    - Core responsibility and purpose
    - Key domain concepts that belong to this context
    - Boundaries (what's included and what's NOT included)
    - Relationships with other contexts (upstream/downstream, shared kernel, etc.)

2. **Ubiquitous Language for Each Context**: For each bounded context, define:
    - Core domain terms and their precise meanings within this context
    - Key entities, value objects, and aggregates
    - Important domain events
    - Critical business rules or invariants
    - Terms that might mean different things in different contexts (highlight these!)

3. **Context Map**: Describe how the bounded contexts relate to each other using DDD patterns:
    - Partnership
    - Shared Kernel
    - Customer/Supplier
    - Conformist
    - Anticorruption Layer
    - Open Host Service
    - Published Language
    - Separate Ways

4. **Potential Issues and Recommendations**: Flag any:
    - Ambiguous requirements that need clarification
    - Missing domain concepts
    - Potential context boundary issues
    - Terms used inconsistently across requirements

# Guidelines
- Focus on business capabilities, not technical implementation
- Look for natural seams in the domain where language changes
- Identify areas where the same term might have different meanings
- Consider team structure and organizational boundaries if relevant
- Prioritize core domains vs. supporting and generic subdomains
- If your are unsure or something is missing or unclear, ask me for more information

Please provide the analysis in a structured format, using headings and bullet points for clarity. Format the output as markdown. Export the final result to file "docs/bounded_contexts.md".