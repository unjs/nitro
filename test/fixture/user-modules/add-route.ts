import { resolvePath } from "mlly"
import { dirname } from "pathe"
import { NitroModule } from "nitropack"

export default <NitroModule>{
    name: 'nitro-module',
    async setup(nitro) {
        nitro.options.plugins.push(await resolvePath('./runtime/plugin.ts', { url: dirname(import.meta.url) }))
    }
} 