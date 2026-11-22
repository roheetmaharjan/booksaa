# Booksaa Business Settings --- MVP Documentation

> **Purpose:** Define the scope, ownership, data rules, reusable
> application logic, and implementation expectations for the centralized
> Booksaa Business Settings module.
>
> **Audience:** Developers, AI coding agents, product designers, and QA.
>
> **Status:** MVP specification. This document describes intended
> behavior; it does not claim that every listed setting already exists
> in the codebase.

------------------------------------------------------------------------

## 1. Product context

Booksaa is a multi-tenant service-booking SaaS. Vendors use Booksaa to
manage their businesses, locations, services, bookings, payments,
customers, and staff.

The Business Settings module provides one central place for vendors to
manage business-level preferences.

The module must integrate with existing Booksaa functionality. It must
not introduce parallel settings systems or duplicate existing database
fields, APIs, payment configuration, notification infrastructure, or
booking rules.

### Primary goals

-   Give each vendor a clear, centralized settings experience.
-   Make regional preferences such as country, currency, and timezone
    configurable.
-   Keep booking, payment, and notification behavior consistent across
    the application.
-   Reuse existing models, APIs, utilities, and UI components wherever
    possible.
-   Keep vendor data isolated and enforce authorization on the server.
-   Make settings easy for developers and AI coding agents to discover
    and reuse.

### Non-goals for the MVP

-   Building a new payment gateway or Stripe integration.
-   Replacing the existing booking engine.
-   Replacing the existing notification/email system.
-   Introducing a new staff permission architecture.
-   Automatically converting historical transactions or existing service
    prices when a vendor changes currency.
-   Rewriting unrelated application modules.

------------------------------------------------------------------------

## 2. Existing application constraints

The implementation must follow the existing Booksaa stack and
conventions:

-   Next.js 15 App Router.
-   JavaScript only --- do not introduce TypeScript.
-   Prisma ORM.
-   PostgreSQL (Neon).
-   Tailwind CSS.
-   shadcn/ui.
-   Sonner for toast notifications.
-   Existing custom authentication and role-based access control.
-   Existing Stripe and payment workflows.

Before coding, inspect the current repository and deployed database. Do
not assume the examples in this document match the current schema.

------------------------------------------------------------------------

## 3. Settings information architecture

The vendor dashboard should provide a centralized Settings entry with
the following sections.

  -----------------------------------------------------------------------
  Section                 Purpose                 MVP scope
  ----------------------- ----------------------- -----------------------
  Business Profile        Business identity and   Implement or reuse
                          contact details         existing profile
                                                  functionality

  Regional Preferences    Country, currency,      Core MVP
                          timezone, date and time 
                          formats                 

  Booking Settings        Booking availability    Reuse existing booking
                          and customer booking    configuration
                          rules                   

  Payment Settings        Accepted payment        Reuse existing payment
                          methods and deposit     configuration
                          preferences             

  Notifications           Booking and payment     Reuse existing
                          notification            notification
                          preferences             infrastructure

  Team & Access           Staff, roles, and       Link to or reuse
                          permissions             existing functionality

  Security & Account      Password and            Link to or reuse
                          account/session         existing functionality
                          controls                
  -----------------------------------------------------------------------

Do not duplicate an existing dashboard page just to make it appear
inside Settings. Where functionality already has a dedicated page, use a
clear link or reuse the existing component if that is consistent with
the current navigation architecture.

### 3.1 Business Profile

Potential fields:

-   Business name.
-   Business logo.
-   Business email.
-   Business phone.
-   Website.
-   Business address.
-   Business description, if already supported.

Reuse existing Vendor and Location data and existing image
upload/storage utilities. Do not create duplicate business identity
fields.

### 3.2 Regional Preferences

The MVP should support these country presets:

  Country         Country code   Suggested currency   Suggested timezone
  --------------- -------------- -------------------- --------------------
  Nepal           `NP`           `NPR`                `Asia/Kathmandu`
  Australia       `AU`           `AUD`                `Australia/Sydney`
  United States   `US`           `USD`                `America/New_York`

These are suggestions/defaults, not hard restrictions. Australia and the
United States each have multiple timezones. Provide a searchable
timezone selector using IANA timezone identifiers rather than limiting
users to the examples above.

Fields:

-   Country code.
-   Default currency.
-   Business timezone.
-   Date format.
-   Time format.

