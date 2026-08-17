---
name: rsa-domain
description: Domain knowledge for rahulshettyacademy.com practice apps — user flows, business rules, UI selectors, and app overview. Read this before creating scenarios, strategies, or tests.
user-invocable: false
---

# RSA Domain Knowledge

## App Overview
**rahulshettyacademy.com** practice sites are training apps for QA automation engineers.

### Apps in Scope
| App | URL | Purpose |
|-----|-----|---------|
| Login Practise | `/loginpagePractise/` | Login form with role selector, terms checkbox |
| Client App | `/client/` | Full e-commerce: register, login, shop, cart, orders |
| Angular Practice | `/angularpractice/shop` | Product listing, cart, checkout |

---

## Data Models

### User (Client App — `/client/`)
```json
{
  "firstName": "string",
  "lastName": "string",
  "email": "string (unique)",
  "phone": "string (10 digits)",
  "occupation": "Doctor | Student | Engineer | Scientist",
  "gender": "Male | Female",
  "password": "string (min 8 chars)",
  "age18Plus": "boolean (must be checked)"
}
```

### User (Login Practise — `/loginpagePractise/`)
```json
{
  "username": "rahulshettyacademy",
  "password": "Learning@830$3mK2",
  "role": "Admin | User",
  "terms": "must be accepted"
}
```

### Product (Angular Practice Shop)
```json
{
  "name": "iphone X | Samsung Note 8 | Nokia Edge | Blackberry",
  "price": "$24.99",
  "action": "Add to Cart"
}
```

---

## User Flows

### Flow 1: Register (Client App)
1. Navigate to `/client/#/auth/register`
2. Fill: First Name, Last Name, Email, Phone
3. Select Occupation (dropdown)
4. Select Gender (radio)
5. Fill Password + Confirm Password
6. Check "I am 18 year or Older"
7. Click Register → "Account Created Successfully" message

### Flow 2: Login (Client App)
1. Navigate to `/client/#/auth/login`
2. Fill Email + Password
3. Click Login → redirect to `/client/#/dashboard/dash`

### Flow 3: Login Practise
1. Navigate to `/loginpagePractise/`
2. Fill Username + Password
3. Select "User" radio (not Admin)
4. Check "I Agree to terms and conditions"
5. Click Sign In → redirect to `/angularpractice/shop`

### Flow 4: Add Product to Cart
1. Login via Flow 3
2. Find product card by name (`.card h4`)
3. Click "Add" button on matching card
4. Click "Checkout" link in nav
5. Verify product appears in cart table (`td:has-text('product name')`)

---

## Business Rules

### Registration Rules
- Email must be unique — duplicate email = error
- All fields mandatory — empty submit shows validation
- Password and Confirm Password must match
- Age checkbox must be checked to enable Register button
- Occupation dropdown default = disabled "Choose your occupation"

### Login Rules (Client App)
- Wrong credentials = error toast message
- After successful login = redirected to dashboard
- Dashboard shows products with Add To Cart buttons

### Login Rules (Login Practise)
- Admin role = different landing page than User role
- Terms must be checked — Sign In disabled without it
- Credentials shown on page: username = `rahulshettyacademy`, password = `Learning@830$3mK2`

### Cart Rules (Angular Practice)
- Each "Add" click adds 1 unit
- Checkout link shows count: `Checkout (N)`
- Cart page URL: `/angularpractice/shop` (same page, cart section reveals)
- Cart table: columns = Product, Quantity, Price, Total, Remove

---

## Test Data Location
All credentials and test inputs: `playwright/testdata/users.json`

```json
{
  "loginPagePractise": {
    "username": "rahulshettyacademy",
    "password": "Learning@830$3mK2",
    "role": "User",
    "product": "iphone X"
  },
  "validUser": { "firstName": "Sai", "lastName": "Kumar", ... },
  "loginUser": { "email": "saikumar@test.com", "password": "Test@1234" }
}
```
