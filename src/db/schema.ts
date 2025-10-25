import { sqliteTable, integer, text, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  role: text('role').notNull(),
  firebaseUid: text('firebase_uid').notNull().unique(),
  phone: text('phone'),
  createdAt: text('created_at').notNull(),
});

export const resources = sqliteTable('resources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  type: text('type').notNull(),
  description: text('description'),
  pricePerDay: real('price_per_day').notNull(),
  capacity: text('capacity'),
  location: text('location').notNull(),
  latitude: real('latitude'),
  longitude: real('longitude'),
  imageUrl: text('image_url'),
  status: text('status').notNull().default('pending'),
  verifiedBy: integer('verified_by').references(() => users.id),
  createdAt: text('created_at').notNull(),
});

export const bookings = sqliteTable('bookings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  farmerId: integer('farmer_id').notNull().references(() => users.id),
  resourceId: integer('resource_id').notNull().references(() => resources.id),
  ownerId: integer('owner_id').notNull().references(() => users.id),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  totalPrice: real('total_price').notNull(),
  status: text('status').notNull().default('pending'),
  cropType: text('crop_type'),
  farmStage: text('farm_stage'),
  cropWeight: text('crop_weight'),
  createdAt: text('created_at').notNull(),
});

export const chatMessages = sqliteTable('chat_messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  senderId: integer('sender_id').notNull().references(() => users.id),
  message: text('message').notNull(),
  createdAt: text('created_at').notNull(),
});