# Cloudinary Image Upload API Documentation

Complete guide for frontend developers to integrate with the Cloudinary-powered image upload endpoints.

## Configuration

Ensure your backend `.env` file has:

```env
CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_CLOUD_KEY=your_api_key
CLOUDINARY_CLOUD_SECRET=your_api_secret
```

---

## 1. Upload Image to Cloudinary

**Endpoint:** `POST /api/gallery/upload`

**Content-Type:** `multipart/form-data`

### Request Parameters

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | ✅ Yes | Image file (binary) |
| `branch_id` | number | Yes* | Branch ID |
| `branch_name` | string | Yes* | Branch name (alternative to branch_id) |
| `title` | string | ❌ No | Image title |
| `description` | string | ❌ No | Image description |
| `tags` | string/array | ❌ No | Comma-separated tags or array |
| `display_order` | number | ❌ No | Display order (default: 0) |

*Either `branch_id` OR `branch_name` is required

### JavaScript Example

```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('branch_id', 1);
formData.append('title', 'Lobby View');
formData.append('description', 'Main lobby area');
formData.append('tags', 'lobby,interior');
formData.append('display_order', 0);

const response = await fetch('http://localhost:3000/api/gallery/upload', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log(result);
```

### Success Response (201)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "branch_id": 1,
    "image_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/gallery/image.jpg",
    "title": "Lobby View",
    "description": "Main lobby area",
    "tags": ["lobby", "interior"],
    "display_order": 0,
    "created_at": "2025-10-18T10:30:00.000Z"
  },
  "cloudinary": {
    "public_id": "gallery/lobby_view",
    "secure_url": "https://res.cloudinary.com/your-cloud/image/upload/v1234567890/gallery/image.jpg",
    "format": "jpg"
  },
  "message": "Image uploaded to Cloudinary and saved to gallery"
}
```

### Error Responses

#### 400 - No File
```json
{
  "success": false,
  "error": "No file uploaded (field name: file)"
}
```

#### 400 - Missing Branch Info
```json
{
  "success": false,
  "error": "branch_id or branch_name is required and must exist"
}
```

#### 500 - Upload Failed
```json
{
  "success": false,
  "error": "Failed to upload image to Cloudinary",
  "details": "Error message"
}
```

---

## 2. Delete Image from Cloudinary

**Endpoint:** `DELETE /api/gallery/delete-from-host`

**Content-Type:** `application/json`

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `public_id` | string | ✅ Yes | Cloudinary public_id (e.g., "gallery/lobby_view") |

### JavaScript Example

```javascript
const response = await fetch('http://localhost:3000/api/gallery/delete-from-host', {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    public_id: 'gallery/lobby_view'
  })
});

const result = await response.json();
console.log(result);
```

### Success Response (200)

```json
{
  "success": true,
  "message": "Image deleted from Cloudinary successfully",
  "data": {
    "result": "ok"
  }
}
```

### Error Responses

#### 400 - Missing public_id
```json
{
  "success": false,
  "error": "public_id is required"
}
```

#### 500 - Delete Failed
```json
{
  "success": false,
  "error": "Failed to delete image from Cloudinary",
  "details": "Error message"
}
```

---

## Complete React Component Example

```jsx
import React, { useState } from 'react';

function ImageUploader({ branchId }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('branch_id', branchId);
    formData.append('title', file.name.split('.')[0]);

    try {
      const response = await fetch('http://localhost:3000/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadedImage(result);
        alert('Upload successful!');
      } else {
        alert('Upload failed: ' + result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!uploadedImage?.cloudinary?.public_id) return;

    try {
      const response = await fetch('http://localhost:3000/api/gallery/delete-from-host', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          public_id: uploadedImage.cloudinary.public_id,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setUploadedImage(null);
        alert('Delete successful!');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" disabled={!file || uploading}>
          {uploading ? 'Uploading...' : 'Upload to Cloudinary'}
        </button>
      </form>

      {uploadedImage && (
        <div>
          <h3>Uploaded Image</h3>
          <img 
            src={uploadedImage.data.image_url} 
            alt={uploadedImage.data.title} 
            style={{ maxWidth: '400px' }}
          />
          <p>Public ID: {uploadedImage.cloudinary.public_id}</p>
          <button onClick={handleDelete}>Delete from Cloudinary</button>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;
```

---

## Notes

- **Folder Structure**: Images are uploaded to the `gallery` folder in Cloudinary
- **Public ID**: Generated from the title (if provided), sanitized to remove special characters
- **URL Format**: Cloudinary returns a `secure_url` (HTTPS) which is stored in the database
- **File Types**: Supports all image formats (jpg, png, gif, webp, etc.)
- **Max File Size**: Depends on your Cloudinary plan (typically 10MB for free tier)
- **Transformations**: You can apply Cloudinary transformations to the returned URL for resizing, cropping, etc.

### Example Cloudinary Transformations

```javascript
// Original URL
const originalUrl = "https://res.cloudinary.com/your-cloud/image/upload/v1234/gallery/image.jpg";

// Resize to 400x300
const resized = originalUrl.replace('/upload/', '/upload/w_400,h_300,c_fill/');

// Make thumbnail (200x200, cropped)
const thumbnail = originalUrl.replace('/upload/', '/upload/w_200,h_200,c_thumb/');

// Optimize quality
const optimized = originalUrl.replace('/upload/', '/upload/q_auto,f_auto/');
```

---

## Testing with cURL

### Upload
```bash
curl -X POST http://localhost:3000/api/gallery/upload \
  -F "file=@/path/to/image.jpg" \
  -F "branch_id=1" \
  -F "title=Test Image"
```

### Delete
```bash
curl -X DELETE http://localhost:3000/api/gallery/delete-from-host \
  -H "Content-Type: application/json" \
  -d '{"public_id":"gallery/test_image"}'
```

---

## Error Handling Best Practices

```javascript
async function uploadImage(file, branchId) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('branch_id', branchId);

    const response = await fetch('/api/gallery/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Upload failed');
    }

    return result;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}
```

---

## Additional Endpoints

For complete CRUD operations on gallery images, see the main API documentation:

- `GET /api/gallery` - Get all gallery images
- `GET /api/gallery/:id` - Get single gallery image
- `PUT /api/gallery/:id` - Update gallery image
- `DELETE /api/gallery/:id` - Delete gallery image from database (does not delete from Cloudinary)
- `GET /api/gallery/branch/:branchId` - Get all images for a specific branch
