import { db } from '../src/lib/db/index';
import { users } from '../src/lib/db/schema';

async function main() {
    console.log('Fetching users to verify roles...');
    try {
        const allUsers = await db.query.users.findMany();
        console.log('Users found:', allUsers.map(u => ({ email: u.email, role: u.role, isApproved: u.isApproved })));
    } catch (error) {
        console.error('Error fetching users:', error);
    }
    process.exit(0);
}

main();