Supported MVP currency choices:

  Currency code   Display name
  --------------- -------------------
  `NPR`           Nepalese Rupee
  `AUD`           Australian Dollar
  `USD`           US Dollar

Supported date format choices:

-   `DD/MM/YYYY`
-   `MM/DD/YYYY`
-   `YYYY-MM-DD`

Supported time format choices:

-   `12h` --- 12-hour clock with AM/PM.
-   `24h` --- 24-hour clock.

#### Regional preference behavior

1.  Selecting a country should suggest its default currency and
    timezone.
2.  Country, currency, and timezone must be independently editable.
3.  Changing the country must not silently overwrite a currency or
    timezone that the vendor previously selected manually.
4.  Store currency using ISO 4217 codes, such as `NPR`, `AUD`, and
    `USD`.
5.  Store timezones using IANA identifiers, such as `Asia/Kathmandu` and
    `Australia/Sydney`.
6.  Date and time formats affect presentation; they must not change the
    underlying stored timestamp.
7.  Use the business or relevant location timezone when interpreting
    booking availability, operating hours, and reminders.
8.  Do not use a fixed UTC offset in place of a timezone identifier.
    This is important for regions that observe daylight saving time.

### 3.3 Booking Settings

Potential settings:

-   Enable or disable online booking.
-   Require manual booking approval.
-   Minimum advance booking notice.
-   Maximum advance booking period.
-   Allow customer cancellations.
-   Allow customer rescheduling.
-   Cancellation deadline or policy, if supported.

Important: inspect the existing booking implementation before adding
fields. There must be one authoritative source for each booking rule. Do
not create a second setting that conflicts with an existing service-,
vendor-, or location-level rule.

### 3.4 Payment Settings

Potential settings:

-   Enable cash payments.
-   Enable online payments.
-   Enable pay-at-business.
-   Enable deposits.
-   Default deposit percentage, if supported.
-   Payment instructions, if supported.

Important:

-   Reuse existing Stripe account setup and payment method
    configuration.
-   Reuse existing payment status, payment type, deposit, and balance
    logic.
-   Do not store secret payment credentials in a general settings JSON
    object.
-   Do not create another payment gateway integration.
-   Do not silently change existing booking payment requirements.

### 3.5 Notification Settings

Potential preferences:

-   New booking notifications.
-   Booking confirmation notifications.
-   Booking cancellation notifications.
-   Booking reminders.
-   Payment confirmation notifications.

Reuse the existing email and notification delivery system. Settings
should control existing notification behavior rather than create a
second notification engine.

### 3.6 Team & Access

Reuse the current team management, staff roles, invitations, and
permission model. Do not create a new role or permission architecture as
part of this work.

### 3.7 Security & Account

Reuse existing authentication and account-management flows for:

-   Password changes.
-   Account information.
-   Session management, if already supported.
-   Account status display.

Never expose sensitive authentication data in the settings UI or general
settings APIs.

------------------------------------------------------------------------

## 4. Data ownership and tenancy

Settings must have explicit ownership. Do not assume every setting
belongs to the Vendor model.

### Ownership guidelines

  -----------------------------------------------------------------------
  Data                    Recommended owner       Notes
  ----------------------- ----------------------- -----------------------
  Business name, logo,    Vendor or existing      Reuse current fields
  business contact        business profile model  
  details                                         

  Business default        Vendor/business-level   One business currency
  currency                settings                for MVP unless
                                                  multi-currency is
                                                  already supported

  Business default        Vendor/business-level   Used for regional
  country                 settings                defaults

  Business default        Vendor/business-level   Default for the
  timezone                settings                business

  Location operating      Location                Location-specific where
  hours and local                                 required
  timezone                                        

  Booking rules           Existing authoritative  Determine current
                          booking configuration   precedence before
                                                  changing

  Payment configuration   Existing payment/vendor Reuse current payment
                          configuration           architecture

  Notification            Existing vendor/user    Follow current
  preferences             notification            notification ownership
                          configuration           

  Personal display        User                    Do not store personal
  preferences                                     preferences as
                                                  vendor-wide settings
  -----------------------------------------------------------------------

### Multi-location considerations

A vendor may have multiple locations. The business timezone can be the
default, but a booking at a specific location may need that location's
timezone.

For scheduling:

1.  Resolve the relevant location for the booking.
2.  Use that location's configured timezone if the existing model
    supports it.
