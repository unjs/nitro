# Netlify

**Preset Name:** `netlify`

Nitro will auto-detect that you are in a [Netlify](https://www.netlify.com) environment and build the correct version of your server. For new sites, Netlify will detect that you are using Nitro and set the publish directory to `dist` and build command to `npm run build`. If you are upgrading an existing site you should check these and update them if needed.

Normally, the deployment to Netlify does not require any configuration.
However, if you want to add custom redirects, you can do so by adding a [`_redirects`](https://docs.netlify.com/routing/redirects/#syntax-for-the-redirects-file) file.

For deployment, just push to your git repository [as you would normally do for Netlify](https://docs.netlify.com/configure-builds/get-started/).

