# Nyxta Backend API Test Examples

## Base URL
```
http://localhost:3000
```

## Health Check

### Check API Status
```bash
curl http://localhost:3000/
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Nyxta Backend API is running",
  "timestamp": "2025-10-14T..."
}
```

---

## Branch API

### Get All Branches
```bash
curl http://localhost:3000/api/branches
```

### Get Single Branch
```bash
curl http://localhost:3000/api/branches/1
```

### Create New Branch
```bash
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nyxta Koramangala Branch",
    "contact_no": ["+91-9876543299"],
    "address": "789 Koramangala, Bangalore, Karnataka 560095",
    "gmap_link": "https://maps.google.com/?q=12.9352,77.6245",
    "room_rate": [
      {"title": "Single Occupancy", "rate_per_month": 10000},
      {"title": "Double Occupancy", "rate_per_month": 7500}
    ],
    "prime_location_perks": [
      {"title": "Restaurants", "distance": "200m", "time_to_reach": "2 mins"},
      {"title": "Metro", "distance": "1.5km", "time_to_reach": "12 mins"}
    ],
    "amenities": ["WiFi", "AC", "Gym", "Laundry", "Security"],
    "property_features": ["Attached Bath", "Study Table", "Wardrobe"],
    "reg_fee": 3000,
    "is_mess_available": true
  }'
```

### Update Branch
```bash
curl -X PUT http://localhost:3000/api/branches/1 \
  -H "Content-Type: application/json" \
  -d '{
    "reg_fee": 2500,
    "is_mess_available": false
  }'
```

### Delete Branch
```bash
curl -X DELETE http://localhost:3000/api/branches/1
```

---

## Gallery API

### Get All Gallery Images
```bash
curl http://localhost:3000/api/gallery
```

### Get Gallery Images for Specific Branch
```bash
curl "http://localhost:3000/api/gallery?branch_id=1"
```

### Get Single Gallery Image
```bash
curl http://localhost:3000/api/gallery/1
```

### Create New Gallery Image
```bash
curl -X POST http://localhost:3000/api/gallery \
  -H "Content-Type: application/json" \
  -d '{
    "branch_id": 1,
    "image_url": "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1",
    "title": "Dining Area",
    "description": "Spacious dining area with modern furniture",
    "tags": ["dining", "common-area", "modern"],
    "display_order": 3
  }'
```

### Update Gallery Image
```bash
curl -X PUT http://localhost:3000/api/gallery/1 \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Updated Room View",
    "display_order": 5
  }'
```

### Delete Gallery Image
```bash
curl -X DELETE http://localhost:3000/api/gallery/1
```

---

## User Enquiries API

### Get All Enquiries
```bash
curl http://localhost:3000/api/enquiries
```

### Get Enquiries for Specific Branch
```bash
curl "http://localhost:3000/api/enquiries?branch_id=1"
```

### Get Single Enquiry
```bash
curl http://localhost:3000/api/enquiries/1
```

### Create New Enquiry
```bash
curl -X POST http://localhost:3000/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Anjali Reddy",
    "email": "anjali.reddy@example.com",
    "phone": "+91-9876543260",
    "message": "I would like to schedule a visit to see the rooms. Are weekends available for visits?",
    "branch_id": 1,
    "source": "website"
  }'
```

### Create General Enquiry (No Branch)
```bash
curl -X POST http://localhost:3000/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Vikram Singh",
    "email": "vikram.singh@example.com",
    "phone": "+91-9876543270",
    "message": "Do you have branches in Pune?",
    "source": "cta"
  }'
```

### Update Enquiry
```bash
curl -X PUT http://localhost:3000/api/enquiries/1 \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Updated enquiry message"
  }'
```

### Delete Enquiry
```bash
curl -X DELETE http://localhost:3000/api/enquiries/1
```

---

## Testing with HTTPie (Alternative)

If you have HTTPie installed, you can use these simpler commands:

### GET Request
```bash
http GET localhost:3000/api/branches
```

### POST Request
```bash
http POST localhost:3000/api/enquiries \
  name="Test User" \
  email="test@example.com" \
  phone="+91-9999999999" \
  message="Test message" \
  source="website"
```

### PUT Request
```bash
http PUT localhost:3000/api/branches/1 \
  reg_fee:=2500 \
  is_mess_available:=false
```

### DELETE Request
```bash
http DELETE localhost:3000/api/branches/1
```

---

## Expected Success Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

## Expected Error Response Format
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```

---

## HTTP Status Codes

- `200 OK` - Successful GET, PUT, DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
