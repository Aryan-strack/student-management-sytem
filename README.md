# 🎓 Student Management System

<div align="center">

![MEAN Stack](https://img.shields.io/badge/Stack-MEAN-green?style=for-the-badge)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![Angular](https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)

A comprehensive **Student Management System** built with the MEAN Stack (MongoDB, Express.js, Angular, Node.js) for efficient academic administration.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Documentation](#-api-documentation) • [Screenshots](#-screenshots)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Running the Application](#-running-the-application)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

The **Student Management System** is a full-stack web application designed to streamline academic administration processes. It provides a robust platform for managing students, classes, departments, and courses with an intuitive user interface and powerful backend.

### Key Highlights

- ✅ **Complete CRUD Operations** for all entities
- 🔒 **Secure REST API** with validation and error handling
- 🎨 **Modern UI/UX** with responsive design
- 📊 **Real-time Data Management** with MongoDB
- 🚀 **High Performance** with Angular 21 and Express.js
- 📱 **Mobile Responsive** design for all devices

---

## ✨ Features

### 👨‍🎓 Student Management
- Add, view, edit, and delete student records
- Comprehensive student profiles with personal and academic information
- Guardian information tracking
- Course enrollment management
- Status tracking (Active, Inactive, Graduated, Suspended)
- Advanced search and filtering

### 🏫 Class Management
- Create and manage classes with sections
- Track class capacity and current strength
- Assign class teachers
- Monitor class schedules and timings
- Academic year management

### 🏢 Department Management
- Department creation and administration
- Head of Department (HOD) assignment
- Department facilities tracking
- Contact information management
- Statistical insights

### 📚 Course Management
- Course catalog management
- Credit hours and semester tracking
- Instructor assignment
- Prerequisites management
- Enrollment capacity control
- Grading policy configuration
- Course resources and materials

### 🔍 Additional Features
- **Advanced Filtering**: Filter by class, department, status, academic year
- **Search Functionality**: Quick search across all entities
- **Pagination**: Efficient data loading with pagination
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Data Validation**: Client and server-side validation
- **Error Handling**: Comprehensive error messages and handling

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Angular** | 21.0.0 | Frontend framework |
| **TypeScript** | 5.9.2 | Type-safe development |
| **RxJS** | 7.8.0 | Reactive programming |
| **CSS3** | - | Custom styling |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Node.js** | - | Runtime environment |
| **Express.js** | 4.18.2 | Web framework |
| **MongoDB** | - | Database |
| **Mongoose** | 8.0.0 | ODM library |
| **Helmet** | 7.0.0 | Security middleware |
| **CORS** | 2.8.5 | Cross-origin resource sharing |
| **Morgan** | 1.10.0 | HTTP request logger |
| **express-validator** | 7.0.1 | Request validation |

### Development Tools
- **Nodemon** - Auto-restart development server
- **Angular CLI** - Angular development tools
- **Vitest** - Testing framework
- **dotenv** - Environment configuration

---

## 📁 Project Structure

```
MEAN/
├── backend/                    # Node.js + Express.js Backend
│   ├── config/                 # Configuration files
│   ├── controllers/            # Request handlers
│   │   ├── studentController.js
│   │   ├── classController.js
│   │   ├── departmentController.js
│   │   └── courseController.js
│   ├── models/                 # MongoDB models
│   │   ├── Student.js
│   │   ├── Class.js
│   │   ├── Department.js
│   │   └── Course.js
│   ├── routes/                 # API routes
│   │   ├── studentRoutes.js
│   │   ├── classRoutes.js
│   │   ├── departmentRoutes.js
│   │   └── courseRoutes.js
│   ├── middlewares/            # Custom middlewares
│   │   └── errorHandler.js
│   ├── utils/                  # Utility functions
│   ├── test-data/              # Seed data
│   ├── .env                    # Environment variables
│   ├── server.js               # Entry point
│   └── package.json
│
└── frontend/                   # Angular Frontend
    ├── src/
    │   ├── app/
    │   │   ├── components/     # UI Components
    │   │   │   ├── dashboard/
    │   │   │   ├── students/
    │   │   │   ├── classes/
    │   │   │   ├── departments/
    │   │   │   ├── courses/
    │   │   │   └── layout/
    │   │   ├── models/         # TypeScript interfaces
    │   │   ├── services/       # API services
    │   │   ├── utils/          # Utility functions
    │   │   ├── app.routes.ts   # Routing configuration
    │   │   └── app.config.ts
    │   ├── styles.css          # Global styles
    │   └── index.html
    ├── angular.json
    ├── tsconfig.json
    └── package.json
```

---

## 🚀 Installation

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** package manager
- **Git** (optional) - [Download](https://git-scm.com/)

### Clone the Repository

```bash
git clone https://github.com/yourusername/student-management-system.git
cd student-management-system
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/student_management

# Other configurations
```

4. (Optional) Seed the database with sample data:
```bash
npm run seed
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

---

## ⚙️ Configuration

### Backend Configuration

Edit the `.env` file in the `backend/` directory:

```env
PORT=3000                                              # Server port
NODE_ENV=development                                   # Environment (development/production)
MONGODB_URI=mongodb://localhost:27017/student_management  # MongoDB connection string
```

### Frontend Configuration

Edit the `src/environments/environment.ts` file:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

---

## 🏃‍♂️ Running the Application

### Start MongoDB

Make sure MongoDB is running on your system:

```bash
# On Windows
mongod

# On macOS/Linux
sudo systemctl start mongod
```

### Start Backend Server

```bash
cd backend
npm run dev        # Development mode with auto-restart
# OR
npm start          # Production mode
```

Backend will run on: **http://localhost:3000**

### Start Frontend Application

```bash
cd frontend
npm start          # Starts Angular dev server
# OR
ng serve
```

Frontend will run on: **http://localhost:4200**

### Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:4200
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Students API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students` | Get all students |
| GET | `/students/:id` | Get student by ID |
| POST | `/students` | Create new student |
| PUT | `/students/:id` | Update student |
| DELETE | `/students/:id` | Delete student |
| GET | `/students/search` | Search students |

### Classes API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/classes` | Get all classes |
| GET | `/classes/:id` | Get class by ID |
| POST | `/classes` | Create new class |
| PUT | `/classes/:id` | Update class |
| DELETE | `/classes/:id` | Delete class |

### Departments API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/departments` | Get all departments |
| GET | `/departments/:id` | Get department by ID |
| POST | `/departments` | Create new department |
| PUT | `/departments/:id` | Update department |
| DELETE | `/departments/:id` | Delete department |

### Courses API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/courses` | Get all courses |
| GET | `/courses/:id` | Get course by ID |
| POST | `/courses` | Create new course |
| PUT | `/courses/:id` | Update course |
| DELETE | `/courses/:id` | Delete course |

### Example API Request

**Create a Student:**
```bash
POST /api/students
Content-Type: application/json

{
  "name": "John Doe",
  "rollNumber": "2024001",
  "email": "john.doe@example.com",
  "phone": "+1234567890",
  "dateOfBirth": "2005-01-15",
  "gender": "Male",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "guardianInfo": {
    "name": "Jane Doe",
    "relationship": "Mother",
    "phone": "+1234567891",
    "email": "jane.doe@example.com"
  },
  "academicYear": "2024-2025",
  "status": "Active"
}
```

---

## 🗄️ Database Schema

### Student Schema
```javascript
{
  name: String,
  rollNumber: String (unique),
  email: String (unique),
  phone: String,
  dateOfBirth: Date,
  gender: String,
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  guardianInfo: {
    name: String,
    relationship: String,
    phone: String,
    email: String
  },
  class: ObjectId (ref: Class),
  department: ObjectId (ref: Department),
  courses: [ObjectId] (ref: Course),
  academicYear: String,
  enrollmentDate: Date,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Class Schema
```javascript
{
  className: String,
  section: String,
  academicYear: String,
  classTeacher: {
    name: String,
    employeeId: String,
    email: String,
    phone: String
  },
  capacity: Number,
  currentStrength: Number,
  schedule: {
    days: [String],
    startTime: String,
    endTime: String
  },
  status: String
}
```

### Department Schema
```javascript
{
  departmentName: String,
  departmentCode: String (unique),
  headOfDepartment: {
    name: String,
    employeeId: String,
    email: String,
    phone: String,
    dateOfJoining: Date
  },
  facilities: [String],
  location: {
    building: String,
    floor: Number,
    roomNumber: String
  },
  contactEmail: String,
  contactPhone: String,
  establishedYear: Number,
  status: String
}
```

### Course Schema
```javascript
{
  courseCode: String (unique),
  courseName: String,
  description: String,
  department: ObjectId (ref: Department),
  creditHours: Number,
  courseType: String,
  semester: String,
  year: String,
  instructor: {
    name: String,
    employeeId: String,
    email: String,
    phone: String
  },
  schedule: {
    days: [String],
    startTime: String,
    endTime: String,
    location: String
  },
  maxStudents: Number,
  enrolledStudents: Number,
  prerequisites: [ObjectId] (ref: Course),
  gradingPolicy: Object,
  resources: [Object],
  status: String
}
```

---

## 🎨 Screenshots

### Dashboard
The main dashboard provides an overview of the system with quick statistics and navigation.

### Student List
Browse all students with advanced filtering options by class, department, and status.

### Student Details
Comprehensive student profile with personal, academic, and course information.

### Course Management
Create and manage courses with detailed information including schedules, prerequisites, and grading policies.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/AmazingFeature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
5. Push to the branch (`git push origin feature/AmazingFeature`)
6. Open a Pull Request

### Coding Standards
- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Update documentation as needed

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Aryan**

---

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- MongoDB for the powerful database
- Express.js for the lightweight web framework
- Node.js community for excellent packages

---

## 📧 Contact & Support

If you have any questions or need support:

- **Email**: your.email@example.com
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/student-management-system/issues)

---

<div align="center">

**Made with ❤️ using MEAN Stack**

⭐ Star this repository if you found it helpful!

</div>
