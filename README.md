## A minimal testing library for Node.js

### Installation

```bash
# npm
$ npm install @sunney/testing

# yarn
$ yarn add @sunney/testing

# pnpm
$ pnpm add @sunney/testing
```

### Usage

```typescript
import { expect, run, test } from "@sunney/testing";

test("math", (it) => {
  it("adds 1 to 1", async () => {
    expect(1 + 1).toBe(2);
  });
});

// synchroneous test
test("do some requests", (it) => {
  const client = new SomeClient();

  it("authenticates", async () => {
    await client.auth();
  });

  it("gets a list of users", async () => {
    const users = await client.getUsers();
    expect(users.length).toBe(3);
  });
}).sync();
```
