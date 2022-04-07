# Getting Started

::: warning WARNING
🏀 [Online playground](https://stackblitz.com/github/unjs/nitro/tree/main/examples/hello-world) on StackBlitz
:::

0️⃣ Create an empty directory `nitro-app`

```sh
mkdir nitro-app
cd nitro-app
```

1️⃣ Create `routes/index.ts`:

```ts [routes/index.ts]
export default () => 'nitro is amazing!'
```

2️⃣ Start development server:

```sh
npx nitropack dev
```

🪄 Your API is ready at http://localhost:3000/

**🤓 [TIP]** Check `.nitro/dev/index.mjs` if want to know what is happening

3️⃣ You can now build your production-ready server:

```bash
npx nitropack build
````

4️⃣ Output is in the `.output` directory and ready to be deployed on almost any VPS with no dependencies. You can locally try it too:

```bash
node .output/server/index.mjs
```

You can add `nitropack` using your package manager now:

```bash
# npm
npm i -D nitropack

# yarn
yarn add nitropack
```
