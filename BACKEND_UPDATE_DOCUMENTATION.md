# Backend Database Update Documentation

**Date:** October 21, 2025  
**Version:** 2.0  
**Migration File:** `0001_married_whirlwind.sql`

---

## 📋 Summary of Changes

Added 4 new fields to the `branch` table to support additional hostel features:

1. **`is_ladies`** - Boolean flag to identify ladies-only hostels
2. **`is_cooking`** - Boolean flag to indicate cooking facilities availability
3. **`cooking_price`** - Integer field for cooking facility pricing
4. **`display_order`** - Integer field to control branch display order

---

## 🗄️ Database Schema Changes

### Migration SQL
```sql
ALTER TABLE "branch" ADD COLUMN "is_ladies" boolean DEFAULT false;
ALTER TABLE "branch" ADD COLUMN "is_cooking" boolean DEFAULT false;
ALTER TABLE "branch" ADD COLUMN "cooking_price" integer;
ALTER TABLE "branch" ADD COLUMN "display_order" integer DEFAULT 0;
```

### Updated Branch Table Schema

```typescript
export const branch = pgTable('branch', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  contact_no: text('contact_no').array(),
  address: text('address'),
  gmap_link: text('gmap_link'),
  room_rate: jsonb('room_rate'), // [{ title: string, rate_per_month: number }]
  prime_location_perks: jsonb('prime_location_perks'), // [{ title: string, distance: string, time_to_reach: string }]
  amenities: text('amenities').array(),
  property_features: text('property_features').array(),
  reg_fee: integer('reg_fee'),
  is_mess_available: boolean('is_mess_available').default(false),
  
  // ✨ NEW FIELDS
  is_ladies: boolean('is_ladies').default(false),
  is_cooking: boolean('is_cooking').default(false),
  cooking_price: integer('cooking_price'),
  display_order: integer('display_order').default(0),
  
  thumbnail: text('thumbnail'), // Front cover image URL (Cloudinary)
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),
});
```

---

## 📊 TypeScript Types

### Updated Branch Type

```typescript
export type Branch = {
  id: number;
  name: string;
  contact_no: string[] | null;
  address: string | null;
  gmap_link: string | null;
  room_rate: any | null; // JSON type
  prime_location_perks: any | null; // JSON type
  amenities: string[] | null;
  property_features: string[] | null;
  reg_fee: number | null;
  is_mess_available: boolean | null;
  
  // ✨ NEW FIELDS
  is_ladies: boolean | null;
  is_cooking: boolean | null;
  cooking_price: number | null;
  display_order: number | null;
  
  thumbnail: string | null;
  created_at: Date;
  updated_at: Date;
};

export type NewBranch = {
  name: string;
  contact_no?: string[];
  address?: string;
  gmap_link?: string;
  room_rate?: any;
  prime_location_perks?: any;
  amenities?: string[];
  property_features?: string[];
  reg_fee?: number;
  is_mess_available?: boolean;
  
  // ✨ NEW FIELDS
  is_ladies?: boolean;
  is_cooking?: boolean;
  cooking_price?: number;
  display_order?: number;
  
  thumbnail?: string;
};
```

---

## 🔌 API Endpoints Changes

### Base URL
```
http://localhost:3000/api/branches
```

### 1. GET `/api/branches` - Get All Branches

**Response Changes:**
- Branches are now **ordered by `display_order`** (ascending)
- Each branch object includes the 4 new fields

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Main Branch",
      "address": "123 Main St",
      "contact_no": ["+91-9876543210"],
      "gmap_link": "https://maps.google.com/...",
      "room_rate": [
        { "title": "Single Room", "rate_per_month": 5000 }
      ],
      "prime_location_perks": [
        { "title": "Metro Station", "distance": "500m", "time_to_reach": "5 min" }
      ],
      "amenities": ["WiFi", "AC", "Laundry"],
      "property_features": ["Security", "CCTV"],
      "reg_fee": 1000,
      "is_mess_available": true,
      "is_ladies": false,           // ✨ NEW
      "is_cooking": true,            // ✨ NEW
      "cooking_price": 500,          // ✨ NEW
      "display_order": 0,            // ✨ NEW
      "thumbnail": "https://res.cloudinary.com/...",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 2. GET `/api/branches/:id` - Get Single Branch

**Response Changes:**
- Response includes the 4 new fields

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Ladies Hostel - Koramangala",
    "is_ladies": true,              // ✨ NEW
    "is_cooking": true,             // ✨ NEW
    "cooking_price": 800,           // ✨ NEW
    "display_order": 1,             // ✨ NEW
    // ... other fields
  }
}
```

---

### 3. POST `/api/branches` - Create Branch

**Content-Type:** `multipart/form-data`

**New Form Fields:**

| Field Name | Type | Required | Default | Description |
|------------|------|----------|---------|-------------|
| `is_ladies` | string | No | `"false"` | Send `"true"` or `"false"` |
| `is_cooking` | string | No | `"false"` | Send `"true"` or `"false"` |
| `cooking_price` | string | No | `null` | Integer as string, e.g., `"500"` |
| `display_order` | string | No | `0` | Integer as string, e.g., `"1"` |

**Example Request (FormData):**
```javascript
const formData = new FormData();
formData.append('name', 'Ladies Hostel - Indiranagar');
formData.append('address', '456 Indiranagar Main Road');
formData.append('contact_no', JSON.stringify(['+91-9876543210']));
formData.append('is_mess_available', 'true');

