<div align="center">

# Karsa

**Agentic Student Development Workspace (Demo version for BIGC 2026)**

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](#license)

Interactive onboarding | Context-aware AI personas | Real-time guidance

</div>

---

## Table of contents
- [Overview](#overview)
- [Key features](#key-features)
- [Architecture and tech stack](#architecture-and-tech-stack)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [Security](#security)
- [License](#license)

---

## Overview

Karsa is an educational technology application designed to help Indonesian students plan their academic competitions and build future portfolios. The platform provides personalized guidance through five distinct AI personas tailored to specific academic and personal development needs. 

---

## Key features

- The application adapts to the user's education level, interest targets, and study rhythm during onboarding.
- Five AI personas specialize in different areas. Karsa focuses on study strategies, Ara provides emotional support, Arka handles science and coding, Sekar covers art and creative writing, and Rangga discusses leadership and business.
- The AI engine uses the student's profile context to drive relevant discussions.
- The backend endpoints use rate limiting and CORS validation to prevent API abuse.

---

## Architecture and tech stack

| Category | Technology |
| :--- | :--- |
| **Frontend and core** | Next.js 15, React 19, Tailwind CSS, Framer Motion |
| **AI integration** | Vercel AI SDK, Google Gemini |
| **Icons** | Lucide React |
| **Language** | TypeScript |

---

## Getting started

### Prerequisites

You need Node.js version 18.0 or higher installed on your system. 

### Installation

```bash
git clone https://github.com/owner/karsa_demo.git
cd karsa_demo

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### Environment variables

Create a `.env.local` file in the root directory and configure your Google Gemini API key:

| Variable | Description | Required | Default |
| :--- | :--- | :---: | :--- |
| `GEMINI_API_KEY` | Authentication key for Google Gemini AI | Yes | - |

---

## Project structure

```text
.
├── src/
│   ├── app/           # Next.js App Router entry points and API routes
│   ├── components/    # UI components (chat, dashboard, onboarding)
│   ├── context/       # React context providers
│   ├── hooks/         # Custom React hooks
│   └── lib/           # Utility functions, AI prompts, and rate limiting
├── public/            # Static assets
└── tests/             # Application test suites
```

---

## Security

Do not commit the `.env` or `.env.local` files to public repositories. The repository includes a `.gitignore` file configured to exclude these files. The backend endpoints implement rate limiting to protect the Gemini API key.

---

## License

This project is licensed under the [MIT License](LICENSE).
