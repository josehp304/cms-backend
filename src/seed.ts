import { db } from './db';
import { branch, gallery, user_enquiries } from './db/schema';

async function seed() {
  try {
    console.log('🌱 Seeding database...');

    // Insert sample branches
    const branches = await db
      .insert(branch)
      .values([
        {
          name: 'Nyxta Downtown Branch',
          contact_no: ['+91-9876543210', '+91-9876543211'],
          address: '123 MG Road, Bangalore, Karnataka 560001',
          gmap_link: 'https://maps.google.com/?q=12.9716,77.5946',
          room_rate: [
            { title: 'Single Occupancy', rate_per_month: 8000 },
            { title: 'Double Occupancy', rate_per_month: 6000 },
            { title: 'Triple Occupancy', rate_per_month: 5000 },
          ],
          prime_location_perks: [
            { title: 'Metro Station', distance: '500m', time_to_reach: '5 mins' },
            { title: 'Shopping Mall', distance: '1km', time_to_reach: '10 mins' },
            { title: 'Tech Park', distance: '2km', time_to_reach: '15 mins' },
          ],
          amenities: [
            'WiFi',
            'AC Rooms',
            'Laundry',
            'Gym',
            'Power Backup',
            'CCTV',
          ],
          property_features: [
            'Attached Bathroom',
            'Study Table',
            'Wardrobe',
            'Security Guard',
            'Parking',
          ],
          reg_fee: 2000,
          is_mess_available: true,
        },
        {
          name: 'Nyxta Tech Park Branch',
          contact_no: ['+91-9876543220'],
          address: '456 Whitefield Road, Bangalore, Karnataka 560066',
          gmap_link: 'https://maps.google.com/?q=12.9698,77.7499',
          room_rate: [
            { title: 'Single Occupancy', rate_per_month: 9000 },
            { title: 'Double Occupancy', rate_per_month: 7000 },
          ],
          prime_location_perks: [
            { title: 'IT Companies', distance: '800m', time_to_reach: '8 mins' },
            { title: 'Food Court', distance: '300m', time_to_reach: '3 mins' },
          ],
          amenities: [
            'WiFi',
            'AC Rooms',
            'Laundry',
            'Power Backup',
            'Common Room',
          ],
          property_features: [
            'Attached Bathroom',
            'Study Table',
            'Wardrobe',
            'Security Guard',
          ],
          reg_fee: 2500,
          is_mess_available: false,
        },
      ])
      .returning();

    console.log(`✅ Inserted ${branches.length} branches`);

    // Insert sample gallery images
    const galleryImages = await db
      .insert(gallery)
      .values([
        {
          branch_id: branches[0]!.id,
          image_url: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5',
          title: 'Spacious Room View',
          description: 'Modern and well-furnished single occupancy room',
          tags: ['room', 'single', 'modern'],
          display_order: 1,
        },
        {
          branch_id: branches[0]!.id,
          image_url: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af',
          title: 'Common Area',
          description: 'Comfortable common area for residents',
          tags: ['common-area', 'lounge'],
          display_order: 2,
        },
        {
          branch_id: branches[1]!.id,
          image_url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457',
          title: 'Study Room',
          description: 'Quiet study room with high-speed WiFi',
          tags: ['study', 'quiet', 'wifi'],
          display_order: 1,
        },
      ])
      .returning();

    console.log(`✅ Inserted ${galleryImages.length} gallery images`);

    // Insert sample enquiries
    const enquiries = await db
      .insert(user_enquiries)
      .values([
        {
          name: 'Rahul Kumar',
          email: 'rahul.kumar@example.com',
          phone: '+91-9876543230',
          message: 'I am interested in single occupancy room at Downtown branch',
          branch_id: branches[0]!.id,
          source: 'website',
        },
        {
          name: 'Priya Sharma',
          email: 'priya.sharma@example.com',
          phone: '+91-9876543240',
          message: 'Can you provide more details about amenities?',
          branch_id: branches[1]!.id,
          source: 'cta',
        },
        {
          name: 'Amit Patel',
          email: 'amit.patel@example.com',
          phone: '+91-9876543250',
          message: 'General enquiry about availability',
          branch_id: null,
          source: 'website',
        },
      ])
      .returning();

    console.log(`✅ Inserted ${enquiries.length} enquiries`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`
Summary:
- Branches: ${branches.length}
- Gallery Images: ${galleryImages.length}
- Enquiries: ${enquiries.length}
    `);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

seed();
