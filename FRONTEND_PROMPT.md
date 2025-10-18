# 📸 Add Branch Thumbnail Feature to CMS Frontend

## Quick Summary
Backend now supports **direct thumbnail file upload** for branches. Branch endpoints accept multipart/form-data with thumbnail file.

## What's Changed
- ✅ Database has new `thumbnail` field (TEXT, nullable, stores Cloudinary URL)
- ✅ **Branch endpoints now accept thumbnail FILE directly** (multipart/form-data)
- ✅ Automatic Cloudinary upload when thumbnail file is provided
- ✅ Demo data populated with sample thumbnails

## What You Need to Do

### 1. Branch List - Display Thumbnails
Add thumbnail column showing 150x100px preview with fallback placeholder.

### 2. Create Branch - Upload Thumbnail (NEW: Direct File Upload)
```javascript
// Single request - thumbnail file is uploaded automatically!
const formData = new FormData();

// Add thumbnail file (optional)
formData.append('thumbnail', imageFile);

// Add all other branch fields as strings
formData.append('name', 'Branch Name');
formData.append('contact_no', JSON.stringify(['9876543210']));
formData.append('address', '123 Street');
formData.append('amenities', JSON.stringify(['WiFi', 'AC']));
formData.append('room_rate', JSON.stringify({ single: 5000, double: 7000 }));
formData.append('is_mess_available', 'true');
formData.append('reg_fee', '1000');

// Create branch with thumbnail in one request
const response = await fetch('/api/branch', {
  method: 'POST',
  body: formData, // ⚠️ NO Content-Type header - browser sets it automatically
});

const result = await response.json();
console.log('Branch created with thumbnail:', result.data.thumbnail);
```

### 3. Edit Branch - Update Thumbnail (NEW: Direct File Upload)
```javascript
// Update branch with new thumbnail file
const formData = new FormData();
formData.append('thumbnail', newImageFile); // New thumbnail file
// Add other fields you want to update (optional)
formData.append('name', 'Updated Name');

const response = await fetch(`/api/branch/${branchId}`, {
  method: 'PUT',
  body: formData,
});
```
- Show current thumbnail (from `branch.thumbnail` URL)
- Allow uploading new image (replaces old one)
- Option to remove thumbnail (send PUT without thumbnail field)

### 4. Branch Detail - Display Full Thumbnail
Show as hero image at top of page using `branch.thumbnail` URL.

## API Quick Reference

**Create Branch with Thumbnail (NEW):**
```
POST /api/branch
Content-Type: multipart/form-data

Fields:
  thumbnail: [File] (optional) - Image file to upload
  name: [String] - Branch name
  contact_no: [String] - JSON array: '["9876543210"]'
  address: [String] - Branch address
  amenities: [String] - JSON array: '["WiFi","AC"]'
  room_rate: [String] - JSON object: '{"single":5000,"double":7000}'
  is_mess_available: [String] - "true" or "false"
  reg_fee: [String] - "1000"

Returns: 
  { 
    success: true, 
    data: { 
      id, name, thumbnail: "https://res.cloudinary.com/...", ... 
    } 
  }
```

**Update Branch with Thumbnail (NEW):**
```
PUT /api/branch/:id
Content-Type: multipart/form-data

Fields (all optional):
  thumbnail: [File] - New image file to replace existing
  name: [String] - Updated name
  ... other fields as needed

Returns: { success: true, data: { id, thumbnail, ... } }
```

**Get Branch(es):**
```
GET /api/branch[/:id]
Returns: { success: true, data: { id, name, thumbnail: "url", ... } }
```

## Test Data Available
All 3 branches now have demo thumbnails:
```bash
curl http://localhost:3000/api/branch
```

## React Component Snippet (Updated for Direct Upload)
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
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const multipartData = new FormData();
    
    // Add thumbnail file if selected
    if (thumbnailFile) {
      multipartData.append('thumbnail', thumbnailFile);
    }
    
    // Add all form fields (arrays/objects as JSON strings)
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
        // ⚠️ Don't set Content-Type - browser handles it automatically
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Branch created with thumbnail!');
        console.log('Cloudinary URL:', result.data.thumbnail);
      }
    } catch (error) {
      console.error('Error:', error);
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
            alt="Preview"
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
      
      {/* Add other form fields */}
      
      <button type="submit">Create Branch</button>
    </form>
  );
}
```

## Update Thumbnail Example
```jsx
function EditBranchForm({ branchId, currentThumbnail }) {
  const [newThumbnailFile, setNewThumbnailFile] = useState(null);

  const handleUpdateThumbnail = async () => {
    if (!newThumbnailFile) return;
    
    const formData = new FormData();
    formData.append('thumbnail', newThumbnailFile);
    
    const response = await fetch(`http://localhost:3000/api/branch/${branchId}`, {
      method: 'PUT',
      body: formData,
    });
    
    const result = await response.json();
    if (result.success) {
      alert('Thumbnail updated!');
      console.log('New URL:', result.data.thumbnail);
    }
  };

  return (
    <div>
      {currentThumbnail && (
        <img src={currentThumbnail} alt="Current" style={{ maxWidth: '300px' }} />
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setNewThumbnailFile(e.target.files[0])}
      />
      <button onClick={handleUpdateThumbnail}>Update Thumbnail</button>
    </div>
  );
}
```

## Validation
- **File Type:** Images only (jpg, png, webp)
- **Max Size:** 5MB (recommended)
- **Recommended Dimensions:** 1200x800px (16:9 aspect ratio)
- **Optional:** Thumbnail field can be omitted/null
- **Important:** Arrays/objects must be JSON stringified in form data
- **Boolean:** Send as string `"true"` or `"false"`

## Key Changes from Previous Version
- ❌ **OLD:** Two-step process (upload to gallery → create branch with URL)
- ✅ **NEW:** One-step process (create branch with file → automatic Cloudinary upload)
- ❌ **OLD:** JSON request with thumbnail URL string
- ✅ **NEW:** Multipart form data with actual file
- ✅ **Benefit:** Simpler frontend code, atomic operation, automatic upload

## Important Notes
1. **Don't set Content-Type header** - Browser automatically sets `multipart/form-data` with boundary
2. **JSON fields must be stringified** - Arrays (`contact_no`, `amenities`) and objects (`room_rate`) must use `JSON.stringify()`
3. **Booleans as strings** - `is_mess_available` must be `"true"` or `"false"` (string, not boolean)
4. **Numbers as strings** - `reg_fee` must be `"1000"` (string, not number)
5. **Thumbnail is optional** - Can create/update branch without thumbnail file

## Full Documentation
- `BRANCH_API_MULTIPART.md` - **⭐ Complete API guide with multipart examples**
- `FRONTEND_THUMBNAIL_TASK.md` - Task specification (may be outdated)
- `CLOUDINARY_API_DOCS.md` - Gallery endpoint reference (separate from branch)
- `BRANCH_THUMBNAIL_EXAMPLES.md` - Code examples (may be outdated)

## Questions?
Test endpoints at: `http://localhost:3000`
Backend automatically uploads to Cloudinary folder: `branch-thumbnails`
