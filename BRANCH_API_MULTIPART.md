# Branch API with Thumbnail Upload

## Overview
The branch endpoints have been updated to accept thumbnail images as **multipart/form-data** file uploads. The image is automatically uploaded to Cloudinary and the URL is stored in the database.

---

## API Endpoints

### 1. CREATE Branch with Thumbnail
**Endpoint:** `POST /api/branch`  
**Content-Type:** `multipart/form-data`

#### Request Body (Form Data)
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `thumbnail` | File | No | Image file for branch thumbnail (JPEG, PNG, etc.) |
| `name` | String | Yes | Branch name |
| `contact_no` | String (JSON array) | Yes | Contact numbers as JSON string: `["1234567890", "0987654321"]` |
| `address` | String | Yes | Branch address |
| `gmap_link` | String | No | Google Maps link |
| `room_rate` | String (JSON object) | No | Room rates as JSON string: `{"single": 5000, "double": 7000}` |
| `prime_location_perks` | String (JSON object) | No | Location perks as JSON string |
| `amenities` | String (JSON array) | No | Amenities as JSON string: `["WiFi", "AC", "TV"]` |
| `property_features` | String (JSON array) | No | Property features as JSON string |
| `reg_fee` | String (number) | No | Registration fee as string: `"1000"` |
| `is_mess_available` | String (boolean) | No | Mess availability: `"true"` or `"false"` |

#### Success Response (201)
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "Nyxta New Branch",
    "contact_no": ["9876543210"],
    "address": "123 Main St",
    "gmap_link": "https://goo.gl/maps/...",
    "room_rate": {"single": 6000, "double": 8000},
    "prime_location_perks": {"metro": "500m", "mall": "1km"},
    "amenities": ["WiFi", "AC", "Parking"],
    "property_features": ["Security", "Lift"],
    "reg_fee": 1500,
    "is_mess_available": true,
    "thumbnail": "https://res.cloudinary.com/dgxkgtq5c/image/upload/v1234567890/branch-thumbnails/abc123.jpg",
    "created_at": "2025-10-18T10:30:00.000Z",
    "updated_at": "2025-10-18T10:30:00.000Z"
  },
  "message": "Branch created successfully"
}
```

#### Error Response (500)
```json
{
  "success": false,
  "error": "Failed to upload thumbnail",
  "details": "Cloudinary error message"
}
```

---

### 2. UPDATE Branch with Thumbnail
**Endpoint:** `PUT /api/branch/:id`  
**Content-Type:** `multipart/form-data`

#### Request Body (Form Data)
Same as CREATE endpoint. All fields are **optional** - only provide fields you want to update.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `thumbnail` | File | No | New image file to replace existing thumbnail |
| `name` | String | No | Updated branch name |
| `contact_no` | String (JSON array) | No | Updated contact numbers |
| ...other fields... | | | |

#### Success Response (200)
```json
{
  "success": true,
  "data": {
    "id": 4,
    "name": "Nyxta Updated Branch",
    "thumbnail": "https://res.cloudinary.com/dgxkgtq5c/image/upload/v1234567899/branch-thumbnails/xyz456.jpg",
    ...
  },
  "message": "Branch updated successfully"
}
```

---

## Frontend Integration Examples

### Example 1: Create Branch with Thumbnail (JavaScript/Fetch)

```javascript
async function createBranchWithThumbnail(branchData, thumbnailFile) {
  const formData = new FormData();
  
  // Add thumbnail file
  if (thumbnailFile) {
    formData.append('thumbnail', thumbnailFile);
  }
  
  // Add other branch data (convert arrays/objects to JSON strings)
  formData.append('name', branchData.name);
  formData.append('contact_no', JSON.stringify(branchData.contact_no));
  formData.append('address', branchData.address);
  formData.append('gmap_link', branchData.gmap_link || '');
  formData.append('room_rate', JSON.stringify(branchData.room_rate));
  formData.append('prime_location_perks', JSON.stringify(branchData.prime_location_perks));
  formData.append('amenities', JSON.stringify(branchData.amenities));
  formData.append('property_features', JSON.stringify(branchData.property_features));
  formData.append('reg_fee', branchData.reg_fee?.toString() || '');
  formData.append('is_mess_available', branchData.is_mess_available ? 'true' : 'false');
  
  const response = await fetch('http://localhost:3000/api/branch', {
    method: 'POST',
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
  });
  
  return await response.json();
}

// Usage
const file = document.querySelector('#thumbnailInput').files[0];
const result = await createBranchWithThumbnail({
  name: 'New Branch',
  contact_no: ['9876543210'],
  address: '123 Street',
  amenities: ['WiFi', 'AC'],
  room_rate: { single: 5000, double: 7000 },
  is_mess_available: true,
  reg_fee: 1000
}, file);
```

### Example 2: Update Branch with New Thumbnail

```javascript
async function updateBranchThumbnail(branchId, thumbnailFile) {
  const formData = new FormData();
  formData.append('thumbnail', thumbnailFile);
  
  const response = await fetch(`http://localhost:3000/api/branch/${branchId}`, {
    method: 'PUT',
    body: formData,
  });
  
  return await response.json();
}

