// @ts-expect-error Deno global
Object.assign(process.env, Deno.env.toObject());
