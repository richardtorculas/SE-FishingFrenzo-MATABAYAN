# Git Workflow & Branching Strategy

## 1. Branching Strategy: Structured (Gitflow Lite)
We use a structured branching model to ensure the stability of our production code.

* **`main`**: Contains only production-ready, fully tested code. No one commits directly here.
* **`develop`**: The integration branch for features. This is the "working" version of the project.
* **`feature/[Ticket-ID]-[description]`**: Temporary branches created for specific user stories or tasks.
    * *Example:* `feature/US-01-login-form`



## 2. Commit Message Format
All commits must follow the Ticket-ID prefix format to maintain traceability with our backlog.

**Format:** `[Ticket-ID] Short descriptive action`

* **Good Example:** `[US-01] Add password encryption logic`
* **Bad Example:** `fixed stuff` or `updated code`

## 3. Merge Rules & Pull Requests (PR)
To maintain code quality, the following rules apply:

1.  **No Direct Pushing:** Pushing directly to `main` or `develop` is strictly prohibited.
2.  **Pull Request Requirement:** All code must enter `develop` via a Pull Request from a `feature` branch.
3.  **Peer Review:** At least **one team member** (other than the author) must review and approve the PR.
4.  **Verification:** The reviewer must check that the code aligns with the defined **Layered Architecture** (Presentation, Business, Data).

## 4. Workflow Steps
1.  Pull the latest changes from `develop`.
2.  Create a new `feature` branch.
3.  Implement code and commit using the `[ID]` format.
4.  Push the branch and open a PR to `develop`.
5.  Once reviewed and merged, delete the feature branch.
