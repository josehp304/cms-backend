import { pgTable, serial, text, jsonb, integer, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Branch Table
export const branch = pgTable('branch', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  contact_no: text('contact_no').array(),
  address: text('address'),
  gmap_link: text('gmap_link'),
  room_rate: jsonb('room_rate'), // [{ title: string, rate_per_month: number }]
  prime_location_perks: jsonb('prime_location_perks'), // [{ title: string, distance: string, time_to_reach: string }]
  amenities: text('amenities').array(),
  property_features: text('property_features').array(),
  reg_fee: integer('reg_fee'),
  is_mess_available: boolean('is_mess_available').default(false),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});

// Gallery Table
export const gallery = pgTable('gallery', {
  id: serial('id').primaryKey(),
  branch_id: integer('branch_id')
    .references(() => branch.id, { onDelete: 'cascade' })
    .notNull(),
  image_url: text('image_url').notNull(),
  title: text('title'),
  description: text('description'),
  tags: text('tags').array(),
  display_order: integer('display_order').default(0),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// User Enquiries Table
export const user_enquiries = pgTable('user_enquiries', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  message: text('message'),
  branch_id: integer('branch_id').references(() => branch.id, { onDelete: 'set null' }),
  source: text('source'), // e.g., "website", "cta"
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Relations
export const branchRelations = relations(branch, ({ many }) => ({
  galleries: many(gallery),
  enquiries: many(user_enquiries),
}));

export const galleryRelations = relations(gallery, ({ one }) => ({
  branch: one(branch, {
    fields: [gallery.branch_id],
    references: [branch.id],
  }),
}));

export const userEnquiriesRelations = relations(user_enquiries, ({ one }) => ({
  branch: one(branch, {
    fields: [user_enquiries.branch_id],
    references: [branch.id],
  }),
}));

// TypeScript Types
export type Branch = typeof branch.$inferSelect;
export type NewBranch = typeof branch.$inferInsert;

export type Gallery = typeof gallery.$inferSelect;
export type NewGallery = typeof gallery.$inferInsert;

export type UserEnquiry = typeof user_enquiries.$inferSelect;
export type NewUserEnquiry = typeof user_enquiries.$inferInsert;
