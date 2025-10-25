# Authentication Setup Guide

This guide explains how to set up and use the authentication system that has been added to your Next.js application.

## Features Added

✅ **MongoDB Integration** - User data storage with Mongoose ODM
✅ **JWT Authentication** - Secure token-based authentication
✅ **User Registration & Login** - Complete signup/signin flow
✅ **User Profile Management** - Edit profile information and avatar
✅ **Protected Routes** - Route protection with authentication middleware
✅ **Responsive UI Components** - Modern authentication forms with validation
✅ **Password Security** - Bcrypt hashing for secure password storage

## Setup Instructions

### 1. Environment Variables

Update your `.env` file with the following variables:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/nextn-auth

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# NextAuth Configuration (for future use)
NEXTAUTH_URL=http://localhost:9002
NEXTAUTH_SECRET=your-nextauth-secret-change-this-in-production
```

### 2. MongoDB Setup

**Option A: Local MongoDB**
1. Install MongoDB locally: https://docs.mongodb.com/manual/installation/
2. Start MongoDB service
3. Use the connection string: `mongodb://localhost:27017/nextn-auth`

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/atlas
2. Create a new cluster
3. Get connection string and update `MONGODB_URI`
4. Example: `mongodb+srv://username:password@cluster.mongodb.net/nextn-auth`

### 3. Install Dependencies

The following packages have been installed:
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT token generation/verification

### 4. Start the Application

```bash
npm run dev
```

## Available Routes

### Public Routes
- `/` - Home page
- `/auth` - Login/Signup page

### Protected Routes
- `/profile` - User profile management
- `/dashboard` - User dashboard (example)

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

#### User Management
- `PUT /api/user/profile` - Update user profile

## Usage Examples

### Using the Authentication Context

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, login, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  
  if (user) {
    return <div>Welcome, {user.name}!</div>;
  }
  
  return <div>Please log in</div>;
}
```

### Protecting Routes

```tsx
import ProtectedRoute from '@/components/auth/ProtectedRoute';

function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <div>This content is only visible to authenticated users</div>
    </ProtectedRoute>
  );
}
```

### Making Authenticated API Calls

```tsx
// The auth context automatically handles cookies
// Just make requests with credentials: 'include'

const response = await fetch('/api/user/profile', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(profileData),
  credentials: 'include'
});
```

## Security Features

1. **Password Hashing** - Passwords are hashed using bcrypt with salt rounds
2. **JWT Tokens** - Secure token-based authentication
3. **HTTP-Only Cookies** - Tokens stored in secure HTTP-only cookies
4. **Input Validation** - Zod schema validation on all forms
5. **CORS Protection** - Proper CORS headers for API routes

## Customization

### Styling
All components use your existing UI component library and are fully customizable.

### Validation
Form validation schemas are defined using Zod and can be modified in the component files.

### Database Schema
The User model can be extended by modifying `/src/models/User.ts`.

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network access for MongoDB Atlas

2. **JWT Secret Error**
   - Ensure `JWT_SECRET` is set in `.env`
   - Use a strong, random secret in production

3. **Cookie Issues**
   - Check browser developer tools for cookie settings
   - Ensure `NEXTAUTH_URL` matches your domain

### Development Tips

- Use MongoDB Compass to view your database
- Check browser Network tab for API request/response details
- Use React Developer Tools to inspect auth context state

## Next Steps

1. **Email Verification** - Add email verification for new accounts
2. **Password Reset** - Implement forgot password functionality
3. **Social Login** - Add Google/GitHub OAuth integration
4. **Role-Based Access** - Implement user roles and permissions
5. **Session Management** - Add session timeout and refresh tokens

## File Structure

```
src/
├── app/
│   ├── api/auth/          # Authentication API routes
│   ├── auth/              # Auth page (login/signup)
│   ├── profile/           # User profile page
│   └── dashboard/         # Protected dashboard
├── components/
│   ├── auth/              # Auth-related components
│   └── layout/            # Navigation with auth status
├── contexts/
│   └── AuthContext.tsx    # Authentication context
├── lib/
│   ├── auth.ts           # JWT utilities
│   └── mongodb.ts        # Database connection
└── models/
    └── User.ts           # User database model
```

The authentication system is now fully integrated and ready to use!