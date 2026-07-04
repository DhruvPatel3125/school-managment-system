Review only the code changes in the current branch and produce a comprehensive code review.

Focus Areas: 1. Code Quality & Readability – Evaluate clarity, maintainability, naming conventions, and structure. 2. Potential Bugs or Logical Issues – Identify any possible runtime errors, logic flaws, or edge-case oversights. 3. Security Considerations – Check for input validation, data handling, authentication, and other security vulnerabilities. 4. Best Practices & Standards – Assess compliance with project conventions, framework idioms, and modern best practices.

Output Requirements:
• Provide detailed, constructive feedback with specific code-level suggestions for each issue found.
• Summarize findings in an action-oriented checklist inside a file named review.md, using the format below:

# Code Review Summary

## Overall Assessment

_(Brief summary of code quality and main findings.)_

## Action Checklist

- [ ] Refactor X for readability
- [ ] Fix potential bug in Y
- [ ] Add input validation for Z
- [ ] Follow best practice for A/B/C

## Detailed Comments

_(Inline or sectioned explanations with file/line references if available.)_

Instructions:
• Review only files modified in the current branch (ignore base/main).
• Keep comments concise but meaningful.
• Use bullet points and clear examples where possible.
• Focus on actionable improvements rather than general commentary.

⸻
