Build the complete application layout.

Include

Responsive Sidebar

Desktop sidebar

Tablet sidebar

Mobile drawer

Collapsible sidebar

Nested menu

Icons

Active state

Permission-based menu rendering

Top Navbar

Breadcrumb

Search placeholder

Notification icon

Profile dropdown

Theme toggle

Workspace title

Content Layout

Scrollable content

Sticky header

Sticky sidebar

Footer

Loading layout

Empty layout

404 page

Unauthorized page

Maintain proper spacing across the application.

Everything must use reusable layout components.

-------------------------------------------------
Build complete authentication infrastructure.

Include

Login

Forgot Password

Reset Password

Change Password

Logout

Remember Me

JWT Authentication

Refresh Token support

Axios interceptors

Protected Routes

Guest Routes

Session expiration handling

Auto logout

Role based authentication

Permission based authentication

Store authentication inside Redux Toolkit.

Never duplicate authentication logic.

Everything should be reusable.

-------------------------------------------------------
Create a complete User Management module.

Features

User List

Create User

Edit User

Delete User

Activate User

Deactivate User

Search

Pagination

Sorting

Filtering

Status

Role Assignment

Permission Assignment

Profile Image

Audit Information

Created By

Updated By

Created Date

Updated Date

Use reusable table components.

Use reusable forms.

Use reusable confirmation dialogs.

Use reusable modals.

--------------------------------------------

Create Enterprise RBAC.

Role Management

Permission Management

Menu Permissions

API Permissions

Route Permissions

Component Permissions

Page Permissions

Button Permissions

Field Permissions

Permission Guards

Route Guards

Permission Hooks

Permission Context

Everything should be dynamic.

No hardcoded permissions.

Menus should automatically hide based on permissions.

Buttons should disappear if permission is missing.

Unauthorized pages should be shown properly.

---------------------------------------------------------------------------

Build reusable enterprise UI components.

Button

Input

Textarea

Select

Multi Select

Checkbox

Radio

Toggle

Date Picker

Time Picker

Avatar

Badge

Card

Modal

Drawer

Popover

Tooltip

Accordion

Tabs

Dropdown

Table

Pagination

Search Bar

Filter Panel

Breadcrumb

Loading Spinner

Skeleton

Empty State

Error State

Toast

Alert

Confirmation Dialog

File Upload

Image Upload

Data Table

Everything must be reusable.

Every component should support dark mode.

Every component should support disabled state.

Every component should support loading state.

------------------Build enterprise API architecture.

Axios Instance

Request Interceptor

Response Interceptor

Global Error Handler

Unauthorized Handling

Refresh Token Logic

API Service Layer

RTK Query Setup

Error Types

Success Types

Pagination Types

Filter Types

Sorting Types

Environment Configuration

Request Retry

Cancellation

File Upload

File Download

Everything should be centralized.

No duplicate API calls.----------------------
Create enterprise state management.

Redux Toolkit

Authentication Slice

User Slice

Theme Slice

Settings Slice

Notification Slice

Permission Slice

Global Loader

Global Dialog

Global Toast

Keep slices modular.

Avoid unnecessary rerenders.
-------------------------------------
Build complete design system.

Light Theme

Dark Theme

Color Tokens

Typography

Spacing

Border Radius

Shadows

Transitions

Breakpoints

Container Sizes

Sidebar Sizes

Navbar Sizes

Reusable utility classes

CSS variables

Tailwind theme extension

Everything should be centralized.

Changing primary color should update the whole application.
------------------------------------------------

Create a scalable folder structure.

src/
    api/
    app/
    assets/
    components/
    config/
    constants/
    contexts/
    features/
    hooks/
    layouts/
    lib/
    pages/
    providers/
    routes/
    services/
    store/
    styles/
    themes/
    types/
    utils/
    validations/

Each feature should contain

components/
pages/
hooks/
services/
types/
constants/
validators/

No large files.

No duplicated code.

Follow SOLID principles.

Follow Clean Architecture.

Follow feature-first architecture where appropriate.


------------------
Review the entire project.

Remove duplicate code.

Improve performance.

Improve readability.

Optimize imports.

Optimize folder structure.

Improve naming.

Ensure every component is reusable.

Ensure responsive design.

Ensure accessibility.

Ensure scalability.

Ensure maintainability.

Ensure enterprise-level code quality.

The template should be ready to clone for any future portal, requiring only the addition of business-specific modules.