3.  Otherwise, use the vendor's business timezone.
4.  Use a documented fallback if neither is available.
5.  Keep stored timestamps consistent with the existing application
    convention, preferably UTC instants, and convert for display and
    business-time calculations.

Do not add location timezone fields without first auditing the current
Location model and scheduling logic.

------------------------------------------------------------------------

## 5. Database audit requirements

This is an audit-first implementation.

### Inspect the Prisma schema

At minimum, inspect:

-   `prisma/schema.prisma`
-   All relevant migration directories.
-   Vendor model.
-   Location model.
-   User model.
-   Booking and service models.
-   Payment and subscription models.
-   Notification-related models.
-   Staff/team/permission models.

Search for existing fields and enums related to:

-   Country and country code.
-   Currency.
-   Timezone.
-   Date and time formats.
-   Booking rules.
-   Cancellation and rescheduling.
-   Payment methods and deposits.
-   Notification preferences.
-   User preferences.
-   Business profile information.

### Inspect application code

Search for:

-   Existing settings routes and pages.
-   Existing settings APIs and server actions.
-   Existing Prisma query helpers.
-   Currency formatting and currency symbols.
-   Date/time formatting utilities.
-   Timezone conversion utilities.
-   Booking availability and operating-hours logic.
-   Payment preference and deposit logic.
-   Email and notification dispatch logic.
-   Vendor authentication and authorization helpers.
-   Existing reusable form and settings components.

### Inspect deployed database structure

Do not assume the Prisma schema and deployed databases are identical.

Where authorized read-only access is available, compare the Prisma
schema with staging and production database structures. Identify schema
drift and missing columns without modifying either database during the
audit.

Do not print, expose, or commit database credentials or secrets.

### Audit report

Before implementation, produce a concise report with:

1.  Existing models and fields that represent settings.
2.  Existing APIs, server actions, and utilities that can be reused.
3.  Existing UI components and pages that can be reused.
4.  Differences between Prisma schema and deployed database, if
    inspected.
5.  Missing settings and behavior.
6.  Proposed implementation mapping.
7.  Any necessary schema changes, with justification.

Classify each setting as:

-   **Existing:** reuse without schema changes.
-   **Partial:** extend the current implementation.
-   **Missing:** implement only if needed for MVP.
-   **Out of scope:** link to existing functionality or defer.

------------------------------------------------------------------------

## 6. Reusable application logic

The objective is to make settings available consistently throughout
Booksaa.

Before creating helpers, search for equivalent existing functions and
extend or reuse them.

Potential logical responsibilities:

  --------------------------------------------------------------------------------
  Responsibility                      Suggested function name
  ----------------------------------- --------------------------------------------
  Retrieve vendor settings            `getVendorSettings(vendorId)`

  Update vendor settings              `updateVendorSettings(vendorId, data)`

  Resolve regional preferences        `getBusinessRegionalPreferences(vendorId)`

  Resolve effective currency          `getVendorCurrency(vendorId)`

  Resolve effective timezone          `getVendorTimezone(vendorId, locationId)`

  Format money consistently           Existing currency formatter, or a shared
                                      replacement

  Format date/time consistently       Existing date/time formatter, or a shared
                                      replacement
  --------------------------------------------------------------------------------

These are conceptual examples, not mandatory function names. Follow the
repository's existing naming, folder structure, and data-access
conventions.

### Reuse requirements

-   Components must not independently hardcode a vendor's currency.
-   API routes must not trust currency or timezone values supplied by
    the browser when authoritative business settings are available.
-   Booking and availability logic must use the same timezone resolution
    rules.
-   Payment calculations must use the existing payment implementation
    and currency rules.
-   Notification scheduling must use the correct business/location
    timezone.
-   Settings retrieval should avoid unnecessary repeated database
    queries.
-   Do not introduce a generic JSON settings store if the project
    already has structured fields or models that are more appropriate.

------------------------------------------------------------------------

## 7. UI and interaction requirements

Build a responsive settings experience consistent with the existing
Booksaa dashboard.

### Layout

-   Desktop: settings navigation on the left and the selected settings
    panel on the right.
-   Mobile: compact responsive navigation, such as a selector or stacked
    navigation.
-   Each section should have a clear title and short explanatory
    description.
-   Use existing shadcn/ui components and Lucide icons.
-   Reuse existing dashboard layout, typography, spacing, and color
    tokens.

### Form behavior

