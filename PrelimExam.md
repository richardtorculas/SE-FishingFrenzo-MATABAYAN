# Prelim Laboratory Exam - MataBayan Disaster Alert System

## Implemented Features Summary

- **Ticket 5:** Account Creation and Login on Front-End Development  
- **Ticket 6:** MataBayan Disaster Dashboard  
- **Ticket 7:** Database Creation  

In this sprint, we implemented several key features for MataBayan. **Ticket 5** focused on account creation and login, allowing users to register and securely access the system through the front-end interface. **Ticket 6** involved setting up the MataBayan Disaster Dashboard, laying the foundation for displaying disaster-related information in future development. **Ticket 7** covered database creation, where we structured the MongoDB database to store user information securely and prepare for future integration of disaster data and system features.

## Coding Standards Applied

- **Consistent Naming Conventions**  
- **Comments and Documentation**  
- **Security Best Practices**  

We followed consistent coding standards by using clear naming conventions, adding comments and documentation for important logic, and applying security best practices. Variables and functions use readable names, React components are clearly labeled, and critical sections like authentication are documented. Security measures such as password hashing and input validation were integrated to protect user data and prevent vulnerabilities.

---

## Git Contribution Summary

- **Follante, Adrian Paolo** –  Ticket 5: Account Creation and Login on Front-End Development (Branch)
- **Manalo, Ram Andrei** –  Prelim Exam Document (Main)
- **Ramos, Renzo Emmanuel** – Ticket 6: MataBayan Disaster Dashboard (Branch)
- **Rivera, France Raphael** –  Prelim Exam Document (Main)
- **Torculas, Richard** –  Ticket 7: Database Creation (Branch)

## Security Consideration 1: Password Protection & Data Storage

### Where the Risk Exists
- During user registration (sign-up page)  
- When storing user credentials in MongoDB  
- During login authentication  
- In the users collection inside the database  

**Explanation:**  
The risk exists during user registration, login authentication, and when storing user data in the MongoDB users collection. When a user signs up, their password is initially entered as plain text, which can be vulnerable if not handled properly. If passwords are saved in plain text, anyone who gains unauthorized access to the database could see all user passwords. Improper handling of password comparison during login could also expose sensitive information or allow attackers to bypass security. Because all user credentials are stored in the users collection, this part of the system is a critical security point that must be protected.

### How We Addressed / Minimized the Risk
- Passwords are hashed before being stored in MongoDB  
- The database only stores the hashed version, not the actual password  
- During login, the entered password is compared against the hashed password using secure comparison methods  

**Explanation:**  
We minimized this risk by hashing passwords before storing them in MongoDB. Only the hashed version of each password is saved, which makes it extremely difficult to reverse back to the original password. During login, the entered password is securely hashed and compared to the stored hashed version rather than retrieving or exposing the original password. This protects user credentials even if the database is compromised and reduces the risk of password theft.

---

## Security Consideration 2: Input Validation & Injection Attacks

### Where the Risk Exists
- User input fields such as email and password in the sign-up and login forms  
- Backend API endpoints that process authentication requests  
- MongoDB queries using user-provided input  

**Explanation:**  
The risk exists in the user input fields, backend API endpoints that handle authentication, and MongoDB queries using user-provided data. Attackers could submit malicious input, potentially causing NoSQL injection attacks, unsafe data storage, or exploitation of weak query handling. Since authentication relies on user input, these areas must be secured.

### How We Addressed / Minimized the Risk
- Implemented frontend validation in React  
- Added backend validation to ensure:  
  - Email follows proper format  
  - Password meets minimum length requirements  

**Explanation:**  
We minimized this risk by validating input on both frontend and backend. Frontend validation ensures required fields and correct formats before submission, while backend validation prevents invalid or malicious data from bypassing security. Together, these measures reduce injection attacks and maintain safe database operations.

## Code Review & Reflection

### One Strength of the Current Codebase
**Clear separation between frontend and backend responsibilities**  

**Explanation:**  
The React frontend handles the user interface and user actions, while the backend manages authentication and communicates with MongoDB. This separation makes the system easier to manage, update, and debug. It also prepares the project for future sprints, such as adding disaster data and integrating external APIs.

### One Area for Improvement
**Error handling and user feedback could be improved**  

**Explanation:**  
Currently, some error messages are too general and may not clearly explain what went wrong. Users may not know if their email is already registered or if there was a network issue. Improvements include providing specific error messages, adding loading indicators during login or sign-up, and improving backend error logging for easier debugging.

---

## Lessons Learned During Implementation

### Authentication is complex
- Authentication involves more than just checking if a password matches.  
- Passwords must be hashed and compared securely to protect user data.  
- Even small mistakes in authentication can create serious security risks.  

### Structuring the database correctly early on helps future scalability
- Designing the database properly from the beginning makes it easier to add new features later.  
- A well-planned user schema allows us to expand the system without major changes.  
- This will help when we add disaster data, integrate external APIs, or add different user roles.  

### Secure coding practices must be integrated during development
- Security should always be considered while building the system.  
- Adding security later can be harder and may require rewriting code.  
- Building securely from the start and following proper coding practices saves time and prevents future problems.
