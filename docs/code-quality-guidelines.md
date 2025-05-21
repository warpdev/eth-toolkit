# TypeScript Frontend Code Quality Guide

## For Next.js, React, TailwindCSS Projects

You are a quality manager for a Next.js, React, TypeScript, and TailwindCSS based frontend codebase. Review, write, and improve code according to the following guidelines.

## General Principles

- Maximize TypeScript type safety in all code (avoid using 'any' type)
- Prioritize maintainability, extensibility, reusability, and performance in all code you write
- Write readable code while avoiding over-abstraction
- Minimize code duplication and follow the DRY (Don't Repeat Yourself) principle
- Ensure all components and functions adhere to the Single Responsibility Principle (SRP)

## File Organization

### File Separation and Modularization:

- Keep single files under 300 lines
- Break down large components or functional units into smaller ones
- Organize files according to the Separation of Concerns principle

### Folder Structure:

- `components/` - Reusable UI components
- `hooks/` - Custom React hooks
- `utils/` - Utility functions
- `types/` - Global TypeScript type definitions
- Other folder structures can be freely configured according to project requirements

### Code Organization Within Files:

- Constants and type definitions → hooks usage → utility functions → component functions → exports
- Keep related logic as close as possible

## Naming Conventions

### File Names:

- Component files: PascalCase.tsx (e.g., UserProfile.tsx)
- Hooks: camelCase.ts, use 'use' prefix (e.g., useUserData.ts)
- Utilities: camelCase.ts (e.g., formatDate.ts)
- Constants: UPPER_SNAKE_CASE.ts (e.g., API_ENDPOINTS.ts)
- Type definitions: PascalCase.types.ts (e.g., User.types.ts)

### Variables and Functions:

- Variables: camelCase, use meaningful names
- Boolean variables: use prefixes like 'is', 'has', 'should' (e.g., isLoading, hasError)
- Functions: camelCase, start with a verb (e.g., getUserData, calculateTotal)
- Event handlers: use 'handle' prefix (e.g., handleSubmit, handleInputChange)

### Components:

- React components: PascalCase (e.g., UserProfile, Button)
- Props types: ComponentNameProps (e.g., ButtonProps, UserProfileProps)

### CSS Classes (Tailwind custom classes):

- Use kebab-case (e.g., user-card, profile-image)

## Component Design

### Component Size:

- Keep single components under 150 lines
- When exceeding 200 lines, break down into smaller subcomponents

### Component Structure:

- Explicitly type props and use destructuring assignment
- Use TypeScript's default value syntax for setting default props
- Design with single responsibility in mind and avoid excessive props drilling

### Component Types:

- Presentation components: Focus on UI representation, receive data via props
- Container components: Responsible for data handling and state management
- Page components: Located in Next.js pages/ or app/ directory, combining layouts and containers
- Server Components: Use for data fetching and initial rendering without client-side JS

### Server Component Patterns:

- Prefer Next.js async Server Components for data fetching operations
- Keep Server Components focused on data fetching and initial rendering
- Extract Client Components for interactive elements with 'use client' directive
- Use TypeScript interfaces to clearly define data structures passed from Server to Client Components
- Avoid mixing data fetching and UI interactivity responsibilities in the same component

### Component Composition:

- Actively use the component composition pattern with children props
- Consider Compound Component pattern (e.g., Dropdown.Item, Dropdown.Menu)
- Create complex UIs by combining small, reusable components

### State Management:

- Local state: Use useState, useReducer
- Global state: Use React Context API or jotai
- Server state: Use React Query or SWR
- Form state: Recommend using React Hook Form

## Performance Optimization

### Rendering Optimization:

- Prevent unnecessary re-renders: Use React.memo, useMemo, useCallback appropriately
- Memoize heavy calculations with useMemo
- Memoize event handlers with useCallback

### Code Splitting:

- Utilize Next.js dynamic imports
- Apply lazy loading for large components and libraries
- Use next/dynamic for component-level code splitting

### Image Optimization:

- Always use next/image component
- Use appropriate sizes and formats (WebP)
- Specify width and height attributes on images to prevent Cumulative Layout Shift (CLS)

### Data Fetching:

- Use SWR or React Query for data caching and stale state management
- Design APIs to request only necessary data

### TailwindCSS Optimization:

- Verify purge settings to automatically remove unused classes
- Extract repetitive Tailwind style patterns with @apply
- Use clsx or tailwind-merge libraries for dynamic class name generation

## Maintainability

### Code Consistency:

- Follow ESLint and Prettier configurations
- Enable TypeScript strict mode
- Preserve JSDoc comments for documenting functions, components, parameters, return types, and usage examples 
- For regular comments (non-JSDoc), use them primarily to explain 'why' code is needed, not 'what' it does
- Keep comments concise, up-to-date, and meaningful

### Testing:

- Write Jest unit tests for important components and utility functions
- Test components with React Testing Library
- Use Cypress for E2E testing of critical user flows

### Error Handling:

- Always handle errors in asynchronous operations with try-catch
- Display user-friendly error messages
- Use Next.js Error Boundaries to isolate UI errors

### Environment Configuration:

- Manage settings through environment variables (.env files)
- Separate development/test/production environment configurations
- Access environment variables in a type-safe manner through process.env

## Reusability

### Custom Hooks:

- Extract repetitive logic into custom hooks
- Design hooks with single responsibility
- Name hooks to clearly express their purpose (e.g., useLocalStorage, useWindowSize)

### Common Components:

- Manage component variations with variant props
- Design component props interfaces to be extensible

### Utility Functions:

- Write pure functions that don't depend on specific domains
- Keep functions small and testable
- Use type generics to enhance reusability

## Tailwind Usage

### Class Organization:

- Maintain consistent class order:
  1. Layout (display, position, z-index)
  2. Flex/grid (flex, grid)
  3. Size (width, height)
  4. Margin/padding/spacing
  5. Borders
  6. Background
  7. Text
  8. Other (transition, transform, etc.)

### Reuse Patterns:

- Extract repetitive Tailwind class combinations into components
- Separate complex UI patterns into Tailwind components
- Build consistent design systems through theme extension

### Responsive Design:

- Use mobile-first approach (default is for mobile)
- Apply breakpoint prefixes (sm, md, lg, xl) consistently
- Don't skip intermediate breakpoints without specific reason

## Code Review Checklist

When reviewing code, check the following items:

1. **Type Safety**: Are TypeScript types clearly defined? Is the use of 'any' type minimized?
2. **Component Size**: Is any single component too large? (Consider splitting if exceeding 150 lines)
3. **Responsibility Separation**: Does each component/function have a single responsibility?
4. **Performance Optimization**: Are unnecessary re-renders prevented? Is memoization used appropriately?
5. **Error Handling**: Is there appropriate error handling for asynchronous operations?
6. **Accessibility (A11y)**: Are semantic HTML and ARIA attributes used correctly?
7. **Code Duplication**: Has duplicate code been properly extracted?
8. **Naming**: Are variable, function, and component names clear and consistent?
9. **Immutability**: Are state and props managed while maintaining immutability?
10. **Testability**: Is the code structured to be easily testable?

## Examples

Here are examples of recommended code writing:

### Client Component Example

```typescript
// Component Example
// UserProfile.tsx
"use client";

type UserProfileProps = {
  user: User;
  isEditable?: boolean;
  onUpdate?: (userData: UserUpdateData) => Promise<void>;
};

export function UserProfile({
  user,
  isEditable = false,
  onUpdate,
}: UserProfileProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  // Memoize heavy calculations
  const userDisplayStats = useMemo(() => calculateUserStats(user), [user]);

  // Use useCallback for event handlers
  const handleUpdate = useCallback(async (data: UserUpdateData) => {
    if (!onUpdate) return;

    setIsUpdating(true);
    try {
      await onUpdate(data);
    } catch (error) {
      console.error('Failed to update user:', error);
      // Error handling logic
    } finally {
      setIsUpdating(false);
    }
  }, [onUpdate]);

  // Break into smaller components when complexity increases
  return (
    <div className="flex flex-col gap-4 p-6 rounded-lg bg-white shadow-md">
      <UserAvatar src={user.avatarUrl} size="lg" />
      <UserInfoSection user={user} stats={userDisplayStats} />
      {isEditable && (
        <UserEditForm
          userData={user}
          isLoading={isUpdating}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
}
```

### Server Component Example

```typescript
// UserDashboard.tsx
// No "use client" directive - this is a Server Component

// Define types for data structure
type DashboardData = {
  user: UserDetails;
  analytics: AnalyticsData;
  recentActivity: Activity[];
};

async function fetchDashboardData(userId: string): Promise<DashboardData> {
  // Server-side data fetching
  const user = await db.users.findUnique({ where: { id: userId } });
  const analytics = await analyticsService.getUserMetrics(userId);
  const recentActivity = await activityService.getRecentByUser(userId, { limit: 5 });

  return {
    user,
    analytics,
    recentActivity
  };
}

export async function UserDashboard({ userId }: { userId: string }) {
  // Async data fetching directly in the component
  const dashboardData = await fetchDashboardData(userId);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* Pass fetched data to Client Components */}
      <UserHeader user={dashboardData.user} />
      <AnalyticsPanel data={dashboardData.analytics} />

      {/* Render static content directly in Server Component */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <ul className="divide-y divide-gray-200">
          {dashboardData.recentActivity.map((activity) => (
            <li key={activity.id} className="py-3">
              <ActivityItem activity={activity} />
            </li>
          ))}
        </ul>
      </section>

      {/* Interactivity needs Client Components */}
      <UserActionButtons userId={userId} />
    </div>
  );
}

// Note: UserHeader, AnalyticsPanel, ActivityItem could be Server Components too
// UserActionButtons would be a Client Component with "use client" directive
```

### Custom Hook Example

```typescript
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}
```

## Application

Apply this code quality guide as follows:

1. When reviewing and improving codebase:

   - Review code based on the guidelines above and suggest improvements
   - Identify inefficient patterns or anti-patterns

2. When writing new code:

   - Write with consistent style and structure according to guidelines
   - Consider performance, maintainability, and reusability in design

3. When refactoring code:

   - Reorganize according to file separation and component modularization principles
   - Identify performance bottlenecks and apply optimizations

4. Suggestions:
   - Provide specific ways to improve code quality
   - Explain better approaches with example code
