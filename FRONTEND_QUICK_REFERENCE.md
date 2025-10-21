# Frontend Quick Reference - New Branch Fields

**Last Updated:** October 21, 2025

---

## 🎯 Quick Summary

Four new fields added to branches:
- `is_ladies` → Boolean - Is it a ladies hostel?
- `is_cooking` → Boolean - Are cooking facilities available?
- `cooking_price` → Number - Monthly cost for cooking (can be null)
- `display_order` → Number - Order in which branches appear

---

## 📦 1. TypeScript Type Update

```typescript
export interface Branch {
  // Existing fields...
  id: number;
  name: string;
  is_mess_available: boolean | null;
  
  // ✨ ADD THESE
  is_ladies: boolean | null;
  is_cooking: boolean | null;
  cooking_price: number | null;
  display_order: number | null;
}
```

---

## 🔌 2. API Examples

### Fetch All Branches (Already Sorted!)
```typescript
const response = await fetch('http://localhost:3000/api/branches');
const { data } = await response.json();
// data is already sorted by display_order ✅
```

### Create Branch with New Fields
```typescript
const formData = new FormData();
formData.append('name', 'New Ladies Hostel');
formData.append('is_ladies', 'true');      // ✨
formData.append('is_cooking', 'true');     // ✨
formData.append('cooking_price', '500');   // ✨
formData.append('display_order', '1');     // ✨

await fetch('http://localhost:3000/api/branches', {
  method: 'POST',
  body: formData
});
```

### Update Branch
```typescript
const formData = new FormData();
formData.append('is_ladies', 'false');
formData.append('display_order', '10');

await fetch(`http://localhost:3000/api/branches/${branchId}`, {
  method: 'PUT',
  body: formData
});
```

---

## 🎨 3. UI Components

### Display Ladies Badge
```tsx
{branch.is_ladies && (
  <span className="badge badge-ladies">👩 Ladies Hostel</span>
)}
```

### Display Cooking Info
```tsx
{branch.is_cooking && (
  <div className="feature">
    <span>👨‍🍳 Cooking Allowed</span>
    {branch.cooking_price && (
      <span className="price">₹{branch.cooking_price}/mo</span>
    )}
  </div>
)}
```

### Form Inputs
```tsx
{/* Ladies Hostel Checkbox */}
<label>
  <input
    type="checkbox"
    checked={formData.is_ladies}
    onChange={(e) => setFormData({
      ...formData,
      is_ladies: e.target.checked
    })}
  />
  Ladies Hostel
</label>

{/* Cooking Toggle */}
<label>
  <input
    type="checkbox"
    checked={formData.is_cooking}
    onChange={(e) => setFormData({
      ...formData,
      is_cooking: e.target.checked
    })}
  />
  Cooking Facilities
</label>

{/* Cooking Price (show only if cooking enabled) */}
{formData.is_cooking && (
  <input
    type="number"
    placeholder="Cooking Price (₹/month)"
    value={formData.cooking_price || ''}
    onChange={(e) => setFormData({
      ...formData,
      cooking_price: e.target.value
    })}
  />
)}

{/* Display Order */}
<input
  type="number"
  placeholder="Display Order"
  value={formData.display_order}
  onChange={(e) => setFormData({
    ...formData,
    display_order: parseInt(e.target.value) || 0
  })}
/>
```

---

## 🔍 4. Filtering Examples

### Filter Ladies Hostels Only
```typescript
const ladiesHostels = branches.filter(b => b.is_ladies);
```

### Filter Hostels with Cooking
```typescript
const cookingHostels = branches.filter(b => b.is_cooking);
```

### Filter Both
```typescript
const ladiesWithCooking = branches.filter(
  b => b.is_ladies && b.is_cooking
);
```

---

## 💰 5. Price Calculation

```typescript
function calculateTotalMonthlyCost(
  branch: Branch,
  selectedRoom: string
): number {
  // Base room rate
  const room = branch.room_rate?.find(r => r.title === selectedRoom);
  const baseRate = room?.rate_per_month || 0;
  
  // Add cooking if applicable
  const cookingCost = branch.is_cooking 
    ? (branch.cooking_price || 0) 
    : 0;
  
  return baseRate + cookingCost;
}

