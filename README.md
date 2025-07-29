# Web App Onboarding for Interns

Welcome to the **Ukaab-The-Evolution** web application project! This README will guide you through setting up your development environment, working on your feature branch, and navigating our CI/CD pipeline.

---

## 🚀 Project Overview

* **Repository:** `web-app` (monorepo)
* **Backend:** Node.js + Express
* **Frontend:** React (Create React App)
* **Database:** Supabase
* **Local Dev:** Docker & Docker Compose
* **CI/CD:** Jenkins Multibranch Pipeline

---

## 📋 Prerequisites

Ensure you have the following installed on your machine:

1. **Git** (≥ 2.40)
2. **Node.js** (v20 LTS)
3. **npm** (bundled with Node)
4. **Docker Desktop** (with Docker Compose)
5. **VS Code**
6. **SSH key** configured for GitHub (see project docs)

---

## 🔀 Branching Workflow

1. We use a **feature branch** per intern:

   ```bash
   feature/yourname/short-description
   ```
2. Interns only push to their own branch. `main` is protected.
3. After your work is done, open a **Pull Request** (PR) to `main` for review.

---

## 📥 Clone the Repo

```bash
git clone git@github.com:Ukaab-The-Evolution/web-app.git
cd web-app
```

---

## 🌿 Checkout Your Feature Branch

1. Create (or switch to) your branch:

   ```bash
   git checkout -b feature/yourname/some-task
   ```
2. Push to origin:

   ```bash
   git push -u origin feature/yourname/some-task
   ```

---

## 🔑 Environment Variables

### 1. Copy `.env` templates

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Fill in your keys

* **Backend (`backend/.env`)**+

  ```dotenv
  SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_KEY=YOUR_SERVICE_ROLE_KEY
  PORT=3001
  ```

* **Frontend (`frontend/.env`)**

  ```dotenv
  REACT_APP_SUPABASE_URL=https://your-project.supabase.co
  REACT_APP_SUPABASE_KEY=YOUR_ANON_KEY
  ```

> **Note:** Never commit `.env` files!

---

## 🛠 Local Development with Docker

1. In project root, start both services:

   ```bash
   docker-compose up --build
   ```
2. **Backend** available at: [http://localhost:3001](http://localhost:3001)
3. **Frontend** available at: [http://localhost:3000](http://localhost:3000)

> Use `Ctrl+C` to stop containers.

---

## 🧪 Running Locally Without Docker

**Backend** (hot reload):

```bash
cd backend
npm install
npm run dev
```

**Frontend**:

```bash
cd frontend
npm install
npm start
```

---

## 🚦 Testing

* **Backend** tests:

  ```bash
  cd backend
  npm test
  ```
* **Frontend** tests:

  ```bash
  cd frontend
  npm test
  ```

All tests must pass before opening a PR.

---

## 📈 CI/CD Pipeline

* Every push/PR triggers Jenkins to:

  1. **checkout** your branch
  2. **install** & **test** both backend and frontend in parallel
  3. **build** the frontend production bundle
  4. **build** Docker images
  5. **deploy** to local staging server

---

## 📝 Commit & PR Guidelines

1. **Commit messages:** Use imperative tense, e.g. `feat: add login endpoint`
2. **Small PRs:** Aim for limited scope to ease reviews
3. **Assign a reviewer** (code owner or mentor)
4. **Link tickets** or Kanban cards in PR description

---

## 🤝 Code Review & Merge

* After CI passes and reviews are approved, a maintainer will merge your PR into `main`.
* Your branch remains; delete it once merged:

  ```bash
  git branch -d feature/yourname/some-task
  git push origin --delete feature/yourname/some-task
  ```

---

## 🎯 Tips & Best Practices

* Keep your branch up to date:

  ```bash
  git checkout main
  git pull
  git checkout feature/yourname/...
  git merge main
  ```
* Run linting and formatting before commit (e.g. ESLint, Prettier).
* Write unit tests for new features.

---

Happy coding at Ukaab
