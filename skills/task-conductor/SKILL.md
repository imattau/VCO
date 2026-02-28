---
name: task-conductor
description: A multi-step workflow skill for brainstorming, planning, tasking, and implementation. Use when a complex task needs to be broken down into structured plans and executed methodically.
---

# Task Conductor

The **Task Conductor** skill is used for high-level project management and methodical execution of complex engineering tasks. It follows a structured workflow that ensures requirements are understood, plans are documented, and implementation is verified.

## Workflow Decision Tree

1. **New Request / Ambiguity**: Start with [Brainstorming](#brainstorming).
2. **Brainstorming Complete**: Move to [Planning and Tasking](#planning-and-tasking).
3. **Plan Available**: Proceed to [Implementation and Execution](#implementation-and-execution).

---

## Brainstorming

Use this mode when you first receive a complex directive or when requirements are underspecified.

- **Goal**: Explore the problem space and define a technical approach.
- **Reference**: See [`references/brainstorm.md`](references/brainstorm.md) for guidelines on exploring requirements and surfacing risks.

**Trigger**: "Brainstorm how to implement X," "Explore options for Y," or when a task is too vague to plan.

## Planning and Tasking

Use this mode to convert a brainstormed approach into a structured, actionable plan.

- **Goal**: Create a `plan.md` file with atomic, verifiable tasks.
- **Action**: You **MUST** write the plan to a markdown file (e.g. `plan.md`) using the `write_file` tool.
- **Reference**: See [`references/plan.md`](references/plan.md) for the plan template and tasking principles.

**Trigger**: "Write a plan for X," "Break this down into tasks," or after brainstorming is complete.

## Implementation and Execution

Use this mode to methodically execute the tasks defined in a plan.

- **Goal**: Execute tasks one by one, verifying each, and updating the plan.
- **Action**: You **MUST** use the `read_file` tool to retrieve the current plan and update it frequently as tasks are completed.
- **Reference**: See [`references/execute.md`](references/execute.md) for the step-by-step execution procedure.

**Trigger**: "Implement the plan," "Start executing tasks," or when a `plan.md` exists and you are ready to work.

---

## Guidelines

- **Always Validate**: Each implementation step must include a verification phase (running tests, manual checks).
- **Update the Plan**: Keep the `plan.md` file as the source of truth for the project's state.
- **Stay Atomic**: Ensure tasks are small enough to be completed and verified independently.
