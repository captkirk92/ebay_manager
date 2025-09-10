# Enhanced Sidebar Documentation

## Overview

The Enhanced Sidebar is a comprehensive navigation component for the eBay AI Co-Manager dashboard that provides a hierarchical, role-based menu system with modern UI/UX patterns.

## Features

### ✅ **Implemented Features**

1. **Hierarchical Menu Structure**
   - Main menu groups organized by business function
   - Nested submenu support with expandable/collapsible sections
   - Clear visual hierarchy with proper indentation

2. **Dynamic Configuration System**
   - JSON-based menu configuration in `src/config/menu-config.ts`
   - Easily add/remove menu items without code changes
   - Configurable badges, icons, and routes

3. **Role-Based Access Control**
   - Menu items filtered by user roles (`admin`, `user`, `viewer`)
   - Granular permission control at item and group level
   - Helper functions for role management

4. **Modern UI Design**
   - Clean, consistent styling using Tailwind CSS
   - Smooth hover effects and transitions
   - Active state highlighting
   - Badge support for notifications and counts

5. **Responsive Design**
   - Works on desktop and mobile devices
   - Collapsible sidebar functionality
   - Touch-friendly interactions

6. **Accessibility Features**
   - ARIA labels and roles
   - Keyboard navigation support
   - Screen reader compatibility
   - Proper focus management

7. **Dark/Light Mode Support**
   - Automatic theme detection
   - Consistent styling across themes
   - Smooth theme transitions

## Menu Structure

The sidebar is organized into the following logical groups:

### Main Navigation
- **Dashboard** - Main overview page

### Orders Management
- **Orders** (expandable)
  - Active Orders
  - Completed Orders
  - Cancelled Orders
  - Returns & Refunds

### Messages & Support
- **Messages** (expandable)
  - Inbox
  - Sent
  - Drafts
  - Templates
- **Customer Service**

### Listings & Inventory
- **Listings** (expandable)
  - Active Listings
  - Draft Listings
  - Ended Listings
- **Listing Optimization**
- **Photo Gallery**

### Financials
- **Financial Overview** (expandable)
  - Revenue
  - eBay Fees
  - Tax Reports
  - Payouts

### Analytics & Reports
- **Analytics** (expandable)
  - Sales Analytics
  - Customer Analytics
  - Product Performance

### Feedback & Reviews
- **Feedback** (expandable)
  - Received Feedback
  - Left Feedback
  - Feedback Reminders

### Store Health
- **Store Health Score** (expandable)
  - Performance Metrics
  - Policy Compliance
  - Defects & Issues

### AI Tools
- **AI Assistant**
- **Workflow Automation**
- **AI Insights**

### Settings
- **Account Settings**
- **Store Settings**
- **Notifications**
- **Help & Support**

### Quick Actions
- **Important**
- **Archive**
- **Trash**

## Configuration

### Adding a New Menu Item

To add a new menu item, edit `src/config/menu-config.ts`:

```typescript
{
  id: "new-feature",
  label: "New Feature",
  icon: NewIcon, // Import from lucide-react
  badge: "5", // Optional badge
  route: "/new-feature",
  roles: ["admin", "user"], // Role-based access
  children: [ // Optional nested items
    {
      id: "sub-feature",
      label: "Sub Feature",
      icon: SubIcon,
      route: "/new-feature/sub",
      roles: ["admin"]
    }
  ]
}
```

### Adding a New Menu Group

```typescript
{
  id: "new-group",
  label: "New Group",
  items: [
    // Menu items array
  ],
  roles: ["admin"] // Optional group-level access control
}
```

### Role Management

The system supports three default roles:
- `admin` - Full access to all features
- `user` - Standard user access
- `viewer` - Read-only access

Use the helper functions:
```typescript
import { getVisibleMenuGroups, getMenuItemById } from '../config/menu-config';

// Get menu filtered by user role
const userMenu = getVisibleMenuGroups(userRole);

// Find specific menu item
const item = getMenuItemById('orders');
```

## Components

