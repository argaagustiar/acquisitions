# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

### Development
- `npm run dev` - Start development server with file watching (uses Node.js --watch)
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Run ESLint and automatically fix issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check if code is properly formatted

### Database Operations
- `npm run db:generate` - Generate Drizzle migrations from schema changes
- `npm run db:migrate` - Run pending migrations against the database
- `npm run db:studio` - Open Drizzle Studio for database management GUI

## Architecture Overview

This is a Node.js REST API built with Express.js that follows a layered MVC architecture with clear separation of concerns.

### Core Stack
- **Runtime**: Node.js with ES modules (`type: "module"`)
- **Framework**: Express.js v5 for HTTP server
- **Database**: PostgreSQL with Neon serverless driver
- **ORM**: Drizzle ORM for type-safe database operations
- **Validation**: Zod for request/response validation
- **Authentication**: JWT tokens with secure HTTP-only cookies
- **Logging**: Winston for structured logging
- **Security**: Helmet, CORS, bcrypt for password hashing

### Directory Structure
The codebase uses path imports (prefixed with `#`) for clean internal imports:

- `src/config/` - Database connection and logging configuration
- `src/models/` - Drizzle ORM schema definitions (currently `user.model.js`)
- `src/routes/` - Express route definitions organized by feature
- `src/controllers/` - Request handlers that process HTTP requests/responses
- `src/services/` - Business logic layer that interacts with models
- `src/utils/` - Shared utilities (JWT, cookies, formatting)
- `src/validations/` - Zod schemas for request validation
- `src/middleware/` - Custom Express middleware (directory exists but empty)

### Key Architectural Patterns

**Layered Architecture**: Clear separation between routes → controllers → services → models
- Routes define HTTP endpoints and pass requests to controllers
- Controllers handle HTTP-specific logic, validation, and response formatting
- Services contain business logic and interact with the database
- Models define database schema using Drizzle ORM

**Path Import Aliases**: Uses Node.js imports map for clean internal imports:
```javascript
import logger from '#config/logger.js';
import { users } from '#models/user.model.js';
```

**Error Handling**: Centralized error handling with Winston logging and structured error responses

**Database Layer**: 
- Uses Drizzle ORM with PostgreSQL
- Schema-first approach with type safety
- Migrations managed through `drizzle-kit`
- Connection through Neon serverless driver

### Authentication Flow
- JWT tokens stored in secure HTTP-only cookies
- Password hashing with bcrypt (10 rounds)
- Role-based access control (user/admin roles)
- Cookie configuration adapts to environment (secure in production)

### Current API Endpoints
- `GET /` - Basic hello world
- `GET /health` - Health check with uptime
- `GET /api` - API welcome message
- `POST /api/auth/sign-up` - User registration (fully implemented)
- `POST /api/auth/sign-in` - User login (placeholder)
- `POST /api/auth/sign-out` - User logout (placeholder)

### Environment Configuration
Requires `.env` file with:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT signing
- `LOG_LEVEL` - Winston log level (defaults to 'info')
- `NODE_ENV` - Environment (affects cookie security and logging)
- `PORT` - Server port (defaults to 3000)

### Development Notes
- Uses ESLint with strict rules (2-space indentation, single quotes, semicolons required)
- Prettier for code formatting
- Winston logging with file output to `logs/` directory
- No test framework currently configured
- Uses modern JavaScript features (ES2022, modules, async/await)