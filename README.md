# Task Flow

A full-stack task management application built with **Next.js, TypeScript, Prisma, and MySQL**.

Task Flow provides role-based access for **administrators and employees**. Employees can manage their tasks, while administrators can manage users, monitor tasks, and export task data.

## Features

### Authentication & Authorization

- User registration
- User login
- JWT-based authentication
- Protected API routes
- Current authenticated-user endpoint
- Role-based authorization
- Server-side access control

### Employee Features

- View tasks
- Create tasks
- Update tasks
- Delete tasks
- Manage task details:
  - Title
  - Description
  - Notes
  - Start time
  - Stop time
  - Status

### Administrator Features

- Dedicated admin dashboard
- View and manage users
- View tasks across the system
- Update user information
- Delete users
- Export task data

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | Full-stack web framework |
| TypeScript | Type-safe development |
| React | Frontend UI |
| Prisma | ORM and database access |
| MySQL | Relational database |
| JWT | Authentication |
| CSS | Application styling |
| Node.js | Runtime environment |
| Git & GitHub | Version control |

## Application Architecture

```text
                    ┌─────────────────┐
                    │      Client     │
                    │   React / Next  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Next.js API   │
                    │     Routes      │
                    └────────┬────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
        ┌─────────────────┐     ┌─────────────────┐
        │ Authentication  │     │ Role Middleware │
        │      + JWT      │     │ Admin / Employee│
        └────────┬────────┘     └────────┬────────┘
                 │                       │
                 └───────────┬───────────┘
                             ▼
                    ┌─────────────────┐
                    │     Prisma      │
                    │      ORM        │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │      MySQL      │
                    └─────────────────┘
```

## Project Structure

```text
Task_Flow/
│
├── app/
│   ├── admin/
│   │   └── page.tsx
│   │
│   ├── dashboard/
│   │   └── page.tsx
│   │
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   ├── me/
│   │   │   └── register/
│   │   │
│   │   ├── tasks/
│   │   │   ├── [id]/
│   │   │   ├── export/
│   │   │   └── route.ts
│   │   │
│   │   ├── users/
│   │   │   ├── [id]/
│   │   │   └── route.ts
│   │   │
│   │   └── test-db/
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── generated/
│   └── prisma/
│
├── prisma/
│   ├── migrations/
│   └── schema.prisma
│
├── public/
│
├── src/
│   └── lib/
│       ├── auth.ts
│       ├── auth-middleware.ts
│       ├── prisma.ts
│       └── role-middleware.ts
│
├── package.json
├── next.config.ts
├── prisma.config.ts
├── tsconfig.json
└── README.md
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Authenticate a user |
| GET | `/api/auth/me` | Get the authenticated user's information |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/tasks` | Retrieve tasks |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/[id]` | Retrieve a specific task |
| PUT/PATCH | `/api/tasks/[id]` | Update a task |
| DELETE | `/api/tasks/[id]` | Delete a task |
| GET | `/api/tasks/export` | Export task data |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | Retrieve users |
| POST | `/api/users` | Create a user |
| GET | `/api/users/[id]` | Retrieve a specific user |
| PUT/PATCH | `/api/users/[id]` | Update a user |
| DELETE | `/api/users/[id]` | Delete a user |

### Database

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/test-db` | Test database connectivity |

## Database

Task Flow uses **MySQL** with **Prisma ORM**.

The Prisma schema is located at:

```text
prisma/schema.prisma
```

Database migrations are maintained under:

```text
prisma/migrations/
```

The main entities are:

- `User`
- `Task`

Users and tasks are connected through database relationships to support task assignment and role-based access.

## Authentication Flow

Task Flow uses **JWT-based authentication**.

```text
User
 │
 ├── Register
 │      │
 │      ▼
 │   User Created
 │
 └── Login
        │
        ▼
    JWT Generated
        │
        ▼
 Authenticated Request
        │
        ▼
 Authentication Middleware
        │
        ▼
   Role Middleware
        │
     ┌──┴──┐
     ▼     ▼
 Employee Admin
     │     │
     ▼     ▼
  Tasks   Users
          & Tasks
```

Different application areas are protected according to the authenticated user's role.

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Pavani-Dev-99/Task_Flow.git
cd Task_Flow
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="mysql://USERNAME:PASSWORD@localhost:3306/DATABASE_NAME"
JWT_SECRET="your-strong-secret-key"
```

Replace the placeholder values with your MySQL credentials and a strong JWT secret.

**Do not commit `.env` files or other secrets to GitHub.**

### 4. Configure the database

Make sure MySQL is running and the configured database exists.

Run Prisma migrations:

```bash
npx prisma migrate dev
```

If Prisma Client needs to be regenerated:

```bash
npx prisma generate
```

### 5. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Development Commands

Start the development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

Run ESLint:

```bash
npm run lint
```

## Security

The application implements:

- JWT-based authentication
- Protected API endpoints
- Authentication middleware
- Role-based authorization
- Server-side access control
- Environment variables for sensitive configuration

Sensitive information such as database credentials and JWT secrets must never be committed to the repository.

## Future Improvements

Potential improvements include:

- Improved UI/UX
- Task filtering and search
- Pagination
- Task priority management
- Task deadlines and reminders
- Improved validation and error handling
- Automated unit and integration testing
- Docker support
- CI/CD pipeline
- Production deployment
- Improved audit logging

## Author

**Pavani Madhabattula**

[GitHub](https://github.com/Pavani-Dev-99)
