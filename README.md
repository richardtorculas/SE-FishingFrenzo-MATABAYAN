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

---
*Developed as a collaborative effort to improve community disaster preparedness in the Philippines.*
## Architectural Style

**MataBayan** adopts the **Model–View–Controller (MVC)** architectural style, implemented within a **Client–Server** environment.

The MVC pattern separates the system into three core components to ensure a clear separation of concerns:

- **Model:** Responsible for disaster data management and core business logic.
- **View:** Handles user interface presentation and data visualization.
- **Controller:** Manages request handling and coordination between the Model and the View.

This architectural style was selected to support real-time data processing, system maintainability, and scalability while ensuring reliable dissemination of disaster alerts.

---

## High-Level Architecture Diagram

*(Refer to the MataBayan High-Level MVC Architecture Diagram illustrating the interaction between users, the MVC components, external government data sources, and notification services.)*
<img width="676" height="719" alt="High-Level Architecture Diagram - MVC drawio (2)" src="https://github.com/user-attachments/assets/004cf100-d3f5-4fbf-861e-b505de727d81" />


---

## Design Principles Applied

_**Separation of Concerns**_

Each MVC component has a distinct responsibility:

- The **Model** handles disaster data storage, validation, and business logic.
- The **View** manages the presentation of alerts, dashboards, and hazard maps.
- The **Controller** manages user requests and controls system workflow.

This separation reduces system complexity and improves maintainability.

_**Modularity**_

The system is divided into independent functional modules, including:

- Disaster data processing
- User location management
- Alert and notification handling
- Hazard mapping and visualization

Modularity allows individual components to be updated or enhanced without affecting the entire system.
## Members & Github Accounts
- Adrian Paolo Follante - Gojatora
- Ram Andrei Manalo - ramandrei
- Renzo Emmanuel Ramos - Renzo-Emmanuel
- France Raphael Rivera - francerivera
- Richard Torculas - richardtorculas
