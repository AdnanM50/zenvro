import { getDb } from '@/lib/db';
import { UserModel } from '@/models/user.model';
import { hashPassword } from '@/lib/auth';

async function run() {
  try {
    const db = await getDb();
    console.log('Successfully connected to MongoDB');
    const users = await db.collection('users').find({}).toArray();
    console.log('Found users count:', users.length);
    console.log('Users in DB:', users.map((u) => ({ id: u._id.toString(), email: u.email, role: u.role, status: u.status })));

    // Check if admin@gmail.com exists
    const adminUser = users.find((u) => u.email === 'admin@gmail.com');
    if (!adminUser) {
      console.log('Admin user admin@gmail.com does NOT exist in MongoDB. Creating admin user now...');
      const hashedPassword = await hashPassword('123456');
      const newAdmin = {
        email: 'admin@gmail.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin' as const,
        status: 'active' as const,
        addresses: [],
        wishlist: [],
        createdAt: new Date(),
      };
      await db.collection('users').insertOne(newAdmin as any);
      console.log('Successfully created admin user: admin@gmail.com with password 123456');
    } else {
      console.log('Admin user exists in DB:', adminUser.email, 'Role:', adminUser.role);
    }
  } catch (err) {
    console.error('Error checking/creating admin user:', err);
  }
  process.exit(0);
}

run();
