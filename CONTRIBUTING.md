# Contributing to Eldercare 

Welcome, This guide explains how to contribute using **Git Flow** and **rebase** for feature branches.

---

## Table of Contents

1. Prerequisites
2. Git Flow Overview
3. Repository Setup
4. Creating a Feature Branch
5. Rebasing Your Feature Branch
6. Submitting a Pull Request
7. Code Review & Merging
8. Commit & Code Style
9. Communication & Support

---

## 1. Prerequisites

- Git installed (≥ 2.20)
- A GitHub account
- Basic command-line familiarity
- Fork of the repository

---

## 2. Git Flow Overview

We use Git Flow with two main branches:

- **main**: production-ready code
- **dev**: integration branch for features

Supporting branches:

- **feature/\<name>**: new features
- **release/\<version>**: prepare a new release
- **fix/\<name>**: bug fixes
- **hotfix/\<name>**: urgent fixes on master

Flow summary:

1. Work on a feature in `feature/...` branched off `dev`.
2. Rebase frequently onto `dev`.
3. Open a Pull Request (PR) into `dev`.
4. After review, merge your feature into `dev`.
5. When ready for release, merge the `dev` branch into `main`.

---

## 3. Repository Setup

1. Fork the repo on GitHub.
2. Clone your fork locally:
   ```bash
   git clone https://github.com/...
   cd dir
   ```

---

## 4. Creating a Feature Branch

1. Fetch & update `dev`:
   ```bash
   git fetch 
   git checkout dev
   git reset --hard origin/dev
   ```
2. Create a feature branch (replace `cool-feature`):
   ```bash
   git checkout -b feature/cool-feature
   ```
3. Implement your changes.
4. Commit regularly with clear messages (see Section 8).

---

## 5. Rebasing Your Feature Branch

To keep your branch up to date (instead of merging `develop`), rebase:

1. Switch to your feature branch:
   ```bash
   git checkout feature/cool-feature
   ```
2. Fetch and rebase onto the latest `dev`:
   ```bash
   git fetch origin
   git rebase origin/dev
   ```
3. Resolve any conflicts:
  - Edit conflicted files.
  - Stage fixes: `git add <file>`.
  - Continue rebase: `git rebase --continue`.
4. If needed, repeat until rebase completes.
5. Push (force-with-lease to update remote):
   ```bash
   git push --force-with-lease origin feature/cool-feature
   ```

---

## 6. Submitting a Pull Request

1. On GitHub, click **Compare & pull request**.
2. Base: `dev`; Compare: your `feature/...`.
3. Fill in:
  - **Title**: clear, e.g., “Add real-time chat widget”
  - **Description**: what, why, screenshots/tests
4. Submit PR.

---

## 7. Code Review & Merging

- Team reviews your PR:
  - Suggestions or approvals.
  - Address review comments by pushing commits or rebasing.
- Once approved, a maintainer merges into `develop`.
- **Do not** merge your own PR.

---

## 8. Commit & Code Style

- Use **imperative** commit titles: “Add validation for email”
- https://www.conventionalcommits.org/en/v1.0.0/
- One change per commit if possible.
- Follow existing style (indentation, linting).
- Run tests before committing (todo):
  ```bash
  npm test
  ```

---

## 9. Communication & Support

- Use GitHub Issues for bugs or feature requests.
- Ask questions in the team chat (e.g., Slack).
- Reference issues/PRs with `#123`.
- Be polite and respectful in comments.

---

Thank you for contributing! We appreciate your efforts and are here to help. If you get stuck, reach out to your mentor or open an issue. 🚀