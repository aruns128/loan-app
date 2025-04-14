import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export const generateToken = (payload: object) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
};

export function verifyToken(token: string) {
  const secret = process.env.JWT_SECRET; // You should store the secret in your environment variables
  if (!secret) throw new Error('JWT secret is not defined');

  try {
    const decoded = jwt.verify(token, secret) as { id: string }; // Expecting { id: string } in the payload
    return decoded; // This will return { id: userId }
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

