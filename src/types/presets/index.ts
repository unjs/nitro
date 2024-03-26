import { AWSAmplifyOptions } from "./aws-amplify";
import { AzureOptions } from "./azure";
import { CloudflareOptions } from "./cloudflare";
import { FirebaseOptions } from "./firebase";
import { NetlifyOptions } from "./netlify";
import { VercelOptions } from "./vercel";

export interface PresetOptions {
  awsAmplify: AWSAmplifyOptions;
  azure: AzureOptions;
  cloudflare: CloudflareOptions;
  firebase: FirebaseOptions;
  netlify: NetlifyOptions;
  vercel: VercelOptions;
}
