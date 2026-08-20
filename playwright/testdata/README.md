# testdata/

This folder stores all input data files used by Playwright tests.

**Stores, does not generate.** Fixed rows a spec reads by key live here.
Values computed at runtime — realistic names, boundary lengths, adversarial
payloads — come from `playwright/support/data/dataFactory.ts` instead, so one
change to a payload list updates every spec that loops over it. Same word,
different jobs: that is why the two folders no longer share a name.

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
