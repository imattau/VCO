# Implementation and Execution Workflow

The goal of implementation is to read the active plan and execute tasks one by one, keeping the plan updated.

## Execution Procedure
1. **Locate Plan**: Find the active `plan.md` (or similar) and **READ** it using the `read_file` tool.
2. **Read Tasks**: Identify the first uncompleted task.
3. **Analyze Context**: Before implementation, read relevant files for that task.
4. **Implement**: Perform the necessary code changes or file operations.
5. **Verify**: Run tests or verify the change behaviorally.
6. **Update Plan**: Mark the task as `[x]` done. Add any sub-tasks or follow-up tasks discovered during implementation. You **MUST** update the plan file after completing each task using the `replace` or `write_file` tools.
7. **Repeat**: Move to the next uncompleted task.

## Guidelines
- **Stay Focused**: Do not drift away from the plan. If you find a bug unrelated to the current task, note it in a new task or file but do not fix it yet.
- **Surgical Changes**: Keep implementations focused on the specific task.
- **Continuous Feedback**: Update the user on progress periodically, especially after completing major milestones.
- **Self-Correction**: If a task fails or you hit a blocker, update the plan to reflect the new reality (e.g., "Add research step for X").