// Usage
const newThumbnail = document.querySelector('#newThumbnailInput').files[0];
const result = await updateBranchThumbnail(4, newThumbnail);
```

### Example 3: React Component with File Upload

```jsx
import { useState } from 'react';

function CreateBranchForm() {
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_no: [''],
    address: '',
    amenities: [],
    is_mess_available: false,
    reg_fee: 0,
  });

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const multipartData = new FormData();
    
    // Add thumbnail if selected
    if (thumbnailFile) {
      multipartData.append('thumbnail', thumbnailFile);
    }
    
    // Add all form fields
    multipartData.append('name', formData.name);
    multipartData.append('contact_no', JSON.stringify(formData.contact_no));
    multipartData.append('address', formData.address);
    multipartData.append('amenities', JSON.stringify(formData.amenities));
    multipartData.append('is_mess_available', formData.is_mess_available ? 'true' : 'false');
    multipartData.append('reg_fee', formData.reg_fee.toString());
    
    try {
      const response = await fetch('http://localhost:3000/api/branch', {
        method: 'POST',
        body: multipartData,
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Branch created successfully!');
        console.log('New branch:', result.data);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error creating branch:', error);
      alert('Failed to create branch');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Branch Thumbnail:</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
        />
        {thumbnailPreview && (
          <img
            src={thumbnailPreview}
            alt="Thumbnail preview"
            style={{ width: '200px', height: '150px', objectFit: 'cover' }}
          />
        )}
      </div>
      
      <div>
        <label>Branch Name:</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      {/* Add other form fields here */}
      
      <button type="submit">Create Branch</button>
    </form>
  );
}

export default CreateBranchForm;
```

---

## Important Notes

### 1. Multipart Form Data Requirements
- **Content-Type:** Browser automatically sets `multipart/form-data` with boundary
- **Don't manually set Content-Type** when using FormData
- All non-file fields must be added as strings
- Arrays/objects must be JSON stringified

### 2. Field Type Conversions
| Database Type | Form Data Format | Example |
|---------------|------------------|---------|
| `text[]` (array) | JSON string | `JSON.stringify(["WiFi", "AC"])` |
| `jsonb` (object) | JSON string | `JSON.stringify({single: 5000})` |
| `integer` | String number | `"1000"` |
| `boolean` | String "true"/"false" | `"true"` |
| `text` | Plain string | `"Branch Name"` |

### 3. Cloudinary Upload
- Images are uploaded to `branch-thumbnails` folder
- Secure HTTPS URLs are returned
- Original filename is not preserved
- Cloudinary public_id is auto-generated

### 4. Error Handling
- Thumbnail upload errors return 500 status
- Branch validation errors return 400 status
- Database errors return 500 status
- Always check `response.success` field

---

## Testing with Postman/Thunder Client

### 1. Create Branch Request
```
POST http://localhost:3000/api/branch
Body Type: form-data

Fields:
thumbnail: [Select File] -> Choose image file
name: Nyxta Test Branch
contact_no: ["9876543210"]
address: 123 Test Street
amenities: ["WiFi", "AC", "Parking"]
room_rate: {"single": 5000, "double": 7000}
is_mess_available: true
reg_fee: 1000
```

### 2. Update Branch Thumbnail
```
PUT http://localhost:3000/api/branch/4
Body Type: form-data

Fields:
thumbnail: [Select File] -> Choose new image
```

---

## Migration from Old API

### Old Way (JSON with URL string)
```javascript
// ❌ Old approach - send URL string
const response = await fetch('/api/branch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Branch',
    thumbnail: 'https://example.com/image.jpg', // URL string
    ...
  })
});
```

### New Way (Multipart with File)
```javascript
// ✅ New approach - send file directly
const formData = new FormData();
formData.append('thumbnail', fileObject); // Actual file
formData.append('name', 'Branch');
// ... other fields as JSON strings

const response = await fetch('/api/branch', {
  method: 'POST',
  body: formData, // No Content-Type header needed
});
```

---

## Backend Implementation Details

### Cloudinary Configuration
- Folder: `branch-thumbnails`
- Upload method: `upload_stream` with buffer
- Returns: `secure_url` (HTTPS) and `public_id`

### Multer Configuration
- Storage: In-memory (`memoryStorage`)
- Field name: `thumbnail` (single file)
- Buffer is streamed to Cloudinary

### Upload Flow
1. Multer captures file from multipart request → stores in memory as buffer
2. Helper function creates readable stream from buffer
3. Stream pipes to Cloudinary `upload_stream`
4. Cloudinary returns secure URL
5. URL is stored in database `thumbnail` field
6. Branch record is created/updated with thumbnail URL

---

## Environment Variables Required
```env
CLOUDINARY_NAME=dgxkgtq5c
CLOUDINARY_CLOUD_KEY=332354852939165
CLOUDINARY_CLOUD_SECRET=cvR2Im7vzpyHqtjPKOiYZoLMEpU
```

---

## Summary
- **POST /api/branch**: Create branch with thumbnail file upload
- **PUT /api/branch/:id**: Update branch with new thumbnail file upload
- **Content-Type**: `multipart/form-data` (automatic with FormData)
- **Thumbnail**: Uploaded to Cloudinary, URL stored in database
- **Arrays/Objects**: Must be JSON stringified in form data
- **File Field**: `thumbnail` (optional, accepts image files)
