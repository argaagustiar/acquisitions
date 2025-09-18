import logger from '#config/logger.js';
import bcrypt from 'bcrypt';
import { db } from '#config/database.js';
import { eq } from 'drizzle-orm';
import { users } from '#models/user.model.js';

export const hashPassword = async (password) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (error) {
    console.error('Error hashing password:', error);
    logger.error('Error hashing password:', error);
    throw new Error('Error hashing password');
  }
};

export const comparePassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    console.error('Error comparing password:', error);
    logger.error('Error comparing password:', error);
    throw new Error('Error comparing password');
  }
};

export const authenticateUser = async ({ email, password }) => {
  try {
    const [existingUser] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!existingUser) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await comparePassword(password, existingUser.password);
    
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    logger.info(`User authenticated: ${email}`);
    return {
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      role: existingUser.role
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    logger.error('Error authenticating user:', error);
    throw error;
  }
};

export const createUser = async ({ name, email, password, role = 'user' }) => {
  try {
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existingUser.length > 0) throw new Error('User with this mail already exists');

    const hashedPassword = await hashPassword(password);
        
    const [newUser] = await db.insert(users)
      .values({ name, email, password: hashedPassword, role })
      .returning({ id: users.id, name: users.name, email: users.email, role: users.role, created_at: users.created_at });

    logger.info(`User created: ${email}`);
    return newUser;
  } catch (error) {
    console.error('Error creating user:', error);
    logger.error('Error creating user:', error);
    throw error;
  }
};
