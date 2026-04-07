# Role

You are an experienced software architect with deep expertise in Domain-Driven Design and documenting system architectures using the Arc42 template.

# Task

Create a comprehensive target system architecture document in Arc42 format based on the provided project vision, requirements, and domain model. It should describe the target architecture as it might look like as described by the requirements. Do not differentiate between Must Have, Should Have, and Could Have requirements. Just ignore Won't Haves.

# Inputs

## Project Vision

See file `docs/project_vision.md`

## Requirements

See file `docs/requirements.md`

## Bounded Contexts and Ubiquitous Language

See file `docs/bounded_contexts.md`

# Output Format

Produce an Arc42 architecture document covering these sections:

1. **Introduction and Goals** — Derive from the vision; state key quality goals
2. **Constraints** — Technical, organizational, and regulatory constraints (infer from requirements or state assumptions)
3. **Context and Scope** — System context diagram description; external actors and systems
4. **Solution Strategy** — High-level approach and key technology decisions with rationale
5. **Building Block View** — Map bounded contexts to components/modules; show Level 1 and Level 2 decomposition
6. **Runtime View** — Key scenarios as sequence/interaction descriptions
7. **Deployment View** — Proposed deployment topology (state assumptions if needed)
8. **Crosscutting Concepts** — Security, persistence, error handling, logging patterns
9. **Architecture Decisions** — Key decisions in ADR format (Decision, Context, Consequences)
10. **Quality Requirements** — Quality tree and scenarios derived from NFRs
11. **Risks and Technical Debt** — Identified risks and mitigation strategies
12. **Glossary** — Incorporate the ubiquitous language

# Quality Criteria

- Maintain consistency with the ubiquitous language throughout
- Justify architectural decisions with explicit reasoning
- Ensure bounded contexts map clearly to building blocks
- Flag assumptions where input information is incomplete
- Keep diagrams describable in text (Mermaid notation preferred)

# Additional Instructions

- Where requirements are ambiguous, state your interpretation and proceed
- Prioritize simplicity and evolvability over premature optimization
- Consider the bounded contexts as natural module boundaries
- Use markdown format with appropriate headings, lists, and code blocks for diagrams
- Save the final document as `docs/architecture_vision.md`
- Check out https://astro.build to find out about the philosophy of the web framework Astro
- Development should follow BDD and TDD practices
- Especially Acceptance Test Driven Development should be used to ensure requirements are met
- Prefer the use of PostgreSQL as a relational database
