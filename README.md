#  Nitropack

> Next Generation Web Tooling

## 🚀 Quick Start

1️⃣ Create `api/test.ts`:

```ts [api/test.ts]
export default () => 'Nitro is amazing!'
```

2️⃣ Start development server with HMR using `npx nitropack dev` command:

> Your API is ready at http://localhost:3000/api/test

3️⃣ You can now build your production ready server:

```bash
npx nitropack build
````

4️⃣ Output is in `.output` directory and ready to be deployed on almost any VPS with no dependencies. You can locally try it too:

```bash
node .output/server/index.mjs
```

## 💻 Development

- Clone repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Install dependencies using `yarn install`
- Start playground with `yarn dev` and open http://localhost:3000

## License

Made with 💛 Published under [MIT](./LICENSE).
