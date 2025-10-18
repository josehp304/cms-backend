# Branch Thumbnail Field - Quick Reference

The `branch` table now includes a `thumbnail` field for storing the front cover image URL.

## Database Schema Update

```typescript
export const branch = pgTable('branch', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  contact_no: text('contact_no').array(),
  address: text('address'),
  gmap_link: text('gmap_link'),
  room_rate: jsonb('room_rate'),
  prime_location_perks: jsonb('prime_location_perks'),
  amenities: text('amenities').array(),
  property_features: text('property_features').array(),
  reg_fee: integer('reg_fee'),
  is_mess_available: boolean('is_mess_available').default(false),
  thumbnail: text('thumbnail'), // 👈 NEW: Front cover image URL
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
```

## Usage Examples

### 1. Create Branch with Thumbnail

```javascript
// First, upload the thumbnail image to Cloudinary
const formData = new FormData();
formData.append('file', thumbnailFile);
formData.append('branch_id', 1); // or use existing branch
formData.append('title', 'Branch Thumbnail');

const uploadResponse = await fetch('http://localhost:3000/api/gallery/upload', {
  method: 'POST',
  body: formData
});

const uploadResult = await uploadResponse.json();
const thumbnailUrl = uploadResult.data.image_url;

// Then, create branch with the thumbnail URL
const branchResponse = await fetch('http://localhost:3000/api/branches', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Nyxta Central',
    address: '123 Main St',
    thumbnail: thumbnailUrl, // 👈 Add thumbnail URL
    contact_no: ['+91-9876543210'],
    reg_fee: 2000,
    is_mess_available: true
  })
});
```

### 2. Update Branch Thumbnail

```javascript
// Upload new thumbnail
const uploadResponse = await fetch('http://localhost:3000/api/gallery/upload', {
  method: 'POST',
  body: formData
});

const newThumbnailUrl = uploadResponse.data.image_url;

// Update branch
const updateResponse = await fetch('http://localhost:3000/api/branches/1', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    thumbnail: newThumbnailUrl
  })
});
```

### 3. Fetch Branch with Thumbnail

```javascript
const response = await fetch('http://localhost:3000/api/branches/1');
const result = await response.json();

console.log(result.data.thumbnail); 
// Output: "https://res.cloudinary.com/your-cloud/image/upload/v1234/gallery/branch_thumbnail.jpg"
```

## React Component Example

```jsx
import React, { useState } from 'react';

function BranchThumbnailUploader({ branchId, currentThumbnail }) {
  const [thumbnail, setThumbnail] = useState(currentThumbnail);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    try {
      // Step 1: Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('branch_id', branchId);
      formData.append('title', 'Branch Thumbnail');

      const uploadRes = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadData.success) {
        throw new Error('Upload failed');
      }

      const thumbnailUrl = uploadData.data.image_url;

      // Step 2: Update branch with new thumbnail
      const updateRes = await fetch(`/api/branches/${branchId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thumbnail: thumbnailUrl }),
      });

      const updateData = await updateRes.json();

      if (updateData.success) {
        setThumbnail(thumbnailUrl);
        alert('Thumbnail updated successfully!');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h3>Branch Thumbnail</h3>
      
      {thumbnail && (
        <div>
          <img 
            src={thumbnail} 
            alt="Branch Thumbnail" 
            style={{ maxWidth: '400px', borderRadius: '8px' }}
          />
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
      
      {uploading && <p>Uploading...</p>}
    </div>
  );
}

export default BranchThumbnailUploader;
```

## cURL Examples

### Create Branch with Thumbnail

```bash
# First upload thumbnail
curl -X POST http://localhost:3000/api/gallery/upload \
  -F "file=@/path/to/thumbnail.jpg" \
  -F "branch_id=1" \
  -F "title=Branch Thumbnail"

# Response will include: "image_url": "https://res.cloudinary.com/..."

# Then create branch with thumbnail
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nyxta Central",
    "address": "123 Main St",
    "thumbnail": "https://res.cloudinary.com/your-cloud/image/upload/v1234/gallery/thumbnail.jpg",
    "contact_no": ["+91-9876543210"],
    "reg_fee": 2000
  }'
```

### Update Branch Thumbnail

```bash
curl -X PUT http://localhost:3000/api/branches/1 \
  -H "Content-Type: application/json" \
  -d '{
    "thumbnail": "https://res.cloudinary.com/your-cloud/image/upload/v1234/gallery/new_thumbnail.jpg"
  }'
```

### Get Branch with Thumbnail

```bash
curl http://localhost:3000/api/branches/1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nyxta Central",
    "address": "123 Main St",
    "thumbnail": "https://res.cloudinary.com/your-cloud/image/upload/v1234/gallery/thumbnail.jpg",
    "contact_no": ["+91-9876543210"],
    "reg_fee": 2000,
    "is_mess_available": true,
    "created_at": "2025-10-18T10:00:00.000Z",
    "updated_at": "2025-10-18T10:00:00.000Z"
  }
}
```

## Best Practices

1. **Image Size**: Optimize thumbnails before upload (recommended: 800x600px or similar)
2. **Format**: Use JPEG/WebP for photos, PNG for graphics with transparency
3. **Cloudinary Transformations**: Apply transformations to the URL for different sizes:
   ```javascript
   const originalUrl = branch.thumbnail;
   const smallThumb = originalUrl.replace('/upload/', '/upload/w_200,h_150,c_fill/');
   const mediumThumb = originalUrl.replace('/upload/', '/upload/w_400,h_300,c_fill/');
   ```
4. **Fallback**: Always provide a default placeholder if thumbnail is null
5. **Delete Old**: When updating thumbnail, consider deleting the old image from Cloudinary using the `delete-from-host` endpoint

## Migration Applied

The database has been updated with the following migration:

```sql
ALTER TABLE "branch" ADD COLUMN "thumbnail" text;
```

All existing branches will have `thumbnail` set to `null` by default.
