import { defineNitroPreset } from "../preset";

export const alwaysdata = defineNitroPreset({
  extends: "node-server",
  commands : {
    deploy: "rsync -rRt --info=progress2 ./ [account]@ssh-[account].alwaysdata.net:www/my-app"
  }
});