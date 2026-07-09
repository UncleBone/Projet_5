import { UserDTO } from '@/dto/user.dto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = String(process.env.JWT_SECRET || 'default-secret-key');

export function generateToken(user: UserDTO): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): any {
    console.log(JWT_SECRET,token)
  try {
    const result = jwt.verify(token, JWT_SECRET);
    return result
  } catch (error) {
    console.log("verify error",error)
    return null;
  }
}