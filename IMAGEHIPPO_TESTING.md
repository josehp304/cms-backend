# ImageHippo Integration Testing Guide

This guide provides test examples for the ImageHippo image upload and delete endpoints.

## Configuration

Ensure your `.env` file has these variables:

```env
IMAGEHIPPO_API_KEY=your_api_key_here
IMAGEHIPPO_UPLOAD_URL=https://api.imghippo.com/v1/upload
IMAGEHIPPO_DELETE_URL=https://api.imghippo.com/v1/delete
```

## Upload Endpoint

**Endpoint:** `POST /api/gallery/upload`

**Description:** Uploads an image file to ImageHippo, receives the hosted URL, and stores it in the database with branch association.

### Required Fields
- `file` (binary) - Image file (up to 50 MB)
- `branch_id` (number) OR `branch_name` (string) - Branch association

### Optional Fields
- `title` (string) - Image title
- `description` (string) - Image description
- `tags` (array or comma-separated string) - Image tags
- `display_order` (number) - Display order

### Test Examples

#### Using branch_id (PowerShell)

```powershell
curl -X POST http://localhost:3000/api/gallery/upload `
  -F "file=@C:/path/to/image.jpg" `
  -F "branch_id=1" `
  -F "title=Lobby View" `
  -F "tags=lobby,interior"
```

#### Using branch_name (PowerShell)

```powershell
curl -X POST http://localhost:3000/api/gallery/upload `
  -F "file=@C:/path/to/image.jpg" `
  -F "branch_name=Nyxta Central" `
  -F "title=Room Interior" `
  -F "description=Spacious single room" `
  -F "tags=room,interior,single"
```

#### Using bash/Linux

```bash
curl -X POST http://localhost:3000/api/gallery/upload \
  -F "file=@/path/to/image.jpg" \
  -F "branch_id=1" \
  -F "title=Lobby View" \
  -F "tags=lobby,interior"
```

### Expected Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "branch_id": 1,
    "image_url": "https://i.imghippo.com/files/00a001111.jpg",
    "title": "Lobby View",
    "description": null,
    "tags": ["lobby", "interior"],
    "display_order": 0,
    "created_at": "2025-10-17T15:45:23.000Z"
  },
  "message": "Image uploaded and saved to gallery"
}
```

## Delete Endpoint

**Endpoint:** `DELETE /api/gallery/delete-from-host`

**Description:** Deletes an image from ImageHippo hosting service (does NOT remove from database).

### Required Fields
- `image_url` (string) - The ImageHippo URL to delete

### Test Examples

#### PowerShell

```powershell
curl -X DELETE http://localhost:3000/api/gallery/delete-from-host `
  -H "Content-Type: application/json" `
  -d '{\"image_url\": \"https://i.imghippo.com/files/00a001111.jpg\"}'
```

#### bash/Linux

```bash
curl -X DELETE http://localhost:3000/api/gallery/delete-from-host \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://i.imghippo.com/files/00a001111.jpg"
  }'
```

### Expected Response

```json
{
  "success": true,
  "message": "Image deleted from ImageHippo successfully",
  "deleted_url": "https://i.imghippo.com/files/00a001111.jpg"
}
```

## Complete Workflow Example

Here's a complete workflow to test both endpoints:

### 1. First, create a branch (if needed)

```bash
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Branch",
    "address": "123 Test Street"
  }'
```

### 2. Upload an image

```powershell
curl -X POST http://localhost:3000/api/gallery/upload `
  -F "file=@C:/Users/YourName/Pictures/test.jpg" `
  -F "branch_id=1" `
  -F "title=Test Image"
```

**Save the returned `image_url` from the response!**

### 3. Verify image in database

```bash
curl http://localhost:3000/api/gallery?branch_id=1
```

### 4. Delete image from ImageHippo (optional)

```bash
curl -X DELETE http://localhost:3000/api/gallery/delete-from-host \
  -H "Content-Type: application/json" \
  -d '{
    "image_url": "https://i.imghippo.com/files/YOUR_FILE_ID.jpg"
  }'
```

### 5. Delete image from database (optional)

```bash
curl -X DELETE http://localhost:3000/api/gallery/1
```

## Error Handling

### Common Errors

#### Missing file
```json
{
  "success": false,
  "error": "No file uploaded (field name: file)"
}
```

#### Missing branch info
```json
{
  "success": false,
  "error": "branch_id or branch_name is required and must exist"
}
```

#### ImageHippo API error
```json
{
  "success": false,
  "error": "Failed to get image URL from ImageHippo"
}
```

#### Missing API key
```json
{
  "success": false,
  "error": "IMAGEHIPPO_API_KEY is missing on server"
}
```

## Notes

- Maximum file size: 50 MB (ImageHippo limit)
- Supported formats: Common image formats (jpg, png, gif, webp, etc.)
- The upload endpoint stores the `view_url` from ImageHippo's response (direct image URL)
- The delete endpoint only removes from ImageHippo hosting, not from your database
- To fully remove an image: first delete from ImageHippo, then delete the database record

## Frontend Integration

For frontend developers, here's a simple JavaScript example:

```javascript
async function uploadImage(file, branchId, title, tags) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('branch_id', branchId);
  formData.append('title', title);
  formData.append('tags', tags.join(','));

  const response = await fetch('http://localhost:3000/api/gallery/upload', {
    method: 'POST',
    body: formData
  });

  return await response.json();
}

// Usage
const fileInput = document.querySelector('input[type="file"]');
const result = await uploadImage(
  fileInput.files[0],
  1,
  'My Image',
  ['room', 'interior']
);
console.log('Uploaded:', result.data.image_url);
```
