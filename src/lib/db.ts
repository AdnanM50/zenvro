// Simple in-memory database for demonstration
// In production, replace with a real database like PostgreSQL, MongoDB, etc.

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
}

// In-memory user storage
const users: Map<string, User> = new Map();

export const db = {
  user: {
    async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
      const id = crypto.randomUUID();
      const user: User = {
        id,
        ...data,
        createdAt: new Date(),
      };
      users.set(id, user);
      return user;
    },

    async findByEmail(email: string): Promise<User | null> {
      for (const user of users.values()) {
        if (user.email === email) {
          return user;
        }
      }
      return null;
    },

    async findById(id: string): Promise<User | null> {
      return users.get(id) || null;
    },
  },
};
