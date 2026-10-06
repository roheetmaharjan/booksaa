# Service Booking SaaS – Master Prompt

## Role
Act as a **Senior SaaS Product Architect, UX Designer, and Full-Stack Engineer**.

I want to design and build a **multi-tenant Service Booking SaaS application** similar to platforms like **Fresha, Mindbody, or Booksy**, but customizable for different service-based businesses.

---
## Tech Stack
- Frontend: **Next.js (App Router) + shadcn/ui + Tailwind CSS**
- Backend: **Node.js**
- Authentication: **JWT (access & refresh tokens)**
- Database: **PostgreSQL**
- ORM: **Prisma**
- Payments: **PayPal Subscriptions**
- Real-time: **WebSockets**
- Architecture: **Multi-tenant SaaS**

## Core User Roles & Permissions

### 1. Super Admin
- Manages all businesses on the platform
- Manages business verification and status:
  - Trial
  - Active
  - Expired
  - Suspended
- Manages pricing plans and subscriptions
- Views platform-wide analytics:
  - Revenue
  - Bookings
  - Active trials
  - Churn
- Manages businesses and their locations
- Manages global settings:
  - Service categories
  - System configurations
  - Manage Roles and Permissions (RBAC)

---

### 2. Business (Tenant)
- Signs up via the marketing website
- Automatically receives a **15-day free trial**
- Can purchase a subscription plan after trial
- Subscription expires if not renewed
- Can manage:
  - Business profile
  - Multiple locations
  - Services (price, duration, buffer time)
  - Staff members and roles
  - Business hours and holidays
- Can:
  - View and manage bookings
  - Manage customers
  - Track payments and invoices
  - View business analytics and reports
- Can enable or disable online bookings

---

### 3. Customer
- Browses services from the marketing website
- Searches services by:
  - Category
  - Location
  - Date and time availability
- Books services for a specific time slot
- Receives:
  - Booking confirmation
  - Email/SMS reminders
- Can:
  - Reschedule bookings
  - Cancel bookings
- Supports:
  - Guest checkout
  - Registered customer accounts

---

## Key Product Requirements

- Multi-tenant architecture with strict data isolation
- Subscription and billing system:
  - Trial → Paid → Expired
- Real-time service availability & slot management
- Time-zone support
- Role-Based Access Control (RBAC)
- Dashboards for each user role
- Mobile-first experience for customers
- Secure, scalable SaaS architecture

---

## Booking & Availability Logic

- Services have:
  - Duration
  - Price
  - Staff assignment
- Time slots are generated based on:
  - Business hours
  - Staff availability
  - Existing bookings
  - Buffer time between bookings
- Prevent double bookings
- Handle cancellations and rescheduling gracefully

---

## Subscription & Trial Logic

- Trial starts at business signup
- Trial expires after 15 days
- Grace period after trial expiry (optional)
- Disable booking features if subscription expires
- Notify businesses before expiration
- Super Admin can manually extend trials

---

## Expected Deliverables

Please provide:

1. System architecture overview  
   - Frontend
   - Backend
   - Database
   - Authentication
   - Payment system

2. User flows:
   - Business onboarding
   - Trial to paid conversion
   - Customer booking journey

3. High-level database schema
   - Key tables
   - Relationships

4. Feature list per role

5. Booking and availability logic (with edge cases)

6. Subscription and billing flow

7. Dashboard widgets for:
   - Super Admin
   - Business
   - Customer

8. Recommended tech stack for SaaS scalability

9. MVP vs Phase-2 roadmap

---

## Guidelines

- Follow real-world SaaS best practices
- Assume multi-location businesses
- Explain decisions clearly
- Use text-based diagrams where useful
- Make reasonable assumptions where details are missing
