# Project Rules for Putri Jaya Mobil (PJM ERP)

- **No Unnecessary Terminal Commands**: Minimize calling terminal commands (`run_command`) such as `php -l`, `git status`, or reading logs via shell, because each terminal command triggers a "Yes / Allow" approval prompt for the user. Perform code edits and checks directly without spawning extra terminal commands.
- **Direct Execution**: Implement all requested features/bugfixes directly in code without creating plan approval modals or stopping for "Submit" button approvals.
- **Git Push Policy**: Do NOT automatically push to GitHub. Only perform `git push` when the user explicitly commands "push".
- **No Function Docblock Comments**: Do NOT add DocBlock comments (e.g., `/** ... */`) above functions or methods. Keep code clean without docblocks.