// Usage
const total = calculateTotalMonthlyCost(branch, 'Single Room');
console.log(`Total: ₹${total}/month`);
```

---

## 🎭 6. Filter UI Component

```tsx
function BranchFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    ladiesOnly: false,
    cookingOnly: false,
  });

  const handleChange = (key: string, value: boolean) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="filters">
      <label>
        <input
          type="checkbox"
          checked={filters.ladiesOnly}
          onChange={(e) => handleChange('ladiesOnly', e.target.checked)}
        />
        👩 Ladies Hostels
      </label>
      
      <label>
        <input
          type="checkbox"
          checked={filters.cookingOnly}
          onChange={(e) => handleChange('cookingOnly', e.target.checked)}
        />
        👨‍🍳 With Cooking
      </label>
    </div>
  );
}
```

---

## 📋 7. Complete Branch Card Example

```tsx
function BranchCard({ branch }: { branch: Branch }) {
  return (
    <div className="branch-card">
      {/* Header with badges */}
      <div className="card-header">
        <h3>{branch.name}</h3>
        <div className="badges">
          {branch.is_ladies && (
            <span className="badge pink">👩 Ladies</span>
          )}
          {branch.is_cooking && (
            <span className="badge green">👨‍🍳 Cooking</span>
          )}
          {branch.is_mess_available && (
            <span className="badge blue">🍽️ Mess</span>
          )}
        </div>
      </div>

      {/* Address */}
      <p className="address">{branch.address}</p>

      {/* Features */}
      <div className="features">
        {branch.is_cooking && (
          <div className="feature">
            <span className="label">Cooking:</span>
            <span className="value">
              {branch.cooking_price 
                ? `₹${branch.cooking_price}/month` 
                : 'Available'}
            </span>
          </div>
        )}
        
        {/* Room rates */}
        {branch.room_rate?.map((room, i) => (
          <div key={i} className="feature">
            <span className="label">{room.title}:</span>
            <span className="value">₹{room.rate_per_month}/month</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <button>View Details</button>
    </div>
  );
}
```

---

## 🎨 8. CSS Suggestions

```css
/* Ladies badge */
.badge.pink {
  background: #ff69b4;
  color: white;
}

/* Cooking badge */
.badge.green {
  background: #4caf50;
  color: white;
}

/* Feature with price */
.feature {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.feature .price {
  font-weight: bold;
  color: #2196f3;
}
```

---

## 📊 9. Example Data Structure

```json
{
  "id": 1,
  "name": "Nyxta Ladies Hostel - Koramangala",
  "address": "123 Main Road, Koramangala",
  "is_ladies": true,
  "is_cooking": true,
  "cooking_price": 500,
  "display_order": 1,
  "is_mess_available": true,
  "room_rate": [
    { "title": "Single Room", "rate_per_month": 6000 },
    { "title": "Double Sharing", "rate_per_month": 4500 }
  ],
  "amenities": ["WiFi", "AC", "Laundry"],
  "thumbnail": "https://res.cloudinary.com/..."
}
```

---

## ⚠️ Important Notes

1. **Default Values:**
   - `is_ladies`: `false`
   - `is_cooking`: `false`
   - `cooking_price`: `null` (can be empty)
   - `display_order`: `0`

2. **Sorting:**
   - API automatically returns branches sorted by `display_order` (ascending)
   - No need to sort on frontend unless you want different order

3. **FormData:**
   - Send booleans as strings: `"true"` or `"false"`
   - Send numbers as strings: `"500"`, `"1"`

4. **Null Safety:**
   - Always check if `cooking_price` exists before displaying
   - Use optional chaining: `branch.cooking_price || 0`

---

## 🧪 Testing Tips

```typescript
// Mock data for testing
const mockBranch: Branch = {
  id: 1,
  name: "Test Ladies Hostel",
  is_ladies: true,
  is_cooking: true,
  cooking_price: 500,
  display_order: 1,
  // ... other fields
};

// Test filtering
const ladiesHostels = [mockBranch].filter(b => b.is_ladies);
expect(ladiesHostels).toHaveLength(1);

// Test price calculation
const total = calculateTotalMonthlyCost(mockBranch, 'Single Room');
expect(total).toBeGreaterThan(0);
```

---

## 🚀 Ready to Go!

1. ✅ Update your TypeScript interfaces
2. ✅ Add form fields for new properties
3. ✅ Display badges and info in branch cards
4. ✅ Add filter options
5. ✅ Test with real API data

**Full Documentation:** See `BACKEND_UPDATE_DOCUMENTATION.md` for detailed examples

---

**Questions?** Check the main documentation or review API responses in browser DevTools!
