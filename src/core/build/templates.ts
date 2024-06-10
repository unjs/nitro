import { resolve } from "pathe";
import { Nitro } from "../../types/nitro";
import { writeFile } from "nitropack/kit";

export const generateTemplates = async (nitro: Nitro) => {
  const buildDir = nitro.options.buildDir;
  const templates = nitro.options.templates || [];

  for (const template of templates) {
    const content = await template.getContents({ nitro });

    await writeFile(resolve(buildDir, template.filename), content);

    const aliasPath = "#build/" + template.filename.replace(/\.\w+$/, "");
    nitro.vfs[aliasPath] = content;
  }
};
