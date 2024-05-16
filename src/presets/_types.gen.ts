// Auto-generated using scripts/presets.ts

import { PresetOptions as AwsAmplifyOptions } from "./aws-amplify/preset";
import { PresetOptions as AzureOptions } from "./azure/preset";
import { PresetOptions as CloudflareOptions } from "./cloudflare/preset";
import { PresetOptions as FirebaseOptions } from "./firebase/preset";
import { PresetOptions as NetlifyOptions } from "./netlify/preset";
import { PresetOptions as VercelOptions } from "./vercel/preset";

export interface PresetOptions {
  awsAmplify: AwsAmplifyOptions;
  azure: AzureOptions;
  cloudflare: CloudflareOptions;
  firebase: FirebaseOptions;
  netlify: NetlifyOptions;
  vercel: VercelOptions;
}

export type PresetName = "alwaysdata" | "aws-amplify" | "aws-lambda" | "aws-lambda-streaming" | "azure" | "azure-functions" | "base-worker" | "bun" | "cleavr" | "cli" | "cloudflare" | "cloudflare-module" | "cloudflare-pages" | "cloudflare-pages-static" | "cloudflare-worker" | "deno" | "deno-deploy" | "deno-server" | "digital-ocean" | "edgio" | "firebase" | "flight-control" | "github-pages" | "gitlab-pages" | "heroku" | "iis" | "iis-handler" | "iis-node" | "koyeb" | "netlify" | "netlify-builder" | "netlify-edge" | "netlify-legacy" | "netlify-static" | "nitro-dev" | "nitro-prerender" | "node" | "node-cluster" | "node-listener" | "node-server" | "platform-sh" | "render-com" | "service-worker" | "static" | "stormkit" | "vercel" | "vercel-edge" | "vercel-static" | "winterjs" | "zeabur" | "zeabur-static";

export type PresetNameInput = "alwaysdata" | "alwaysdata" | "alwaysdata" | "awsAmplify" | "aws-amplify" | "aws_amplify" | "awsLambda" | "aws-lambda" | "aws_lambda" | "awsLambdaStreaming" | "aws-lambda-streaming" | "aws_lambda_streaming" | "azure" | "azure" | "azure" | "azureFunctions" | "azure-functions" | "azure_functions" | "baseWorker" | "base-worker" | "base_worker" | "bun" | "bun" | "bun" | "cleavr" | "cleavr" | "cleavr" | "cli" | "cli" | "cli" | "cloudflare" | "cloudflare" | "cloudflare" | "cloudflareModule" | "cloudflare-module" | "cloudflare_module" | "cloudflarePages" | "cloudflare-pages" | "cloudflare_pages" | "cloudflarePagesStatic" | "cloudflare-pages-static" | "cloudflare_pages_static" | "cloudflareWorker" | "cloudflare-worker" | "cloudflare_worker" | "deno" | "deno" | "deno" | "denoDeploy" | "deno-deploy" | "deno_deploy" | "denoServer" | "deno-server" | "deno_server" | "digitalOcean" | "digital-ocean" | "digital_ocean" | "edgio" | "edgio" | "edgio" | "firebase" | "firebase" | "firebase" | "flightControl" | "flight-control" | "flight_control" | "githubPages" | "github-pages" | "github_pages" | "gitlabPages" | "gitlab-pages" | "gitlab_pages" | "heroku" | "heroku" | "heroku" | "iis" | "iis" | "iis" | "iisHandler" | "iis-handler" | "iis_handler" | "iisNode" | "iis-node" | "iis_node" | "koyeb" | "koyeb" | "koyeb" | "netlify" | "netlify" | "netlify" | "netlifyBuilder" | "netlify-builder" | "netlify_builder" | "netlifyEdge" | "netlify-edge" | "netlify_edge" | "netlifyLegacy" | "netlify-legacy" | "netlify_legacy" | "netlifyStatic" | "netlify-static" | "netlify_static" | "nitroDev" | "nitro-dev" | "nitro_dev" | "nitroPrerender" | "nitro-prerender" | "nitro_prerender" | "node" | "node" | "node" | "nodeCluster" | "node-cluster" | "node_cluster" | "nodeListener" | "node-listener" | "node_listener" | "nodeServer" | "node-server" | "node_server" | "platformSh" | "platform-sh" | "platform_sh" | "renderCom" | "render-com" | "render_com" | "serviceWorker" | "service-worker" | "service_worker" | "static" | "static" | "static" | "stormkit" | "stormkit" | "stormkit" | "vercel" | "vercel" | "vercel" | "vercelEdge" | "vercel-edge" | "vercel_edge" | "vercelStatic" | "vercel-static" | "vercel_static" | "winterjs" | "winterjs" | "winterjs" | "zeabur" | "zeabur" | "zeabur" | "zeaburStatic" | "zeabur-static" | "zeabur_static" | (string & {});
