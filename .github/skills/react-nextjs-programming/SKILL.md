---
name: react-nextjs-programming
description: '**WORKFLOW SKILL** — Comprehensive workflow for programming with React and Next.js, covering component development, state management, routing, API integration, styling, and testing. USE FOR: implementing new features, debugging issues, refactoring code in React/Next.js applications. DO NOT USE FOR: general coding questions; non-React/Next.js tasks; runtime debugging.'
---

# React/Next.js Programming Workflow

## Overview
This skill provides a structured approach to programming tasks in React and Next.js applications, ensuring best practices and comprehensive coverage of development aspects.

## Workflow Steps

1. **Requirements Analysis**
   - Review feature requirements, user stories, or bug reports
   - Identify affected components, pages, or APIs
   - Determine dependencies and constraints

2. **Architecture Planning**
   - Design component hierarchy and data flow
   - Plan state management approach (useState, Context, Redux, etc.)
   - Identify reusable components or hooks needed

3. **Project Structure Setup**
   - Create necessary directories and files
   - Set up TypeScript interfaces if needed
   - Update routing configuration for new pages

4. **Component Implementation**
   - Write React components with proper TypeScript typing
   - Implement component logic and event handlers
   - Add error boundaries where appropriate

5. **State and Data Management**
   - Implement local state with hooks
   - Set up API calls using fetch or libraries like Axios
   - Handle loading states and error handling

6. **Routing and Navigation**
   - Configure Next.js dynamic routes if needed
   - Implement client-side navigation
   - Handle route guards or redirects

7. **Styling and UI**
   - Apply CSS modules, Tailwind, or styled-components
   - Ensure responsive design
   - Add animations or transitions

8. **Testing**
   - Write unit tests for components
   - Add integration tests for features
   - Test edge cases and error scenarios

9. **Code Review and Optimization**
   - Perform code review for best practices
   - Optimize performance (memoization, lazy loading)
   - Ensure accessibility compliance

10. **Deployment Validation**
    - Test in production environment
    - Verify build process and optimizations
    - Monitor for runtime issues

## Decision Points

- **New Feature vs Bug Fix**: For bugs, start with reproduction and root cause analysis
- **Simple Component vs Complex Page**: Complex pages may require additional planning for data fetching and layout
- **Client-side vs Server-side**: Next.js specific - choose appropriate rendering strategy
- **State Management Complexity**: Simple features use local state; complex apps may need global state

## Quality Criteria

- Components are reusable and well-typed
- Code follows React/Next.js best practices
- Proper error handling and loading states
- Responsive and accessible UI
- Comprehensive test coverage
- Performance optimized

## Assets
- [Component Template](./templates/component.tsx)
- [API Service Template](./templates/apiService.ts)
- [Test Template](./templates/component.test.tsx)</content>
<parameter name="filePath">d:\Project\Web_ai\aithubs.com\.github\skills\react-nextjs-programming\SKILL.md