# 🎓 EduFlow LMS - Modern Learning Management System

A comprehensive, modern Learning Management System built with React, Node.js, and MongoDB. EduFlow provides a complete platform for online education with role-based access for students, instructors, and administrators.

![EduFlow LMS](https://img.shields.io/badge/EduFlow-LMS-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)

## 🚀 Live Demo

- **Frontend**: [https://online-learning-management-system-six.vercel.app](https://online-learning-management-system-six.vercel.app)
- **Backend API**: [https://online-learning-management-system-production-7ed3.up.railway.app](https://online-learning-management-system-production-7ed3.up.railway.app)
- **Admin Login**: [https://online-learning-management-system-six.vercel.app/admin-login](https://online-learning-management-system-six.vercel.app/admin-login)

## ✨ Features

### 👨‍🎓 Student Features

- **User Registration & Authentication** - Secure JWT-based authentication
- **Course Enrollment** - Browse and enroll in available courses
- **Assignment Submission** - Submit assignments with file uploads
- **Progress Tracking** - Track learning progress and grades
- **Interactive Dashboard** - Personalized student dashboard
- **Course Materials** - Access videos, documents, and other learning materials

### 👨‍🏫 Instructor Features

- **Course Management** - Create, edit, and manage courses
- **Content Upload** - Upload course materials (videos, documents, presentations)
- **Assignment Creation** - Create and manage assignments
- **Student Management** - View enrolled students and their progress
- **Grading System** - Grade assignments and provide feedback
- **Analytics Dashboard** - View course and student analytics

### 👨‍💼 Admin Features

- **User Management** - Manage students, instructors, and admins
- **System Analytics** - Comprehensive system-wide analytics
- **Instructor Approval** - Approve new instructor registrations
- **Course Oversight** - Monitor all courses and activities
- **System Configuration** - Configure system settings and permissions

## 🛠️ Tech Stack

### Frontend

- **React 18.2.0** - Modern UI library
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Hook Form** - Form handling and validation
- **React Hot Toast** - Toast notifications
- **Lucide React** - Modern icon library

### Backend

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security middleware

### Development Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Development server auto-restart
- **Concurrently** - Run multiple commands

## 📁 Project Structure

```
eduflow-lms/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts (Auth, etc.)
│   │   ├── services/       # API services
│   │   └── assets/         # Static assets
│   ├── public/             # Public assets
│   └── package.json        # Frontend dependencies
├── server/                 # Node.js backend
│   ├── routes/             # API routes
│   ├── models/             # Mongoose models
│   ├── middleware/         # Express middleware
│   ├── config/             # Configuration files
│   └── index.js            # Server entry point
├── database/               # Database schemas
├── scripts/                # Utility scripts
├── assets/                 # Shared assets
└── package.json            # Root dependencies
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Git installed

### 1. Clone the Repository

```bash
git clone https://github.com/Sitnascode/Online-learning-management-system.git
cd Online-learning-management-system
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client && npm install && cd ..
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000

# Database - MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eduflow_lms

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 4. Database Setup

The application will automatically connect to your MongoDB database. Make sure your MongoDB Atlas cluster is running and accessible.

### 5. Create Admin Account

```bash
npm run create-admin
```

Follow the prompts to create your first admin account.

### 6. Test Deployment Status

```bash
# Check if both frontend and backend are online
npm run check-deployment

# Test API connectivity
npm run test-api
```

### 7. Start Development Servers

```bash
# Start both frontend and backend
npm run dev

# Or start them separately:
npm run server:dev  # Backend only
npm run client:dev  # Frontend only
```

### 8. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Admin Login**: http://localhost:3000/admin-login

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - User login
- `POST /api/auth/admin-login` - Admin login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Course Endpoints

- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create new course (Instructor/Admin)
- `GET /api/courses/:id` - Get course details
- `PUT /api/courses/:id` - Update course (Instructor/Admin)
- `DELETE /api/courses/:id` - Delete course (Admin)
- `POST /api/courses/:id/enroll` - Enroll in course (Student)

### Assignment Endpoints

- `GET /api/assignments` - Get assignments
- `POST /api/assignments` - Create assignment (Instructor/Admin)
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments/:id/submit` - Submit assignment (Student)

### User Management (Admin)

- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🔧 Configuration

### Environment Variables

| Variable         | Description                          | Required           |
| ---------------- | ------------------------------------ | ------------------ |
| `NODE_ENV`       | Environment (development/production) | Yes                |
| `PORT`           | Server port                          | No (default: 5000) |
| `MONGODB_URI`    | MongoDB connection string            | Yes                |
| `JWT_SECRET`     | JWT signing secret                   | Yes                |
| `JWT_EXPIRES_IN` | JWT expiration time                  | No (default: 7d)   |
| `CLIENT_URL`     | Frontend URL for CORS                | Yes                |
| `EMAIL_HOST`     | SMTP host for emails                 | No                 |
| `EMAIL_PORT`     | SMTP port                            | No                 |
| `EMAIL_USER`     | SMTP username                        | No                 |
| `EMAIL_PASS`     | SMTP password                        | No                 |

### Database Configuration

The application uses MongoDB with Mongoose ODM. The database schema includes:

- **Users** - Students, instructors, and admins
- **Courses** - Course information and content
- **Assignments** - Assignment details and submissions
- **Enrollments** - Student-course relationships

## 🚀 Deployment

### Frontend Deployment (Vercel)

1. Connect your GitHub repository to Vercel
2. Set the root directory to `client`
3. Set build command to `npm run build`
4. Set output directory to `dist`
5. Add environment variable: `VITE_API_URL=your-backend-url/api`

### Backend Deployment (Railway/Render)

1. Connect your GitHub repository
2. Set build command to `npm install`
3. Set start command to `npm start`
4. Add all required environment variables

### Full-Stack Deployment Options

- **Vercel** (Frontend) + **Railway** (Backend)
- **Netlify** (Frontend) + **Render** (Backend)
- **Heroku** (Full-stack)
- **DigitalOcean App Platform** (Full-stack)

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint

# Check for security vulnerabilities
npm audit
```

## 📱 Mobile Responsiveness

EduFlow LMS is fully responsive and works seamlessly on:

- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1440px+)

## 🔒 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt password encryption
- **CORS Protection** - Cross-origin request security
- **Helmet Security** - HTTP security headers
- **Rate Limiting** - API request rate limiting
- **Input Validation** - Server-side input validation
- **File Upload Security** - Secure file handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Sitra Nasir**

- GitHub: [@Sitnascode](https://github.com/Sitnascode)
- Project: [Online Learning Management System](https://github.com/Sitnascode/Online-learning-management-system)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB team for the excellent database
- Vercel for hosting and deployment
- All contributors and users of this project

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/Sitnascode/Online-learning-management-system/issues) page
2. Create a new issue with detailed information
3. Contact the maintainer

---

**⭐ If you find this project helpful, please give it a star!**

Made with ❤️ by [Sitra Nasir](https://github.com/Sitnascode)
