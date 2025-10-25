import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import connectDB from './mongodb';
import User, { IUser } from '@/models/User';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface JWTPayload {
    userId: string;
    email: string;
}

export const generateToken = (payload: JWTPayload): string => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jwt.sign(payload as any, JWT_SECRET);
};

export const verifyToken = (token: string): JWTPayload => {
    if (!JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined');
    }
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
};

export const getTokenFromRequest = (request: NextRequest): string | null => {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }

    // Also check for token in cookies
    const token = request.cookies.get('auth-token')?.value;
    return token || null;
};

export const getCurrentUser = async (request: { headers: Headers }): Promise<IUser | null> => {
    try {
        let token: string | null = null;
        const cookieHeader = request.headers.get('cookie');
        if (cookieHeader) {
            const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
                const [key, value] = cookie.trim().split('=');
                acc[key] = value;
                return acc;
            }, {} as Record<string, string>);
            token = cookies['auth-token'] || null;
        }
        
        if (!token) return null;

        const decoded = verifyToken(token);
        await connectDB();

        const user = await User.findById(decoded.userId).select('-password');
        return user;
    } catch (error) {
        return null;
    }
};

export const requireAuth = async (request: NextRequest): Promise<IUser> => {
    const user = await getCurrentUser(request);
    if (!user) {
        throw new Error('Authentication required');
    }
    return user;
};
