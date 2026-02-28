---
name: code-debugger
description: Review code, identify bugs, and propose fixes using a methodical debugging and auditing workflow. Use when code behavior is incorrect, a bug report is received, or a code review is requested.
---

# Code Debugger

The **Code Debugger** skill is for systematically finding and fixing issues in the codebase. It uses a rigorous audit process and leverages the **Task Conductor** skill to ensure every fix is planned, executed, and verified correctly.

## Workflow

When you encounter a bug or are asked to review code:

1. **Reproduction (Brainstorming Phase)**:
   - Identify the reported issue and current behavior.
   - Use the **Task Conductor**'s "Brainstorming" mode to explore the root cause.
   - **MUST** create a reproduction test or script to confirm the failure.
   - Reference: [`references/debugging-strategies.md`](references/debugging-strategies.md)

2. **Analysis (Audit Phase)**:
   - Perform a code audit focused on the suspected area.
   - Use the **Task Conductor**'s "Planning and Tasking" mode to write a fix plan.
   - **MUST** write the plan to a file (e.g. `debug-plan.md`) using `write_file`.
   - Reference: [`references/audit-checklist.md`](references/audit-checklist.md)

3. **Implementation (Execution Phase)**:
   - Use the **Task Conductor**'s "Implementation and Execution" mode to apply the fix.
   - **MUST** verify the fix by running the reproduction test/script.
   - Update the `debug-plan.md` file as you progress.

---

## Guidelines

- **Reproduce First**: Never fix a bug without a reproduction script/test that fails first.
- **Surgical Fixes**: Address the root cause directly; avoid unrelated refactoring.
- **Continuous Validation**: Run existing tests after applying a fix to ensure no regressions.
- **Audit for Quality**: Beyond fixing the bug, ensure the code meets the project's quality standards.

## Resources

- [`references/debugging-strategies.md`](references/debugging-strategies.md): Methods for reproduction, localization, and classification.
- [`references/audit-checklist.md`](references/audit-checklist.md): A comprehensive list of quality and security checks.
