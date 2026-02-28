# Debugging Strategies

When faced with a bug or unexpected behavior, follow these systematic steps:

## 1. Reproduction (Mandatory)
- **Identify the failure state**: Exactly what is happening vs. what is expected.
- **Isolate the cause**: Create a minimal reproduction script or test case.
- **Check environment**: Verify dependencies, versions, and environment variables.

## 2. Localization
- **Trace the data**: Follow inputs through the system using logs or a debugger.
- **Binary Search (Git Bisect)**: If it worked before, find the breaking commit.
- **Log Analysis**: Examine stderr, stdout, and specialized logs (e.g., Tauri logs).

## 3. Classification
- **Logic Bug**: Code does what it's told, but what it's told is wrong.
- **Race Condition**: Behavior depends on timing/order of execution.
- **Memory/Resource Leak**: Performance degrades over time.
- **Environment Bug**: Issue only appears on specific OS/Node version.

## 4. Resolution
- **Propose a fix**: Based on the identified root cause.
- **Apply the fix**: Keep it surgical and minimal.
- **Validate**: Run the reproduction test again to ensure it passes.
