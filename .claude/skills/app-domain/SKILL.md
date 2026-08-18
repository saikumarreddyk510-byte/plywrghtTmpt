---
name: app-domain
description: Domain knowledge for the application under test — app overview, user flows, business rules, data models, and UI selectors. Read this before creating scenarios, strategies, or tests.
user-invocable: false
---

# App Domain Knowledge

## App Overview
**rahulshettyacademy.com/client** — "Ecom" — a practice e-commerce app for QA
automation training. Users register, log in, browse products on a dashboard,
add to cart, and place orders. Angular SPA (hash routing, `#/...`).

### Areas in Scope
| Area | Route | Purpose |
|------|-------|---------|
| Login | `/client/#/auth/login` | Email + password sign-in |
| Register | `/client/#/auth/register` | New account creation |
| Dashboard | `/client/#/dashboard/dash` | Product browsing, add to cart |

---

## Data Models

```json
{
  "user": {
    "firstName": "string",
    "lastName": "string",
    "email": "string (unique)",
    "phone": "string (10 digits)",
    "occupation": "Doctor | Student | Engineer | Scientist",
    "gender": "Male | Female",
    "password": "string (min 8 chars)",
    "age18Plus": "boolean (must be checked to enable Register)"
  }
}
```

---

## User Flows

### Flow 1: Login
1. Navigate to `/client/#/auth/login`
2. Fill Email (`#userEmail`) + Password (`#userPassword`)
3. Click the submit input (`#login`)
4. **Valid credentials** → redirected to `/client/#/dashboard/dash`
5. **Invalid credentials** → stays on `/client/#/auth/login`, a `.toast-message`
   reading "Incorrect email or password." appears

Verified live via headless Playwright on 2026-08-18: `#userEmail`/`#userPassword`/`#login`
are real, current element IDs; the toast text is exact (leading/trailing space
included, matches the live app).

### Flow 2: Register
1. Navigate to `/client/#/auth/register`
2. Fill: First Name, Last Name, Email, Phone
3. Select Occupation (dropdown — default disabled option "Choose your occupation")
4. Select Gender (radio)
5. Fill Password + Confirm Password
6. Check "I am 18 year or Older"
7. Click Register → "Account Created Successfully" message

---

## Business Rules

### Login
- Wrong credentials → toast error, no navigation away from the login page
- Correct credentials → redirect to dashboard
- Dashboard shows products with Add To Cart buttons

### Registration
- Email must be unique — duplicate email = error
- All fields mandatory — empty submit shows validation
- Password and Confirm Password must match
- Age checkbox must be checked to enable the Register button

---

## Test Data Location
`playwright/testdata/users.json` — `loginUser` holds a real, working account on
this app (verified live): `saikumar@test.com` / `Test@1234` → successful login.
