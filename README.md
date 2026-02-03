# SE-FishingFrenzo-MATABAYAN

# MataBayan 🇵🇭
**Real-Time Disaster Alert and Preparedness System**

MataBayan is a centralized platform designed to automate the collection and dissemination of disaster-related alerts in real-time. By consolidating data from verified government and weather agencies, MataBayan empowers disaster management offices and local communities with the timely information needed to save lives and protect property.

## 🚀 Project Overview
In many disaster-prone regions, information is often fragmented or delayed. MataBayan bridges this gap by providing:
* **Real-Time Data Aggregation:** Automated fetching from verified APIs and RSS feeds (e.g., NDRRMC, PAGASA).
* **Location-Based Alerts:** Filtered notifications (Email/Push) specific to a user's city or region.
* **Interactive Hazard Maps:** Visual representation of risk levels and ongoing disasters.
* **Actionable Insights:** Pre-defined safety instructions tailored to specific disaster types.

## 📍 Scope & Limitations (PH Context)
The project focuses specifically on the Philippine disaster landscape to ensure relevance and accuracy.

### **In-Scope**
* **Local Data Integration:** Direct tracking of PAGASA (Weather/Typhoons) and PHIVOLCS (Earthquakes/Volcanoes) data streams.
* **Geographic Specificity:** Capability for users to set locations at the Provincial and City/Municipality level within the Philippines.
* **Hazard Mapping:** Visual overlays of high-risk zones based on GeoriskPH and HazardHunterPH open data.
* **Bilingual Support:** Safety recommendations provided in both **English and Filipino**.

### **Limitations**
* **Connectivity:** Requires an active internet connection; SMS-based alerting is currently out of scope.
* **Data Dependency:** System real-time performance is dependent on the uptime of Philippine government API/RSS servers.
* **No Predictive AI:** The system visualizes official data but does not perform independent meteorological or seismic forecasting.
* **Informational Only:** The platform is a dissemination tool and cannot be used for direct emergency rescue dispatch or 911 services.

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3, JavaScript / React
* **Backend:** PHP
* **Database:** MySQL
* **Integrations:** Government Weather/Disaster APIs & RSS Feeds

## 👥 The Team
| Name | Role | Responsibility |
| :--- | :--- | :--- |
| **Adrian Paolo Follante** | Project Manager | Project oversight, leadership, and requirements monitoring. |
| **Ram Andrei Manalo** | Requirements Analyst | Documentation of functional/non-functional requirements and SRS maintenance. |
| **Renzo Emmanuel Ramos** | Software Developer | Full-stack development, API integration, and system testing. |
| **France Raphael Rivera** | Quality Assurance | Test planning, defect reporting, and performance verification. |
| **Richard Torculas** | Software Designer + DevOps | System architecture, UI/UX design, and deployment/CI processes. |

## 📅 Roadmap & Milestones
- [ ] **Project Start:** February 1, 2026
- [ ] **Requirements Finalized:** February 7, 2026
- [ ] **Design Completed:** February 14, 2026
- [ ] **Testing Phase:** April 11, 2026
- [ ] **Project Completion:** May 2, 2026

## ⚠️ Risks & Assumptions
* **Data Reliability:** Dependent on the uptime of external government APIs.
* **Connectivity:** System requires internet access (Offline functionality is currently out of scope).
* **Scalability:** Designed to handle spikes of at least 100+ simultaneous users during active disaster events.

---
*Developed as a collaborative effort to improve community disaster preparedness in the Philippines.*