-   Show current saved values when a section loads.
-   Validate values on both client and server.
-   Provide clear save feedback using Sonner.
-   Prevent unauthorized updates.
-   Avoid accidental loss of unsaved changes.
-   Show loading and error states.
-   Do not show a success message before the server confirms the update.
-   Avoid unnecessary confirmation dialogs.

### Suggested reusable UI components

Only create these if equivalent components do not already exist:

-   `SettingsLayout`
-   `SettingsSidebar`
-   `SettingsSection`
-   `SettingsHeader`
-   `SettingsForm`
-   `SettingsField`
-   `SettingsSaveButton`

------------------------------------------------------------------------

## 8. Security and authorization

-   All settings reads and writes must be scoped to the authenticated
    vendor.
-   Never trust a client-provided `vendorId` without validating access.
-   Use existing authentication/session utilities and role checks.
-   Preserve existing ADMIN, VENDOR, and CUSTOMER authorization
    behavior.
-   Customers must not access vendor settings.
-   A vendor must not read or update another vendor's settings.
-   Validate all submitted values on the server.
-   Whitelist accepted fields; do not blindly pass request bodies into
    Prisma updates.
-   Do not expose Stripe secret keys or other credentials in settings
    responses.
-   Keep sensitive payment credentials in their existing secure storage
    and access flow.

------------------------------------------------------------------------

## 9. Currency and historical data safety

Changing a vendor's default currency is a display/configuration change
for future operations. It must not silently rewrite financial history.

Before implementation, inspect how currency is currently represented in:

-   Service prices.
-   Booking price snapshots.
-   Deposits.
-   Balance payments.
-   Payment records.
-   Refunds.
-   Invoices or receipts, if supported.

Rules:

1.  Do not automatically convert existing service prices.
2.  Do not change the currency of completed or historical bookings.
3.  Do not rewrite payment, refund, or transaction records.
4.  Preserve the currency associated with existing financial records.
5.  If the current system does not snapshot currency on a transaction,
    document the risk and propose a safe approach before changing
    behavior.
6.  If changing the business currency could make existing prices
    ambiguous, show a warning and require an intentional confirmation.
7.  Do not implement exchange-rate conversion as part of this MVP unless
    it is already an established product requirement.

------------------------------------------------------------------------

## 10. Timezone and scheduling safety

Timezone handling is especially important for booking availability and
reminders.

Rules:

-   Store timezone identifiers, not only UTC offsets.
-   Use the relevant business/location timezone to interpret local
    operating hours.
-   Convert instants for display without changing the stored instant.
-   Account for daylight saving time in applicable regions.
-   Ensure booking availability, minimum notice, maximum advance
    booking, cancellation deadlines, and reminders use consistent
    timezone rules.
-   Do not parse ambiguous date strings using the server's default
    timezone.
-   Test dates around daylight-saving transitions for supported regions.
-   Do not change existing booking timestamps as part of a settings
    update.

------------------------------------------------------------------------

## 11. Database change policy

Only introduce schema changes when the audit proves they are necessary.

If changes are needed:

-   Explain why existing fields/models cannot support the requirement.
-   Prefer minimal, backward-compatible changes.
-   Preserve existing data.
-   Avoid duplicate settings records.
-   Add appropriate uniqueness constraints only after checking existing
    data and relationships.
-   Follow the repository's existing Prisma migration workflow.
-   Review the generated migration SQL before applying it.
-   Do not reset databases.
-   Do not use `prisma migrate reset`.
-   Do not use destructive SQL to resolve drift without an explicit,
    reviewed migration plan.
-   Do not apply schema changes to production as part of an unreviewed
    implementation.

If a dedicated VendorSettings model is justified, it should have a clear
one-to-one relationship with Vendor and appropriate uniqueness
constraints. This is a possible design, not a requirement to create that
model.

------------------------------------------------------------------------

## 12. Acceptance criteria

### Settings experience

-   [ ] A centralized, responsive Business Settings entry is available
    in the vendor dashboard.
-   [ ] Settings sections are clearly organized.
-   [ ] Existing profile and management functionality is reused where
    appropriate.
-   [ ] Current saved values load correctly.
-   [ ] Updates persist after refresh.
-   [ ] Loading, validation, success, and error states are handled.

### Regional preferences

-   [ ] Country supports Nepal, Australia, and the United States.
-   [ ] Currency supports NPR, AUD, and USD.
-   [ ] Timezone uses searchable IANA timezone identifiers.
-   [ ] Country selection suggests appropriate regional defaults.
-   [ ] Currency and timezone can be changed independently.
-   [ ] Date and time formats are configurable.
-   [ ] The selected timezone is used consistently by relevant
    scheduling logic.