// ✨ NEW FIELDS
formData.append('is_ladies', 'true');
formData.append('is_cooking', 'true');
formData.append('cooking_price', '800');
formData.append('display_order', '1');

// Optional thumbnail
formData.append('thumbnail', fileObject);

// Other fields...
formData.append('amenities', JSON.stringify(['WiFi', 'AC']));
formData.append('room_rate', JSON.stringify([
  { title: 'Single Room', rate_per_month: 6000 }
]));
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "name": "Ladies Hostel - Indiranagar",
    "is_ladies": true,
    "is_cooking": true,
    "cooking_price": 800,
    "display_order": 1,
    // ... other fields
  },
  "message": "Branch created successfully"
}
```

---

### 4. PUT `/api/branches/:id` - Update Branch

**Content-Type:** `multipart/form-data`

**New Form Fields:**

| Field Name | Type | Required | Description |
|------------|------|----------|-------------|
| `is_ladies` | string | No | Send `"true"` or `"false"` to update |
| `is_cooking` | string | No | Send `"true"` or `"false"` to update |
| `cooking_price` | string | No | Integer as string, e.g., `"500"` |
| `display_order` | string | No | Integer as string, e.g., `"2"` |

**Example Request (FormData):**
```javascript
const formData = new FormData();
formData.append('is_ladies', 'true');
formData.append('is_cooking', 'false');
formData.append('cooking_price', '1000');
formData.append('display_order', '5');

// You can update other fields too
formData.append('name', 'Updated Branch Name');

fetch('http://localhost:3000/api/branches/1', {
  method: 'PUT',
  body: formData
});
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Branch Name",
    "is_ladies": true,
    "is_cooking": false,
    "cooking_price": 1000,
    "display_order": 5,
    // ... other fields
    "updated_at": "2024-01-02T10:30:00.000Z"
  },
  "message": "Branch updated successfully"
}
```

---

### 5. DELETE `/api/branches/:id` - Delete Branch

**No changes** to this endpoint

---

## 🎨 Frontend Implementation Guide

### 1. Update TypeScript Interfaces

```typescript
// types/branch.ts
export interface Branch {
  id: number;
  name: string;
  contact_no: string[] | null;
  address: string | null;
  gmap_link: string | null;
  room_rate: RoomRate[] | null;
  prime_location_perks: LocationPerk[] | null;
  amenities: string[] | null;
  property_features: string[] | null;
  reg_fee: number | null;
  is_mess_available: boolean | null;
  
  // ✨ ADD THESE NEW FIELDS
  is_ladies: boolean | null;
  is_cooking: boolean | null;
  cooking_price: number | null;
  display_order: number | null;
  
  thumbnail: string | null;
  created_at: string;
  updated_at: string;
}

export interface RoomRate {
  title: string;
  rate_per_month: number;
}

export interface LocationPerk {
  title: string;
  distance: string;
  time_to_reach: string;
}
```

---

### 2. Update Form Components

#### Add Form Fields (React Example)

```tsx
import { useState } from 'react';

