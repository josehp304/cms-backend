# Frontend Integration: Branch Thumbnail Feature

## Task: Add Thumbnail Support to Branch CRUD Operations

### Overview
The backend now supports a `thumbnail` field in the branch table for storing cover images (Cloudinary URLs). Update the CMS frontend to include thumbnail upload/display functionality in all branch CRUD operations.

---

## Backend Changes (Already Completed ✅)

1. **Database Schema**: Added `thumbnail` TEXT field to `branch` table
2. **API Endpoints**: All branch endpoints now accept/return `thumbnail` field
3. **Image Upload**: Cloudinary integration available at `POST /api/gallery/upload`
4. **Demo Data**: All existing branches have demo thumbnails populated

---

## Frontend Requirements

### 1. Branch List/Table View
**Location**: Branch listing/table page

**Changes Needed:**
- Add thumbnail column to branch table
- Display thumbnail as small preview (150x100px or similar)
- Add fallback placeholder if thumbnail is null
- Make thumbnail clickable to view full size

**Example UI:**
```
| Thumbnail   | Branch Name           | Address        | Actions |
|-------------|-----------------------|----------------|---------|
| [🖼️ Image] | Nyxta Downtown Branch | 123 Main St    | Edit    |
| [🖼️ Image] | Nyxta Tech Park       | 456 Tech Rd    | Edit    |
```

---

### 2. Create Branch Form
**Location**: New branch creation page/modal

**Changes Needed:**
- Add file upload input for thumbnail (accept images only)
- Show image preview after selection
- Upload thumbnail to Cloudinary BEFORE creating branch
- Include thumbnail URL in branch creation API call
- Show upload progress indicator
- Validate file size (max 5MB recommended)

**API Flow:**
```javascript
// Step 1: Upload thumbnail to Cloudinary
const formData = new FormData();
formData.append('file', thumbnailFile);
formData.append('branch_id', 1); // Use existing or dummy ID
formData.append('title', 'Branch Thumbnail');

const uploadRes = await fetch('/api/gallery/upload', {
  method: 'POST',
  body: formData
});
const { data } = await uploadRes.json();
const thumbnailUrl = data.image_url;

// Step 2: Create branch with thumbnail URL
const branchRes = await fetch('/api/branches', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Branch Name',
    thumbnail: thumbnailUrl, // 👈 Include this
    address: '123 Main St',
    // ... other fields
  })
});
```

---

### 3. Edit Branch Form
**Location**: Branch edit page/modal

**Changes Needed:**
- Display current thumbnail (if exists)
- Allow uploading new thumbnail to replace existing
- Show "Remove Thumbnail" option
- Preview new image before saving
- Update thumbnail URL in branch update API call
- Handle both: keeping existing thumbnail OR uploading new one

**UI Layout:**
```
Current Thumbnail:
[🖼️ Existing Image]
[Remove] [Change]

Or upload new:
[File Upload Input]
[Preview of new selection]
```

---

### 4. Branch Detail/View Page
**Location**: Individual branch details page

**Changes Needed:**
- Display full-size thumbnail at top of page (hero image)
- Add lightbox/modal to view full resolution
- Show placeholder if no thumbnail
- Optimize image display (use Cloudinary transformations if needed)

---

## API Reference

### Upload Image to Cloudinary
```javascript
POST /api/gallery/upload
Content-Type: multipart/form-data

FormData:
- file: [File] (required)
- branch_id: number (required)
- title: string (optional)

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "image_url": "https://res.cloudinary.com/dgxkgtq5c/image/upload/v1234/gallery/image.jpg",
    // ... other fields
  },
  "cloudinary": {
    "public_id": "gallery/branch_thumbnail",
    "secure_url": "https://res.cloudinary.com/...",
    "format": "jpg"
  }
}
```

### Create Branch with Thumbnail
```javascript
POST /api/branches
Content-Type: application/json

Body:
{
  "name": "Branch Name",
  "thumbnail": "https://res.cloudinary.com/dgxkgtq5c/image/upload/...",
  "address": "123 Main St",
  // ... other fields
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Branch Name",
    "thumbnail": "https://res.cloudinary.com/...",
    // ... other fields
  }
}
```

