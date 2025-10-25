import { db } from '@/db';
import { users } from '@/db/schema';

async function main() {
    const sampleUsers = [
        // Admin users
        {
            email: 'admin1@agrigo.com',
            name: 'Admin Kumar',
            role: 'admin',
            firebaseUid: 'firebase_admin1',
            phone: '+91 98765 43210',
            createdAt: new Date('2024-01-15').toISOString(),
        },
        {
            email: 'admin2@agrigo.com',
            name: 'Admin Sharma',
            role: 'admin',
            firebaseUid: 'firebase_admin2',
            phone: '+91 98765 43211',
            createdAt: new Date('2024-02-10').toISOString(),
        },
        {
            email: 'admin3@agrigo.com',
            name: 'Admin Patel',
            role: 'admin',
            firebaseUid: 'firebase_admin3',
            phone: '+91 98765 43212',
            createdAt: new Date('2024-03-05').toISOString(),
        },
        // Farmer users
        {
            email: 'farmer1@agrigo.com',
            name: 'Farmer Raj Singh',
            role: 'farmer',
            firebaseUid: 'firebase_farmer1',
            phone: '+91 87654 32109',
            createdAt: new Date('2024-03-20').toISOString(),
        },
        {
            email: 'farmer2@agrigo.com',
            name: 'Farmer Mohan Reddy',
            role: 'farmer',
            firebaseUid: 'firebase_farmer2',
            phone: '+91 87654 32108',
            createdAt: new Date('2024-04-12').toISOString(),
        },
        {
            email: 'farmer3@agrigo.com',
            name: 'Farmer Ramesh Yadav',
            role: 'farmer',
            firebaseUid: 'firebase_farmer3',
            phone: '+91 87654 32107',
            createdAt: new Date('2024-05-08').toISOString(),
        },
        {
            email: 'farmer4@agrigo.com',
            name: 'Farmer Suresh Naik',
            role: 'farmer',
            firebaseUid: 'firebase_farmer4',
            phone: '+91 87654 32106',
            createdAt: new Date('2024-06-15').toISOString(),
        },
        {
            email: 'farmer5@agrigo.com',
            name: 'Farmer Krishna Patil',
            role: 'farmer',
            firebaseUid: 'firebase_farmer5',
            phone: '+91 87654 32105',
            createdAt: new Date('2024-07-22').toISOString(),
        },
        // Owner users
        {
            email: 'owner1@agrigo.com',
            name: 'Owner Singh',
            role: 'owner',
            firebaseUid: 'firebase_owner1',
            phone: '+91 76543 21098',
            createdAt: new Date('2024-04-01').toISOString(),
        },
        {
            email: 'owner2@agrigo.com',
            name: 'Owner Gupta',
            role: 'owner',
            firebaseUid: 'firebase_owner2',
            phone: '+91 76543 21097',
            createdAt: new Date('2024-04-18').toISOString(),
        },
        {
            email: 'owner3@agrigo.com',
            name: 'Owner Desai',
            role: 'owner',
            firebaseUid: 'firebase_owner3',
            phone: '+91 76543 21096',
            createdAt: new Date('2024-05-25').toISOString(),
        },
        {
            email: 'owner4@agrigo.com',
            name: 'Owner Verma',
            role: 'owner',
            firebaseUid: 'firebase_owner4',
            phone: '+91 76543 21095',
            createdAt: new Date('2024-06-30').toISOString(),
        },
        {
            email: 'owner5@agrigo.com',
            name: 'Owner Mehta',
            role: 'owner',
            firebaseUid: 'firebase_owner5',
            phone: '+91 76543 21094',
            createdAt: new Date('2024-07-10').toISOString(),
        },
    ];

    await db.insert(users).values(sampleUsers);
    
    console.log('✅ Users seeder completed successfully - 13 users created');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});