# MataBayan 🇵🇭
**Real-Time Disaster Alert and Preparedness System**

[![Node.js](https://img.shields.io/badge/Node.js-v18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-v7-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## 🚀 Quick Start

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev

# Access the application
Frontend: http://localhost:3000
Backend:  http://localhost:5000
```

## 📁 Project Structure

```
MataBayan/
├── docs/                       # Documentation
│   ├── architecture/           # System design & diagrams
│   └── uml/                    # UML diagrams
├── src/                        # Source code
│   ├── backend/                # Node.js/Express API
│   └── frontend/               # React application
├── tests/                      # Test suites
│   ├── unit/                   # Unit tests
│   └── integration/            # Integration tests
├── scripts/                    # Build & deployment scripts
└── .github/                    # CI/CD workflows
```

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3, JavaScript / React / Tailwind
* **Backend:** Node.js / Express.js
* **Database:** MongoDB
* **Integrations:** Government Weather/Disaster APIs & RSS Feeds

## 👥 The Team
| Name | Role | Responsibility |
| :--- | :--- | :--- |
| **Adrian Paolo Follante** | Project Manager + Software Developer | Project oversight, leadership, and requirements monitoring. |
| **Ram Andrei Manalo** | Requirements Analyst | Documentation of functional/non-functional requirements and SRS maintenance. |
| **Renzo Emmanuel Ramos** | Software Developer + Quality Assurance | Full-stack development, API integration, and system testing. |
| **France Raphael Rivera** | Quality Assurance + Software Developer | Test planning, defect reporting, and performance verification. |
| **Richard Torculas** | Software Designer + DevOps | System architecture, UI/UX design, and deployment/CI processes. |

## 📅 Roadmap & Milestones
- [ ] **Project Start:** February 1, 2026
- [ ] **Requirements Finalized:** February 14, 2026
- [ ] **Design Completed:** February 21, 2026
- [ ] **Testing Phase:** April 11, 2026
- [ ] **Project Completion:** May 2, 2026

## ⚠️ Risks & Assumptions
* **Data Reliability:** Dependent on the uptime of external government APIs.
* **Connectivity:** System requires internet access (Offline functionality is currently out of scope).
* **Scalability:** Designed to handle spikes of at least 100+ simultaneous users during active disaster events.

- **Frontend:** React 18, Tailwind CSS, Framer Motion
- **Backend:** Node.js, Express.js, MongoDB
- **Authentication:** JWT with HTTP-only cookies
- **Architecture:** MVC Pattern

## 👥 Team

| Name | Role | GitHub |
|------|------|--------|
| Adrian Paolo Follante | Project Manager | [@Gojatora](https://github.com/Gojatora) |
| Ram Andrei Manalo | Requirements Analyst | [@ramandrei](https://github.com/ramandrei) |
| Renzo Emmanuel Ramos | Full-Stack Developer | [@Renzo-Emmanuel](https://github.com/Renzo-Emmanuel) |
| France Raphael Rivera | QA Engineer | [@francerivera](https://github.com/francerivera) |
| Richard Torculas | UI/UX Designer | [@richardtorculas](https://github.com/richardtorculas) |

## 📅 Milestones

- [x] Project Start - February 1, 2026
- [x] Requirements Finalized - February 7, 2026
- [ ] Design Completed - February 14, 2026
- [ ] Testing Phase - April 11, 2026
- [ ] Project Completion - May 2, 2026

## 📖 Documentation

- [Architecture Design](docs/architecture/README.md)
- [API Documentation](docs/api/README.md)
- [Setup Guide](docs/SETUP.md)

## 🔐 Security

- Bcrypt password hashing (12 rounds)
- JWT authentication with HTTP-only cookies
- CORS protection
- Input validation & sanitization

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

*Developed to improve disaster preparedness in the Philippines* 🇵🇭

