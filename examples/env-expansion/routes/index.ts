import { useRuntimeConfig } from "../../../dist/runtime/config";
export default defineEventHandler(() => {
    const config = useRuntimeConfig();
    return `<pre>${
            JSON.stringify(
                config
            )
    }</pre>`;
});
