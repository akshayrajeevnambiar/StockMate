# PantryPal - Inventory Management System

A comprehensive inventory management system built with FastAPI and React, designed for restaurants, cafes, and food service businesses to efficiently track and manage their pantry inventory.

## 🏗️ Architecture Overview

```
PantryPal/
├── backend/                 # FastAPI backend server
│   ├── app/
│   │   ├── models/         # SQLAlchemy database models
│   │   ├── routers/        # FastAPI route handlers
│   │   ├── services/       # Business logic layer
│   │   └── database.py     # Database configuration
│   ├── tests/              # Backend test suite
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service modules
│   │   ├── hooks/          # Custom React hooks
│   │   └── types/          # TypeScript definitions
│   ├── tests/              # Frontend test suite
│   └── package.json        # Node.js dependencies
└── README.md              # This file
```

## 🚀 Tech Stack

### Backend

- **FastAPI** - Modern, fast web framework for Python
- **PostgreSQL** - Robust relational database
- **SQLAlchemy** - Python SQL toolkit and ORM
- **Alembic** - Database migration tool
- **JWT Authentication** - Secure token-based authentication
- **Pytest** - Testing framework

### Frontend

- **React 18** with **TypeScript** - Modern UI framework
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **TanStack Query** - Data fetching and state management
- **React Hook Form** - Form handling and validation
- **Vitest** - Fast unit testing framework

## 🎯 Core Features

### � **Dashboard**

- Real-time inventory overview
- Low stock alerts and notifications
- Quick action buttons for common tasks
- Statistics and metrics display

### 📦 **Inventory Management**

- **Items CRUD**: Create, read, update, delete inventory items
- **Categories**: Organize items by type (Produce, Dairy, Meat, etc.)
- **Stock Levels**: Track current quantity vs. par levels
- **Low Stock Detection**: Automatic alerts for items below minimum threshold

### 📋 **Inventory Counts**

- **Count Creation**: Create new inventory count sessions
- **Item Tracking**: Record actual vs. expected quantities
- **Workflow States**: Draft → Submitted → Approved/Rejected
- **Discrepancy Reporting**: Identify and track inventory variances
- **Role-based Approval**: Manager/Admin approval process

### 👥 **User Management**

- **Role-based Access Control**: Admin, Manager, Staff roles
- **Secure Authentication**: JWT-based login system
- **User Permissions**: Different access levels per role
- **Session Management**: Automatic token refresh

### 🔍 **Advanced Features**

- **Filtering & Search**: Filter by category, stock status
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Automatic data synchronization
- **Error Handling**: Comprehensive error messages and validation

## 🏃‍♂️ Quick Start Guide

### Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 13+**
- **Git**

### 1. Clone Repository

```bash
git clone <repository-url>
cd PantryPal
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
alembic upgrade head

# Create initial admin user
python create_admin.py

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: http://localhost:8000

### 3. Frontend Setup

```bash
# Navigate to frontend directory (new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: http://localhost:5173

## 🔐 Default Credentials

```
Email: admin@example.com
Password: adminpassword
```

## 📖 User Guide

### 1. **Login Process**

1. Navigate to http://localhost:5173
2. Enter credentials on login page
3. System redirects to dashboard upon successful authentication

### 2. **Dashboard Operations**

- **View Overview**: See total items, low stock alerts, recent activity
- **Quick Actions**: Access to add new items, view low stock items
- **Navigation**: Use sidebar or header navigation to access different sections

### 3. **Managing Inventory Items**

#### Adding New Items:

1. Click "Add Item" button
2. Fill required fields:
   - **Name**: Item identifier
   - **Category**: Item classification
   - **Unit of Measure**: e.g., pieces, kg, liters
   - **Par Level**: Target inventory level
   - **Current Quantity**: Current stock amount
3. Optionally add description
4. Click "Create Item"

#### Updating Items:

1. Navigate to Items page
2. Click "Edit" next to desired item
3. Modify fields as needed
4. Click "Update Item"

#### Deleting Items:

1. Navigate to Items page
2. Click "Delete" next to item
3. Confirm deletion in popup dialog

### 4. **Inventory Counts Workflow**

