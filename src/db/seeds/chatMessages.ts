import { db } from '@/db';
import { chatMessages } from '@/db/schema';

async function main() {
    const sampleChatMessages = [
        // Booking 1: Farmer 5 renting from Owner 4
        {
            bookingId: 1,
            senderId: 5,
            message: 'Hi, I\'m interested in renting your tractor for the upcoming planting season. Is it still available?',
            createdAt: new Date('2024-01-16T09:15:00').toISOString(),
        },
        {
            bookingId: 1,
            senderId: 4,
            message: 'Yes, it\'s available! The tractor is in excellent condition and was just serviced last week. When do you need it?',
            createdAt: new Date('2024-01-16T09:47:00').toISOString(),
        },
        {
            bookingId: 1,
            senderId: 5,
            message: 'Perfect! I need it from January 20th to 25th for plowing about 15 acres. Will that work?',
            createdAt: new Date('2024-01-16T10:22:00').toISOString(),
        },
        {
            bookingId: 1,
            senderId: 4,
            message: 'That works great! I\'ll make sure it\'s fueled up and ready. I can deliver it to your farm on the 20th morning.',
            createdAt: new Date('2024-01-16T11:05:00').toISOString(),
        },

        // Booking 2: Farmer 6 renting from Owner 5
        {
            bookingId: 2,
            senderId: 6,
            message: 'Hello! I saw your harvester listing. Does it come with all the attachments for wheat harvesting?',
            createdAt: new Date('2024-01-17T08:30:00').toISOString(),
        },
        {
            bookingId: 2,
            senderId: 5,
            message: 'Yes, it includes the grain header and all necessary attachments. It can handle up to 5 acres per hour.',
            createdAt: new Date('2024-01-17T09:12:00').toISOString(),
        },
        {
            bookingId: 2,
            senderId: 6,
            message: 'Excellent! I have about 40 acres ready for harvest. Can I rent it for 3 days starting January 22nd?',
            createdAt: new Date('2024-01-17T09:45:00').toISOString(),
        },
        {
            bookingId: 2,
            senderId: 5,
            message: 'Absolutely! I\'ll include a quick training session on the controls. The harvester is very efficient and easy to operate.',
            createdAt: new Date('2024-01-17T10:20:00').toISOString(),
        },

        // Booking 3: Farmer 7 renting from Owner 6
        {
            bookingId: 3,
            senderId: 7,
            message: 'Hi, I need to rent your grain storage facility for about 50 tons of corn. What\'s the capacity?',
            createdAt: new Date('2024-01-18T07:45:00').toISOString(),
        },
        {
            bookingId: 3,
            senderId: 6,
            message: 'The facility can hold up to 100 tons and has climate control to prevent moisture damage. It\'s perfect for corn storage.',
            createdAt: new Date('2024-01-18T08:30:00').toISOString(),
        },
        {
            bookingId: 3,
            senderId: 7,
            message: 'That sounds perfect! I\'ll need it from January 25th to February 10th. Do you have loading equipment available?',
            createdAt: new Date('2024-01-18T09:15:00').toISOString(),
        },
        {
            bookingId: 3,
            senderId: 6,
            message: 'Yes, we have a grain auger you can use at no extra charge. Access is 24/7 with your own lock and key.',
            createdAt: new Date('2024-01-18T10:00:00').toISOString(),
        },

        // Booking 4: Farmer 8 renting from Owner 7
        {
            bookingId: 4,
            senderId: 8,
            message: 'Good morning! I\'m looking to rent your irrigation system for my vegetable farm. How large an area does it cover?',
            createdAt: new Date('2024-01-19T08:00:00').toISOString(),
        },
        {
            bookingId: 4,
            senderId: 7,
            message: 'Good morning! The system can irrigate up to 20 acres efficiently. It includes all hoses, sprinklers, and a pump.',
            createdAt: new Date('2024-01-19T08:45:00').toISOString(),
        },
        {
            bookingId: 4,
            senderId: 8,
            message: 'Great! I have 12 acres of tomatoes that need regular watering. Can I rent it for the whole growing season?',
            createdAt: new Date('2024-01-19T09:30:00').toISOString(),
        },
        {
            bookingId: 4,
            senderId: 7,
            message: 'Yes, long-term rentals work well. I can give you a 15% discount for seasonal rental. Let me know if you need help with setup.',
            createdAt: new Date('2024-01-19T10:15:00').toISOString(),
        },

        // Booking 5: Farmer 4 renting from Owner 8
        {
            bookingId: 5,
            senderId: 4,
            message: 'Hi there! I need to rent your seeding equipment for planting soybeans. What\'s the seeding rate capacity?',
            createdAt: new Date('2024-01-20T07:30:00').toISOString(),
        },
        {
            bookingId: 5,
            senderId: 8,
            message: 'Hello! The seeder can plant up to 8 rows at a time with adjustable spacing. It works great for soybeans and can cover about 25 acres per day.',
            createdAt: new Date('2024-01-20T08:15:00').toISOString(),
        },
        {
            bookingId: 5,
            senderId: 4,
            message: 'Perfect timing! I have 60 acres ready for planting. Would January 28th to 31st work for you?',
            createdAt: new Date('2024-01-20T09:00:00').toISOString(),
        },
        {
            bookingId: 5,
            senderId: 8,
            message: 'Yes, those dates are available! I\'ll make sure the seeder is calibrated and all seed boxes are clean before delivery.',
            createdAt: new Date('2024-01-20T09:45:00').toISOString(),
        },
    ];

    await db.insert(chatMessages).values(sampleChatMessages);
    
    console.log('✅ Chat messages seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});