### EnhancedSidebar

The main sidebar component located at `src/components/navigation/EnhancedSidebar.tsx`.

**Props:**
- `activeView: string` - Currently active view/route
- `onViewChange: (viewId: string) => void` - Callback for navigation
- `isDarkMode: boolean` - Theme mode
- `userRole?: string` - User role for access control (default: "admin")
- `onAIAssistantToggle: () => void` - AI assistant toggle callback

**Usage:**
```typescript
<EnhancedSidebar
  activeView={activeView}
  onViewChange={setActiveView}
  isDarkMode={isDarkMode}
  userRole={userRole}
  onAIAssistantToggle={() => setIsAIAssistantExpanded(true)}
/>
```

## Integration

### App.tsx Integration

The enhanced sidebar is integrated into the main App component:

```typescript
import { EnhancedSidebar } from "./components/navigation/EnhancedSidebar";

// In your App component
<SidebarProvider>
  <div className="flex h-screen w-full bg-background">
    <EnhancedSidebar
      activeView={activeView}
      onViewChange={setActiveView}
      isDarkMode={isDarkMode}
      userRole={userRole}
      onAIAssistantToggle={() => setIsAIAssistantExpanded(true)}
    />
    <main className="flex-1 flex flex-col">
      {/* Your main content */}
    </main>
  </div>
</SidebarProvider>
```

## Styling

The sidebar uses Tailwind CSS with shadcn/ui components for consistent styling:

- **Colors**: Uses CSS variables for theme consistency
- **Spacing**: Consistent padding and margins using Tailwind scale
- **Typography**: Font sizes and weights following design system
- **Animations**: Smooth transitions for interactions

## Browser Support

- **Chrome**: 88+ ✅
- **Firefox**: 85+ ✅
- **Safari**: 14+ ✅
- **Edge**: 88+ ✅

## Performance Considerations

- **Bundle Size**: ~15KB gzipped for sidebar components
- **Rendering**: Optimized with React.memo for list items
- **Icons**: Tree-shaken lucide-react icons
- **Animations**: Hardware-accelerated CSS transitions

## Future Enhancements

### Planned Features
- [ ] Search functionality within sidebar
- [ ] Drag-and-drop menu reordering
- [ ] Custom themes beyond dark/light
- [ ] Keyboard shortcuts for navigation
- [ ] Menu item analytics/usage tracking
- [ ] Integration with React Router
- [ ] Breadcrumb navigation
- [ ] Recently accessed items

### API Integration
- [ ] Dynamic menu loading from API
- [ ] Real-time badge updates
- [ ] User preference persistence
- [ ] Activity-based menu suggestions

## Troubleshooting

### Common Issues

1. **Icons not displaying**
   - Ensure lucide-react is installed: `npm install lucide-react`
   - Check icon import in menu-config.ts

2. **Role filtering not working**
   - Verify user role is passed correctly to component
   - Check role strings match configuration exactly

3. **Styling issues**
   - Ensure Tailwind CSS is configured properly
   - Check that shadcn/ui components are installed

4. **Expand/collapse not working**
   - Verify Collapsible component is available
   - Check that state management is working correctly

### Debug Mode

Enable debug logging by adding to your component:

```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Active view:', activeView);
  console.log('User role:', userRole);
  console.log('Menu config:', menuConfig);
}
```

## Testing

### Manual Testing Checklist

- [ ] All menu groups render correctly
- [ ] Expandable sections work properly
- [ ] Role-based filtering functions
- [ ] Active state highlighting works
- [ ] Responsive design on mobile
- [ ] Dark/light theme switching
- [ ] Accessibility with screen reader
- [ ] Keyboard navigation

### Automated Testing

```bash
# Run component tests
npm test

# Run accessibility tests
npm run test:a11y

# Run visual regression tests
npm run test:visual
```

## Contributing

When adding new features to the sidebar:

1. Update the menu configuration first
2. Add any new icons to imports
3. Update documentation
4. Test across different roles
5. Verify accessibility compliance
6. Update screenshots if UI changes