#### Creating a Count:

1. Go to Counts section
2. Click "Create New Count"
3. Select date and add notes
4. Add items to count by searching/selecting

#### Processing Counts:

1. **Staff**: Enter actual quantities found during physical count
2. **Submit**: Submit count for manager review
3. **Manager/Admin**: Review and approve/reject counts
4. **Approved Counts**: Automatically update inventory quantities

### 5. **Filtering and Search**

- **Category Filter**: Filter items by category (Produce, Dairy, etc.)
- **Stock Status**: View only low stock items
- **Search**: Find items by name or description

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

### Frontend Tests

```bash
cd frontend
npm test
```

### Test Coverage

- **Backend**: Authentication, CRUD operations, business logic
- **Frontend**: Component rendering, user interactions, service layer
- **Integration**: API endpoints, data flow, error handling

## 🔧 Development Workflow

### 1. **Adding New Features**

1. Create feature branch from main
2. Implement backend changes (models, routes, tests)
3. Implement frontend changes (components, services, tests)
4. Test thoroughly in development environment
5. Create pull request for review

### 2. **Database Changes**

```bash
# Create new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migration
alembic upgrade head
```

### 3. **API Development**

- Backend API documentation: http://localhost:8000/docs
- Interactive API testing: http://localhost:8000/redoc
- All endpoints require authentication except login

## 🚢 Deployment

### Backend Deployment

1. Set up production PostgreSQL database
2. Configure environment variables for production
3. Run database migrations
4. Deploy using Docker, Heroku, or cloud provider
5. Set up CORS for frontend domain

### Frontend Deployment

1. Build production assets: `npm run build`
2. Configure API base URL for production
3. Deploy to static hosting (Vercel, Netlify, etc.)
4. Set up custom domain and SSL

### Environment Variables

#### Backend (.env)

```env
DATABASE_URL=postgresql://user:password@localhost:5433/pantrypal
SECRET_KEY=your-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
FRONTEND_URL=http://localhost:5173
```

#### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:8000/api
```

## 📱 Mobile Compatibility

The application is fully responsive and works on:

- **Desktop**: Full feature set with optimized layout
- **Tablets**: Touch-friendly interface with adapted navigation
- **Mobile Phones**: Streamlined mobile experience

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permissions for Admin/Manager/Staff
- **Password Security**: Hashed passwords with bcrypt
- **API Rate Limiting**: Protection against abuse
- **CORS Configuration**: Secure cross-origin requests
- **Input Validation**: Comprehensive data validation on frontend and backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please:

1. Check the documentation above
2. Review existing GitHub issues
3. Create a new issue with detailed description
4. Contact the development team

---

**Built with ❤️ by the PantryPal Team**
npm run dev

````

The app will be available at http://localhost:5173

### Build

```bash
npm run build
````

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── Layout.tsx      # Main layout with navigation
│   └── ProtectedRoute.tsx  # Route wrapper for authentication
├── pages/              # Page components
│   ├── LoginPage.tsx   # Login page
│   ├── DashboardPage.tsx  # Dashboard with stats
│   ├── ItemsPage.tsx   # Items list view
│   ├── ItemFormPage.tsx   # Create/edit item form
│   └── CountsPage.tsx  # Inventory counts (placeholder)
├── services/           # API service modules
│   ├── api.ts          # Axios client with interceptors
│   ├── auth.ts         # Authentication service
│   └── items.ts        # Items CRUD service
├── hooks/              # Custom React hooks
│   └── useAuth.ts      # Authentication hook
├── types/              # TypeScript type definitions
│   └── index.ts        # Shared types and interfaces
└── utils/              # Utility functions
```

## Available Routes

- `/login` - Login page
- `/` - Dashboard (protected)
- `/items` - Items list (protected)
- `/items/new` - Create new item (protected)
- `/items/:id/edit` - Edit item (protected)
- `/counts` - Inventory counts (protected, placeholder)

## Authentication

- Tokens stored in `localStorage`
- Access token added automatically to API requests
- Auto token refresh on 401 responses
- Redirect to login when tokens expire

## Default Credentials

- **Email**: admin@example.com
- **Password**: adminpassword

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
