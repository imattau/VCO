# Planning and Tasking Workflow

The goal of planning is to translate a chosen brainstormed approach into a clear, executable list of atomic tasks.

## Plan Template
You **MUST** write the plan to a markdown file (usually `plan.md` in the current working directory or a dedicated subfolder) using the `write_file` tool.

```markdown
# [Title of the Plan]

## Objective
A concise statement of what this plan will achieve.

## Strategy
Briefly describe the chosen technical approach from brainstorming.

## Tasks
Use checkboxes for tasks. Break tasks down into atomic, verifiable units (30-60 min chunks).

- [ ] Task 1: [Description] (e.g., "Scaffold the basic component structure")
- [ ] Task 2: [Description] (e.g., "Implement the main logic")
- [ ] Task 3: [Description] (e.g., "Add unit tests for the core functions")
- [ ] Task 4: [Description] (e.g., "Verify behavior and final clean-up")
```

## Tasking Principles
1. **Atomic**: Each task should be self-contained and verifiable.
2. **Sequential**: Tasks should generally follow a logical order.
3. **Traceable**: Link tasks to specific files or components whenever possible.
4. **Verifiable**: Every task should include a verification step (tests, manual check).