### Update Branch Thumbnail
```javascript
PUT /api/branches/:id
Content-Type: application/json

Body:
{
  "thumbnail": "https://res.cloudinary.com/dgxkgtq5c/image/upload/new-image.jpg"
  // Can include other fields or just thumbnail
}
```

### Get Branch (includes thumbnail)
```javascript
GET /api/branches/:id

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nyxta Downtown Branch",
    "thumbnail": "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&h=800&fit=crop",
    // ... other fields
  }
}
```

---

## React Component Example

### Thumbnail Upload Component
```jsx
import { useState } from 'react';

function ThumbnailUpload({ value, onChange, branchId }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(value);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('branch_id', branchId || 1);
      formData.append('title', 'Branch Thumbnail');

      const response = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      if (result.success) {
        const thumbnailUrl = result.data.image_url;
        onChange(thumbnailUrl); // Pass URL to parent form
        alert('Thumbnail uploaded successfully!');
      }
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label>Branch Thumbnail</label>
      
      {preview && (
        <div>
          <img 
            src={preview} 
            alt="Thumbnail" 
            style={{ maxWidth: '400px', borderRadius: '8px' }}
          />
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={uploading}
      />

      {file && !uploading && (
        <button onClick={handleUpload}>
          Upload to Cloudinary
        </button>
      )}

      {uploading && <p>Uploading...</p>}
    </div>
  );
}
```

---

## Current Demo Data

All branches now have demo thumbnails populated:

| ID | Branch Name              | Thumbnail URL |
|----|--------------------------|---------------|
| 1  | Nyxta Downtown Branch    | https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1200&h=800 |
| 2  | Nyxta Tech Park Branch   | https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&h=800 |
| 3  | test branch              | https://images.unsplash.com/photo-1502672260066-6bc35f0dfe4a?w=1200&h=800 |

You can test the GET endpoints to see thumbnail data immediately.

---

## Image Optimization Tips

### Using Cloudinary Transformations
```javascript
// Original URL
const original = branch.thumbnail;

// Different sizes for different views
const thumbnail = original.replace('/upload/', '/upload/w_150,h_100,c_fill/');
const medium = original.replace('/upload/', '/upload/w_400,h_300,c_fill/');
const hero = original.replace('/upload/', '/upload/w_1200,h_600,c_fill/');

// Optimized (auto format, auto quality)
const optimized = original.replace('/upload/', '/upload/q_auto,f_auto/');
```

---

## Validation Rules

1. **File Type**: Accept only images (jpg, png, webp, gif)
2. **File Size**: Max 5MB recommended
3. **Dimensions**: Recommend 1200x800px or 16:9 aspect ratio
4. **Required**: Thumbnail is optional (can be null)

---

## Error Handling

```javascript
async function uploadThumbnail(file) {
  // Validate file
  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Image too large (max 5MB)');
  }

  // Upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('branch_id', 1);

  const response = await fetch('/api/gallery/upload', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Upload failed');
  }

  const result = await response.json();
  return result.data.image_url;
}
```

---

## Testing Checklist

- [ ] Can upload thumbnail when creating new branch
- [ ] Thumbnail displays in branch list/table
- [ ] Can update/replace thumbnail in edit form
- [ ] Can remove thumbnail (set to null)
- [ ] Thumbnail displays on branch detail page
- [ ] Proper error handling for failed uploads
- [ ] Loading states during upload
- [ ] Image preview before upload
- [ ] Works with existing branches (backward compatible)
- [ ] Responsive image display on mobile

---

## Questions?

**Backend Documentation:**
- Full API docs: `CLOUDINARY_API_DOCS.md`
- Branch examples: `BRANCH_THUMBNAIL_EXAMPLES.md`
- Quick reference: `BRANCH_THUMBNAIL.md`

**API Base URL:** `http://localhost:3000` (development)

**Test with:**
```bash
# Get all branches (includes thumbnails)
curl http://localhost:3000/api/branches

# Get single branch
curl http://localhost:3000/api/branches/1
```

---

## Priority

**High Priority:** Implement in this order:
1. Display existing thumbnails in list view (read-only first)
2. Add upload to create form
3. Add upload to edit form
4. Add remove/replace functionality
5. Polish UI/UX and error handling
