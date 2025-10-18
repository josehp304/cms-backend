# Branch API with Thumbnail - Examples

Complete examples for creating and updating branches with thumbnail images.

## Create Branch with Thumbnail

### Step-by-Step Flow

```javascript
// Step 1: Upload thumbnail to Cloudinary
async function uploadThumbnail(file) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('branch_id', 1); // Can use any existing branch ID or create after
  formData.append('title', 'Branch Thumbnail');

  const response = await fetch('http://localhost:3000/api/gallery/upload', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  return result.data.image_url; // Cloudinary URL
}

// Step 2: Create branch with thumbnail URL
async function createBranch(thumbnailUrl) {
  const response = await fetch('http://localhost:3000/api/branches', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Nyxta Downtown',
      address: '456 Downtown Street, Bangalore',
      contact_no: ['+91-9876543210', '+91-9876543211'],
      gmap_link: 'https://maps.google.com/?q=downtown',
      thumbnail: thumbnailUrl, // 👈 Cloudinary URL
      room_rate: [
        { title: 'Single', rate_per_month: 8000 },
        { title: 'Double', rate_per_month: 6000 }
      ],
      prime_location_perks: [
        { title: 'Metro Station', distance: '500m', time_to_reach: '5 mins' },
        { title: 'Tech Park', distance: '1km', time_to_reach: '10 mins' }
      ],
      amenities: ['WiFi', 'AC', 'Laundry', 'Gym'],
      property_features: ['Security', 'Parking', 'Power Backup'],
      reg_fee: 2000,
      is_mess_available: true
    })
  });

  return await response.json();
}

// Usage
async function createBranchWithThumbnail(file) {
  try {
    const thumbnailUrl = await uploadThumbnail(file);
    const branch = await createBranch(thumbnailUrl);
    console.log('Branch created:', branch);
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## Update Branch Thumbnail

```javascript
async function updateBranchThumbnail(branchId, newThumbnailFile) {
  try {
    // Step 1: Upload new thumbnail
    const formData = new FormData();
    formData.append('file', newThumbnailFile);
    formData.append('branch_id', branchId);
    formData.append('title', 'Updated Branch Thumbnail');

    const uploadResponse = await fetch('http://localhost:3000/api/gallery/upload', {
      method: 'POST',
      body: formData
    });

    const uploadResult = await uploadResponse.json();
    const newThumbnailUrl = uploadResult.data.image_url;

    // Step 2: Update branch with new thumbnail
    const updateResponse = await fetch(`http://localhost:3000/api/branches/${branchId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        thumbnail: newThumbnailUrl
      })
    });

    const result = await updateResponse.json();
    console.log('Branch updated:', result);
    return result;
  } catch (error) {
    console.error('Error updating thumbnail:', error);
    throw error;
  }
}
```

## cURL Examples

### Create Branch with Thumbnail

```bash
# 1. Upload thumbnail
curl -X POST http://localhost:3000/api/gallery/upload \
  -F "file=@/path/to/branch-cover.jpg" \
  -F "branch_id=1" \
  -F "title=Branch Thumbnail"

# Response: { "data": { "image_url": "https://res.cloudinary.com/..." } }

# 2. Create branch with thumbnail URL
curl -X POST http://localhost:3000/api/branches \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nyxta Downtown",
    "address": "456 Downtown Street, Bangalore",
    "contact_no": ["+91-9876543210"],
    "thumbnail": "https://res.cloudinary.com/dgxkgtq5c/image/upload/v1234/gallery/thumbnail.jpg",
    "room_rate": [
      {"title": "Single", "rate_per_month": 8000}
    ],
    "amenities": ["WiFi", "AC", "Laundry"],
    "reg_fee": 2000,
    "is_mess_available": true
  }'
```

### Update Branch Thumbnail Only

```bash
curl -X PUT http://localhost:3000/api/branches/1 \
  -H "Content-Type: application/json" \
  -d '{
    "thumbnail": "https://res.cloudinary.com/dgxkgtq5c/image/upload/v5678/gallery/new-thumbnail.jpg"
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
    "name": "Nyxta Downtown",
    "address": "456 Downtown Street, Bangalore",
    "contact_no": ["+91-9876543210"],
    "gmap_link": "https://maps.google.com/?q=downtown",
    "thumbnail": "https://res.cloudinary.com/dgxkgtq5c/image/upload/v1234/gallery/thumbnail.jpg",
    "room_rate": [
      {"title": "Single", "rate_per_month": 8000}
    ],
    "prime_location_perks": [],
    "amenities": ["WiFi", "AC", "Laundry"],
    "property_features": ["Security", "Parking"],
    "reg_fee": 2000,
    "is_mess_available": true,
    "created_at": "2025-10-18T10:00:00.000Z",
    "updated_at": "2025-10-18T10:00:00.000Z"
  }
}
```

## React Component - Complete Example

```jsx
import React, { useState, useEffect } from 'react';

function BranchForm({ branchId = null, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contact_no: [''],
    thumbnail: '',
    reg_fee: 0,
    is_mess_available: false,
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  // Load existing branch if editing
  useEffect(() => {
    if (branchId) {
      fetchBranch();
    }
  }, [branchId]);

  const fetchBranch = async () => {
    const response = await fetch(`/api/branches/${branchId}`);
    const result = await response.json();
    if (result.success) {
      setFormData(result.data);
      setThumbnailPreview(result.data.thumbnail);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const uploadThumbnail = async () => {
    if (!thumbnailFile) return formData.thumbnail;

    const uploadFormData = new FormData();
    uploadFormData.append('file', thumbnailFile);
    uploadFormData.append('branch_id', branchId || 1);
    uploadFormData.append('title', `${formData.name} Thumbnail`);

    const response = await fetch('/api/gallery/upload', {
      method: 'POST',
      body: uploadFormData,
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error('Thumbnail upload failed');
    }

    return result.data.image_url;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Upload thumbnail if new file selected
      let thumbnailUrl = formData.thumbnail;
      if (thumbnailFile) {
        thumbnailUrl = await uploadThumbnail();
      }

      // Prepare branch data
      const branchData = {
        ...formData,
        thumbnail: thumbnailUrl,
      };

      // Create or update branch
      const url = branchId ? `/api/branches/${branchId}` : '/api/branches';
      const method = branchId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(branchData),
      });

      const result = await response.json();

      if (result.success) {
        alert(`Branch ${branchId ? 'updated' : 'created'} successfully!`);
        if (onSuccess) onSuccess(result.data);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{branchId ? 'Edit Branch' : 'Create Branch'}</h2>

      {/* Thumbnail Upload */}
      <div>
        <label>Branch Thumbnail (Cover Image)</label>
        {thumbnailPreview && (
          <div>
            <img
              src={thumbnailPreview}
              alt="Thumbnail Preview"
              style={{ maxWidth: '300px', borderRadius: '8px', marginBottom: '10px' }}
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
        />
      </div>

      {/* Other Fields */}
      <div>
        <label>Branch Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <label>Address</label>
        <input
          type="text"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div>
        <label>Registration Fee</label>
        <input
          type="number"
          value={formData.reg_fee}
          onChange={(e) => setFormData({ ...formData, reg_fee: parseInt(e.target.value) })}
        />
      </div>

      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.is_mess_available}
            onChange={(e) => setFormData({ ...formData, is_mess_available: e.target.checked })}
          />
          Mess Available
        </label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Saving...' : branchId ? 'Update Branch' : 'Create Branch'}
      </button>
    </form>
  );
}

export default BranchForm;
```

## Thumbnail Best Practices

1. **Recommended Size**: 1200x800px or 16:9 aspect ratio
2. **Format**: JPEG for photos, WebP for smaller file sizes
3. **Optimization**: Compress images before upload (max 2MB)
4. **Cloudinary Transformations**:
   ```javascript
   // Original
   const original = branch.thumbnail;
   
   // Different sizes
   const thumbnail = original.replace('/upload/', '/upload/w_300,h_200,c_fill/');
   const medium = original.replace('/upload/', '/upload/w_800,h_600,c_fill/');
   const optimized = original.replace('/upload/', '/upload/q_auto,f_auto/');
   ```

## Error Handling

```javascript
async function createBranchWithValidation(data, thumbnailFile) {
  try {
    // Validate required fields
    if (!data.name) {
      throw new Error('Branch name is required');
    }

    // Upload thumbnail if provided
    let thumbnailUrl = null;
    if (thumbnailFile) {
      const formData = new FormData();
      formData.append('file', thumbnailFile);
      formData.append('branch_id', 1);
      formData.append('title', `${data.name} Thumbnail`);

      const uploadRes = await fetch('/api/gallery/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error('Thumbnail upload failed');
      }

      const uploadResult = await uploadRes.json();
      thumbnailUrl = uploadResult.data.image_url;
    }

    // Create branch
    const response = await fetch('/api/branches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...data,
        thumbnail: thumbnailUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create branch');
    }

    return await response.json();
  } catch (error) {
    console.error('Create branch error:', error);
    throw error;
  }
}
```
