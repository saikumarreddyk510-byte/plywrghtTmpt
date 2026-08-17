# testdata/

This folder stores all input data files used by Playwright tests.

## Structure

```
testdata/
  ├── users.json          ← Login credentials, user registration data
  ├── products.json       ← Product names, quantities for shopping tests
  ├── forms.json          ← Form input data (name, email, phone, etc.)
  └── README.md
```

## Usage in tests

```typescript
import userData from '../testdata/users.json';

// use in test
await page.fill('#email', userData.validUser.email);
```
