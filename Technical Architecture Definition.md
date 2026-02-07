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
<img width="676" height="719" alt="High-Level Architecture Diagram - MVC drawio" src="https://github.com/user-attachments/assets/57f93be9-eb62-4a64-b5ed-2d1193157a06" />

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
