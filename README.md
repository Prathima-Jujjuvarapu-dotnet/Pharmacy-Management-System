# Pharmacy Management System

A full-stack Pharmacy Management System built using **.NET 8 microservices architecture** and **Angular frontend**.  
The application helps pharmacies manage medicines, inventory, orders, supplier stock, and payments efficiently.

This project demonstrates **modern full-stack development using ASP.NET Core Web APIs, Angular, and SQL Server** with a scalable microservices architecture.

---

## Tech Stack

### Backend
- .NET 8
- ASP.NET Core Web API
- Microservices Architecture
- Entity Framework Core
- SQL Server
- API Gateway (Ocelot)
- JWT Authentication
- OTP & QR Based Authentication

### Frontend
- Angular
- TypeScript
- HTML
- CSS

### Tools
- Visual Studio
- Visual Studio Code
- Git
- GitHub

---

## System Architecture

The application follows a **microservices-based architecture**, where each service is responsible for a specific functionality.

### Backend Services

- **API Gateway** – Routes client requests to the appropriate microservices using Ocelot.
- **Auth Service** – Handles user authentication, OTP/QR verification, and JWT token generation.
- **Drug Service** – Manages drug catalog and medicine details.
- **Inventory Service** – Tracks stock levels and inventory updates.
- **Order Service** – Handles order placement and order management.
- **Payment Service** – Simulates a payment process for order transactions.
- **Sales Service** – Tracks pharmacy sales records.
- **Supplier Inventory Service** – Manages supplier stock and medicine supply.
- **DataAccessLayer** – Contains database configuration, entity models, and shared services.

### Frontend

- Angular-based responsive UI
- Component-based architecture
- Integration with backend REST APIs
- Separate dashboards for users and administrators
- User-friendly interface for pharmacy staff and administrators

---

## Key Features

- Secure login using **JWT Authentication**
- **OTP / QR based authentication system**
- Policy-based **Role-Based Access Control (RBAC)**
- Multiple administrative roles for system management
- Drug search and medicine catalog management
- Inventory and stock tracking
- Order placement and management
- Simulated payment processing system
- Supplier inventory management
- API Gateway routing using Ocelot
- Responsive Angular UI integrated with backend APIs

---

## Role-Based Access Control (RBAC)

The system implements **policy-based authorization** using ASP.NET Core to restrict access based on administrative roles.

Different administrators handle different pharmacy operations to ensure secure and organized system management.

### Admin Roles

- **SuperAdmin**
  - Full access to the entire system
  - Manages users and system configuration

- **DrugAdmin**
  - Manages medicine catalog
  - Adds, updates, and removes drug information

- **SupplierAdmin**
  - Handles supplier inventory
  - Updates supplier stock and medicine supply records

- **OrderAdmin**
  - Manages order processing
  - Tracks and updates order status

- **PaymentAdmin**
  - Monitors payment transactions
  - Handles payment verification

- **SalesAdmin**
  - Tracks pharmacy sales
  - Generates sales records and reports

---

## User & Admin Dashboards

The application provides separate dashboards for different user types.

### User / Doctor Dashboard
- OTP / QR code based login authentication
- Personal profile management
- Upload profile image and live picture
- Password reset functionality
- Account deactivation option
- Access to pharmacy services and order management

### Admin Dashboards

Each admin role has a **dedicated Angular dashboard** for their specific tasks.

- **Drug Admin Dashboard** – Manage medicine catalog and drug details
- **Supplier Admin Dashboard** – Manage supplier inventory
- **Order Admin Dashboard** – Process and track pharmacy orders
- **Payment Admin Dashboard** – Monitor and verify payment transactions
- **Sales Admin Dashboard** – Track pharmacy sales and generate reports
- **Super Admin Dashboard** – Full system access and management of all modules

---

## Project Structure


Pharmacy-Management-System

Backend
│
├── ApiGateway
├── AuthService
├── DrugService
├── InventoryService
├── OrderService
├── PaymentService
├── SalesService
├── SupplierInventoryService
└── DataAccessLayer
   ├── Data (DbContext and database configuration)
   ├── Models (Entity models)
   ├── EmailNotification (Email services for notifications)
   └── ExceptionHandling (Custom exception middleware)

Frontend
│
└── Angular Application
├── Components
├── Services
└── UI Modules


---

## How to Run the Project

### Backend

1. Open the solution in **Visual Studio**
2. Configure SQL Server connection string in `appsettings.json`
3. Run the individual microservices
4. Start the **API Gateway**

---

## Configuration

Before running the backend services, update the `appsettings.json` file with the required configuration values.

Required settings include:

- SQL Server Connection String
- JWT Authentication Secret Key
- Email Server Configuration (SMTP)
- Email Credentials for Notification Service

Example configuration sections:

- `ConnectionStrings` – Database connection configuration  
- `JwtSettings` – Authentication token configuration  
- `EmailSettings` – SMTP email notification service  

---

### Frontend

1. Navigate to the frontend folder.


npm install


2. Run the Angular application.


ng serve


3. Open in browser:


http://localhost:4200


---

## Future Enhancements

- AI-based drug recommendation system
- Online prescription upload
- Automated stock alerts
- Cloud deployment using Azure or AWS
- Real payment gateway integration

---

## Author

**Prathima Jujjuvarapu**  
Full Stack Developer (.NET & Angular)
