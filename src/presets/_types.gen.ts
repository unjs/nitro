// Auto-generated using gen-presets script

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

export type PresetName = "alwaysdata" | "aws-amplify" | "aws-lambda" | "aws-lambda-streaming" | "azure" | "azure-functions" | "azure-functions-streaming" | "azure-swa" | "base-worker" | "bun" | "cleavr" | "cli" | "cloudflare" | "cloudflare-module" | "cloudflare-pages" | "cloudflare-pages-static" | "cloudflare-worker" | "deno" | "deno-deploy" | "deno-server" | "digital-ocean" | "edgio" | "firebase" | "flight-control" | "github-pages" | "gitlab-pages" | "heroku" | "iis" | "iis-handler" | "iis-node" | "koyeb" | "layer0" | "netlify" | "netlify-builder" | "netlify-edge" | "netlify-legacy" | "netlify-static" | "nitro-dev" | "nitro-prerender" | "node" | "node-cluster" | "node-listener" | "node-server" | "platform-sh" | "render-com" | "service-worker" | "static" | "stormkit" | "vercel" | "vercel-edge" | "vercel-static" | "winterjs" | "zeabur" | "zeabur-static";

export type PresetNameInput = "alwaysdata" | "aws-amplify" | "awsAmplify" | "aws_amplify" | "aws-lambda" | "awsLambda" | "aws_lambda" | "aws-lambda-streaming" | "awsLambdaStreaming" | "aws_lambda_streaming" | "azure" | "azure-functions" | "azureFunctions" | "azure_functions" | "azure-functions-streaming" | "azureFunctionsStreaming" | "azure_functions_streaming" | "azure-swa" | "azureSwa" | "azure_swa" | "base-worker" | "baseWorker" | "base_worker" | "bun" | "cleavr" | "cli" | "cloudflare" | "cloudflare-module" | "cloudflareModule" | "cloudflare_module" | "cloudflare-pages" | "cloudflarePages" | "cloudflare_pages" | "cloudflare-pages-static" | "cloudflarePagesStatic" | "cloudflare_pages_static" | "cloudflare-worker" | "cloudflareWorker" | "cloudflare_worker" | "deno" | "deno-deploy" | "denoDeploy" | "deno_deploy" | "deno-server" | "denoServer" | "deno_server" | "digital-ocean" | "digitalOcean" | "digital_ocean" | "edgio" | "firebase" | "flight-control" | "flightControl" | "flight_control" | "github-pages" | "githubPages" | "github_pages" | "gitlab-pages" | "gitlabPages" | "gitlab_pages" | "heroku" | "iis" | "iis-handler" | "iisHandler" | "iis_handler" | "iis-node" | "iisNode" | "iis_node" | "koyeb" | "layer0" | "netlify" | "netlify-builder" | "netlifyBuilder" | "netlify_builder" | "netlify-edge" | "netlifyEdge" | "netlify_edge" | "netlify-legacy" | "netlifyLegacy" | "netlify_legacy" | "netlify-static" | "netlifyStatic" | "netlify_static" | "nitro-dev" | "nitroDev" | "nitro_dev" | "nitro-prerender" | "nitroPrerender" | "nitro_prerender" | "node" | "node-cluster" | "nodeCluster" | "node_cluster" | "node-listener" | "nodeListener" | "node_listener" | "node-server" | "nodeServer" | "node_server" | "platform-sh" | "platformSh" | "platform_sh" | "render-com" | "renderCom" | "render_com" | "service-worker" | "serviceWorker" | "service_worker" | "static" | "stormkit" | "vercel" | "vercel-edge" | "vercelEdge" | "vercel_edge" | "vercel-static" | "vercelStatic" | "vercel_static" | "winterjs" | "zeabur" | "zeabur-static" | "zeaburStatic" | "zeabur_static" | (string & {});
