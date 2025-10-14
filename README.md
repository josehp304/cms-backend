# Nyxta Backend

A complete Node.js backend built with **Express**, **TypeScript**, **Drizzle ORM**, and **Neon Postgres**.

## Features

- 🔥 **Express** server with TypeScript
- 🗄️ **Drizzle ORM** with Neon Postgres database
- 🔐 Full **CRUD** operations for all entities
- ✅ Proper error handling and validation
- 📝 TypeScript strict mode
- 🌐 CORS enabled
- 📦 Clean project structure

## Database Entities

### 1. Branch
- Branch information with location details
- Room rates and registration fees
- Amenities and property features
- Prime location perks

### 2. Gallery
- Branch-specific image gallery
- Image metadata with tags
- Display ordering
- Cascading delete on branch removal

### 3. User Enquiries
- Contact form submissions
- Branch-specific or general enquiries
- Source tracking (website, CTA, etc.)

## Project Structure

```
nyxta_backend/
├── src/
│   ├── db/
│   │   ├── schema.ts        # Drizzle schema definitions
│   │   └── index.ts         # Database connection
│   ├── routes/
│   │   ├── branch.ts        # Branch CRUD endpoints
│   │   ├── gallery.ts       # Gallery CRUD endpoints
│   │   └── user_enquiries.ts # User enquiries CRUD endpoints
│   ├── server.ts            # Express server setup
│   └── seed.ts              # Sample data seeder
├── drizzle.config.ts        # Drizzle configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
└── .env                     # Environment variables
```

## Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL=your_neon_postgres_connection_string
PORT=3000
NODE_ENV=development
```

## Installation

```bash
# Install dependencies
npm install
```

## Database Setup

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Run Drizzle Studio to view database
npm run db:studio
```

## Seed Database

```bash
# Run seed script to populate sample data
npm run dev -- src/seed.ts
```

Or use ts-node directly:

```bash
npx ts-node src/seed.ts
```

## Development

```bash
# Start development server with hot reload
npm run dev
```

## Production

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

## API Endpoints

### Health Check
- `GET /` - API health check

### Branch Endpoints
- `POST /api/branches` - Create new branch
- `GET /api/branches` - Get all branches
- `GET /api/branches/:id` - Get single branch
- `PUT /api/branches/:id` - Update branch
- `DELETE /api/branches/:id` - Delete branch

### Gallery Endpoints
- `POST /api/gallery` - Create new gallery image
- `GET /api/gallery` - Get all gallery images (query: `?branch_id=1`)
- `GET /api/gallery/:id` - Get single gallery image
- `PUT /api/gallery/:id` - Update gallery image
- `DELETE /api/gallery/:id` - Delete gallery image

### User Enquiries Endpoints
- `POST /api/enquiries` - Create new enquiry
- `GET /api/enquiries` - Get all enquiries (query: `?branch_id=1`)
- `GET /api/enquiries/:id` - Get single enquiry
- `PUT /api/enquiries/:id` - Update enquiry
- `DELETE /api/enquiries/:id` - Delete enquiry

## API Response Format

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information (dev mode only)"
}
```

## Example Requests

### Create Branch
```bash
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nyxta Central",
    "contact_no": ["+91-9876543210"],
    "address": "123 Main St, Bangalore",
    "room_rate": [
      {"title": "Single", "rate_per_month": 8000}
    ],
    "reg_fee": 2000,
    "is_mess_available": true
  }'
```

### Create Gallery Image
```bash
curl -X POST http://localhost:3000/api/gallery \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": 1,
    "image_url": "https://example.com/image.jpg",
    "title": "Room View",
    "tags": ["room", "interior"],
    "display_order": 1
  }'
```

### Create Enquiry
```bash
curl -X POST http://localhost:3000/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+91-9876543210",
    "message": "Interested in single room",
    "branch_id": 1,
    "source": "website"
  }'
```

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Drizzle ORM** - TypeScript ORM
- **Neon Postgres** - Serverless Postgres database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

## TypeScript Configuration

The project uses strict TypeScript configuration with:
- Strict mode enabled
- ES2020 target
- CommonJS modules
- Source maps for debugging
- Type declarations included

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate migration files
- `npm run db:push` - Push schema to database
- `npm run db:studio` - Open Drizzle Studio

## License

ISC