export function BranchForm() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    is_mess_available: false,
    
    // ✨ NEW FIELDS
    is_ladies: false,
    is_cooking: false,
    cooking_price: '',
    display_order: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = new FormData();
    form.append('name', formData.name);
    form.append('address', formData.address);
    form.append('is_mess_available', formData.is_mess_available.toString());
    
    // ✨ NEW FIELDS
    form.append('is_ladies', formData.is_ladies.toString());
    form.append('is_cooking', formData.is_cooking.toString());
    if (formData.cooking_price) {
      form.append('cooking_price', formData.cooking_price);
    }
    form.append('display_order', formData.display_order.toString());
    
    // ... other fields
    
    const response = await fetch('http://localhost:3000/api/branches', {
      method: 'POST',
      body: form,
    });
    
    const result = await response.json();
    console.log(result);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Branch Name"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />
      
      {/* ✨ NEW: Ladies Hostel Toggle */}
      <label>
        <input
          type="checkbox"
          checked={formData.is_ladies}
          onChange={(e) => setFormData({ ...formData, is_ladies: e.target.checked })}
        />
        Ladies Hostel
      </label>
      
      {/* ✨ NEW: Cooking Facilities Toggle */}
      <label>
        <input
          type="checkbox"
          checked={formData.is_cooking}
          onChange={(e) => setFormData({ ...formData, is_cooking: e.target.checked })}
        />
        Cooking Facilities Available
      </label>
      
      {/* ✨ NEW: Cooking Price (conditional) */}
      {formData.is_cooking && (
        <input
          type="number"
          placeholder="Cooking Price"
          value={formData.cooking_price}
          onChange={(e) => setFormData({ ...formData, cooking_price: e.target.value })}
        />
      )}
      
      {/* ✨ NEW: Display Order */}
      <input
        type="number"
        placeholder="Display Order"
        value={formData.display_order}
        onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
      />
      
      <button type="submit">Create Branch</button>
    </form>
  );
}
```

---

### 3. Display Branch Cards with New Fields

```tsx
export function BranchCard({ branch }: { branch: Branch }) {
  return (
    <div className="branch-card">
      {/* ✨ NEW: Ladies Hostel Badge */}
      {branch.is_ladies && (
        <span className="badge badge-pink">👩 Ladies Hostel</span>
      )}
      
      <h3>{branch.name}</h3>
      <p>{branch.address}</p>
      
      {/* Existing features */}
      {branch.is_mess_available && (
        <span className="feature">🍽️ Mess Available</span>
      )}
      
      {/* ✨ NEW: Cooking Facilities */}
      {branch.is_cooking && (
        <div className="feature">
          <span>👨‍🍳 Cooking Allowed</span>
          {branch.cooking_price && (
            <span className="price">₹{branch.cooking_price}/month</span>
          )}
        </div>
      )}
      
      {/* Other branch details */}
    </div>
  );
}
```

---

### 4. Filtering Branches

```tsx
export function BranchList() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [filter, setFilter] = useState({
    showOnlyLadies: false,
    showOnlyCooking: false,
  });

  useEffect(() => {
    fetch('http://localhost:3000/api/branches')
      .then(res => res.json())
      .then(data => setBranches(data.data));
  }, []);

  const filteredBranches = branches.filter(branch => {
    if (filter.showOnlyLadies && !branch.is_ladies) return false;
    if (filter.showOnlyCooking && !branch.is_cooking) return false;
    return true;
  });

  return (
    <div>
      {/* ✨ NEW: Filters */}
      <div className="filters">
        <label>
          <input
            type="checkbox"
            checked={filter.showOnlyLadies}
            onChange={(e) => setFilter({ ...filter, showOnlyLadies: e.target.checked })}
          />
          Ladies Hostels Only
        </label>
        
        <label>
          <input
            type="checkbox"
            checked={filter.showOnlyCooking}
            onChange={(e) => setFilter({ ...filter, showOnlyCooking: e.target.checked })}
          />
          With Cooking Facilities
        </label>
      </div>

      {/* Display filtered branches */}
      {filteredBranches.map(branch => (
        <BranchCard key={branch.id} branch={branch} />
      ))}
    </div>
  );
}
```

---

## 🎯 Use Cases

### Use Case 1: Ladies Hostel Filter
```typescript
const ladiesHostels = branches.filter(branch => branch.is_ladies);
```

### Use Case 2: Branches with Cooking
```typescript
const cookingBranches = branches.filter(branch => branch.is_cooking);
```

### Use Case 3: Sort by Display Order
The API already returns branches sorted by `display_order`, but you can also sort manually:
```typescript
const sortedBranches = [...branches].sort((a, b) => 
  (a.display_order || 0) - (b.display_order || 0)
);
```

### Use Case 4: Calculate Total Monthly Cost
```typescript
function calculateMonthlyCost(branch: Branch, roomType: string) {
  const room = branch.room_rate?.find(r => r.title === roomType);
  const baseRate = room?.rate_per_month || 0;
  const cookingCost = branch.is_cooking ? (branch.cooking_price || 0) : 0;
  
  return baseRate + cookingCost;
}
```

---

## ✅ Testing Checklist

### Backend Testing
- [ ] Run migration: `npx drizzle-kit push`
- [ ] Test GET all branches (verify new fields present)
- [ ] Test GET single branch (verify new fields present)
- [ ] Test POST with new fields
- [ ] Test PUT to update new fields
- [ ] Verify branches are ordered by `display_order`

### Frontend Testing
- [ ] Update TypeScript types
- [ ] Add form fields for new properties
- [ ] Display new fields in branch cards
- [ ] Test filtering by ladies hostel
- [ ] Test filtering by cooking facilities
- [ ] Display cooking price when available
- [ ] Test sorting by display_order

---

## 🚀 Deployment Steps

1. **Backup Database** (if production)
   ```bash
   # Your database backup command
   ```

2. **Run Migration**
   ```bash
   npx drizzle-kit push
   ```

3. **Restart Backend Server**
   ```bash
   npm run dev  # or your production command
   ```

4. **Update Frontend**
   - Update types/interfaces
   - Update forms
   - Update display components
   - Deploy frontend

---

## 📝 Notes

- **Default Values:**
  - `is_ladies`: `false`
  - `is_cooking`: `false`
  - `cooking_price`: `null` (not required)
  - `display_order`: `0`

- **Validation:**
  - `cooking_price` is optional and can be `null`
  - Boolean fields are sent as strings `"true"` or `"false"` in multipart/form-data
  - `display_order` controls the sequence in which branches appear

- **Breaking Changes:**
  - None - All new fields are optional
  - Existing API responses now include 4 additional fields

---

## 🆘 Support

If you encounter any issues:
1. Check that migration ran successfully
2. Verify field types match the schema
3. Check FormData is properly formatted
4. Review console logs for errors

---

**End of Documentation**