### Existing integrations

-   [ ] Booking settings reuse existing booking rules.
-   [ ] Payment settings reuse existing payment and Stripe logic.
-   [ ] Notification settings reuse existing notification
    infrastructure.
-   [ ] Team and account settings reuse existing functionality.
-   [ ] No duplicate business logic is introduced.

### Security and data integrity

-   [ ] Vendor data isolation is enforced server-side.
-   [ ] Unauthorized roles cannot access or modify settings.
-   [ ] Client-submitted fields are validated and whitelisted.
-   [ ] Existing bookings and payment records remain unchanged.
-   [ ] Historical transaction currencies and amounts are preserved.
-   [ ] No unnecessary database migrations are introduced.
-   [ ] No unrelated modules are refactored.

------------------------------------------------------------------------

## 13. Testing checklist

Test at minimum:

1.  Vendor A can read and update their own settings.
2.  Vendor A cannot read or update Vendor B's settings.
3.  A CUSTOMER cannot access vendor settings.
4.  An authorized ADMIN behaves according to existing admin permissions.
5.  Country selection suggests the correct regional defaults.
6.  Manually selected currency and timezone are not unexpectedly
    overwritten.
7.  Settings persist after refresh and a new session.
8.  Currency formatting is consistent in relevant business-facing
    screens.
9.  Existing booking prices and payment records are unchanged after a
    currency change.
10. Booking availability uses the appropriate timezone.
11. Locations with different timezones are handled correctly if
    supported.
12. Daylight-saving transitions are handled correctly for relevant
    timezones.
13. Existing Stripe payments, cash payments, deposits, and balances
    continue to work.
14. Existing email and notification workflows continue to work.
15. Invalid or unauthorized update requests are rejected.
16. No duplicate settings records are created.

------------------------------------------------------------------------

## 14. Implementation workflow for AI coding agents

AI coding agents must follow this sequence.

### Phase 1 --- Audit only

-   Inspect the schema, migrations, application code, APIs, utilities,
    and existing UI.
-   Inspect staging/production database structure using read-only access
    where available.
-   Produce the audit report.
-   Map each requested setting to its current source of truth.
-   Identify missing functionality and necessary schema changes.
-   Do not modify files or databases during this phase.

### Phase 2 --- Plan

-   Present the proposed implementation.
-   Identify files that need modification or creation.
-   Identify existing functions/components to reuse.
-   Explain any proposed schema changes.
-   Identify risks to booking, payment, and notification workflows.

### Phase 3 --- Implement

-   Implement only the missing functionality.
-   Reuse existing models and utilities.
-   Keep changes scoped to the settings feature.
-   Apply server-side authorization and validation.
-   Keep the code in JavaScript.
-   Avoid unrelated refactoring.

### Phase 4 --- Verify

-   Run relevant linting and tests.
-   Verify the acceptance criteria.
-   Review migration SQL if a migration was necessary.
-   Confirm existing booking, payment, and notification flows remain
    compatible.
-   Report any tests that could not be run.

### Phase 5 --- Final implementation report

Provide:

1.  Existing functionality reused.
2.  New UI components created.
3.  Existing APIs/utilities reused.
4.  New APIs or utilities created.
5.  Database changes and their justification.
6.  Migration files created, if any.
7.  Files modified.
8.  Tests performed and results.
9.  Outstanding issues and follow-up work.

**Critical instruction:** Never assume a setting is missing simply
because it is not visible in the current UI. Search the database schema
and application logic first. Reuse the existing source of truth wherever
possible.

------------------------------------------------------------------------

## 15. Product decisions to preserve

These decisions should remain consistent across future work unless
product requirements explicitly change:

-   Settings are primarily business/vendor-scoped.
-   Personal user preferences belong to the user.
-   Country, currency, and timezone are independently configurable.
-   Country presets are suggestions, not restrictions.
-   Currency uses ISO 4217 codes.
-   Timezone uses IANA identifiers.
-   Location-specific timezone behavior takes precedence where the
    product supports it.
-   Existing booking and payment logic remains authoritative.
-   Historical financial records must not be silently converted or
    rewritten.
-   Existing models, APIs, utilities, and components must be audited
    before creating replacements.
-   Database migrations must be minimal, reviewed, and
    backward-compatible.

