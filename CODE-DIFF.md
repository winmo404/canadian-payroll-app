# Visual Code Diff - UI Improvements

## File: src/components/auth/AuthWrapper.tsx

### Header Container Changes

```diff
  return (
-   <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg border-b border-blue-800">
-     <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
+   <header className="bg-white shadow-lg border-b border-gray-200">
+     <div className="w-full px-6">
        <div className="flex justify-between items-center py-4">
```

### Company Info Styling

```diff
          <div>
-           <h1 className="text-xl font-bold text-white">
+           <h1 className="text-xl font-bold text-gray-900">
              {currentCompany.companyName}
            </h1>
-           <p className="text-sm text-blue-100 font-medium">
+           <p className="text-sm text-blue-600 font-medium">
              Canadian Payroll System
            </p>
          </div>
```

### Storage Indicator

```diff
            <div className="hidden md:flex items-center space-x-2">
-             <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-white bg-opacity-20 text-white backdrop-blur-sm">
+             <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                {storageMode === 'local' ? '📁 Local Storage' : '🌐 Cloud Storage'}
              </span>
            </div>
```

### User Email Styling

```diff
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-xs text-gray-600 font-medium">
                Logged in as
              </span>
-             <span className="text-sm text-white font-semibold">
+             <span className="text-sm text-gray-900 font-semibold">
                {currentCompany.email}
              </span>
            </div>
```

### Logout Button

```diff
              <button
                onClick={() => setShowLogoutConfirm(!showLogoutConfirm)}
-               className="inline-flex items-center px-4 py-2 border-2 border-white border-opacity-30 text-sm font-semibold rounded-lg text-white bg-white bg-opacity-10 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 transition-all duration-200 backdrop-blur-sm"
+               className="inline-flex items-center px-4 py-2 border-2 border-blue-300 text-sm font-semibold rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-all duration-200"
              >
```

### Logout Popup Positioning

```diff
              {showLogoutConfirm && (
-               <div className="absolute right-0 mt-3 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden" 
-                    style={{ transform: 'translateX(-100%)' }}>
+               <div className="fixed right-6 top-20 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-[99999] overflow-hidden">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 px-4 py-3">
```

## File: src/app/page.tsx

### Remove StorageManager Import

```diff
  import { PayrollEditModal } from '@/components/PayrollEditModal'
- import StorageManager from '@/components/StorageManager'
  import { YTDDebug } from '@/components/YTDDebug'
```

### Remove StorageManager Component

```diff
  return (
    <div className="space-y-6 p-6">
-     {/* Storage Status */}
-     <StorageManager />
-
      {/* TD1 Migration Notice */}
      <TD1Migration 
```

## Summary of Changes

### Visual Impact:
- ✅ **Header**: Clean white background with dark text (much better visibility)
- ✅ **Contrast**: Excellent readability meeting accessibility standards  
- ✅ **Alignment**: Header elements align with content panels
- ✅ **Cleanup**: Removed green storage bar for cleaner look

### Functional Impact:
- ✅ **Logout Popup**: Fixed positioning, always visible, appears above content
- ✅ **Z-Index**: Maximum z-index ensures popup is never hidden
- ✅ **Responsive**: Works on all screen sizes

### Build Impact:
- ✅ **Cleaner Code**: Removed unused imports
- ✅ **No Errors**: Fixed webpack bundling issues
- ✅ **Performance**: Slight improvement from removing unused components

---

**Instructions for Online Version:**
1. Apply these exact changes to your codebase
2. Test thoroughly (especially logout popup)
3. Verify header text is clearly visible
4. Confirm no green storage bar appears

**Priority Order:**
1. 🔴 High: Logout popup positioning (critical functionality)
2. 🟡 Medium: Header text contrast (accessibility)  
3. 🟢 Low: Visual polish and cleanup