# 🚗 VehicleBook - Vehicle Booking System

A modern, full-stack web application for managing vehicle reservations. Built with React, Node.js, and PostgreSQL.

![VehicleBook](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql)

## ✨ Features

- **📅 Interactive Calendar** - View bookings in month, week, or day view
- **🔐 User Authentication** - Secure signup/login with JWT
- **🚙 Multi-Vehicle Support** - Manage cars, vans, SUVs, and trucks
- **⚡ Conflict Detection** - Automatic prevention of double-bookings
- **🎨 Beautiful UI** - Modern, responsive design with smooth animations
- **👥 Team Collaboration** - See all team bookings at a glance
- **📱 Mobile Friendly** - Works great on all devices

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for blazing fast development
- Tailwind CSS for styling
- FullCalendar for calendar views
- React Router for navigation
- Axios for API calls
- Lucide React for icons

### Backend
- Node.js with Express
- TypeScript
- Prisma ORM
- PostgreSQL database
- JWT authentication
- bcrypt password hashing

## 📦 Prerequisites

- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd vehicle-booking-app
```

### 2. Set up the Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL="postgresql://user:password@localhost:5432/vehicle_booking"
# JWT_SECRET="your-super-secret-jwt-key-change-this"
# PORT=3001
# FRONTEND_URL="http://localhost:5173"

# Push database schema
npm run db:push

# Seed the database with sample data
npm run db:seed

# Start the development server
npm run dev
```

The backend will start on http://localhost:3001

### 3. Set up the Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will start on http://localhost:5173

### 4. Open the application

Visit http://localhost:5173 in your browser.

## 🔑 Demo Credentials

The seed script creates these accounts for testing:

| Email | Password | Name |
|-------|----------|------|
| demo@example.com | demo1234 | Demo User |
| alice@example.com | password123 | Alice Johnson |
| bob@example.com | password123 | Bob Smith |
| carol@example.com | password123 | Carol White |

## 📁 Project Structure

```
vehicle-booking-app/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # Database schema
│   │   └── seed.ts            # Seed data
│   ├── src/
│   │   ├── middleware/        # Auth & error handling
│   │   ├── routes/            # API routes
│   │   ├── index.ts           # Server entry point
│   │   └── types.ts           # TypeScript types
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   │   ├── booking/       # Booking-specific components
│   │   │   ├── common/        # Shared components
│   │   │   └── layout/        # Layout components
│   │   ├── context/           # React context providers
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utility functions
│   │   ├── App.tsx            # App routing
│   │   ├── main.tsx           # Entry point
│   │   └── index.css          # Global styles
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Log in
- `POST /api/auth/logout` - Log out
- `GET /api/auth/me` - Get current user

### Vehicles
- `GET /api/vehicles` - List all vehicles
- `GET /api/vehicles/:id` - Get vehicle details

### Bookings
- `GET /api/bookings` - List all bookings (with filters)
- `GET /api/bookings/my` - List current user's bookings
- `GET /api/bookings/:id` - Get booking details
- `POST /api/bookings` - Create booking
- `PUT /api/bookings/:id` - Update booking (owner only)
- `DELETE /api/bookings/:id` - Cancel booking (owner only)

## 🎨 Design System

The app uses a custom design system with:

- **Colors**: Teal primary, coral accent, lime success
- **Typography**: Quicksand (display), Nunito (body)
- **Borders**: Rounded corners (rounded-2xl, rounded-3xl)
- **Shadows**: Soft shadows for depth
- **Animations**: Float, bounce, pulse, slide effects

## 🔧 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/vehicle_booking"
JWT_SECRET="your-super-secret-jwt-key-change-this"
PORT=3001
FRONTEND_URL="http://localhost:5173"
```

## 📝 Available Scripts

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run start` - Run production build
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

---

Made with ❤️ for teams who need simple vehicle booking
