import { AWSAmplifyOptions } from "./aws-amplify";
import { AzureOptions } from "./azure";
import { CloudflareOptions } from "./cloudflare";
import { FirebaseOptions } from "./firebase";
import { VercelOptions } from "./vercel";

export interface PresetOptions {
  azure: AzureOptions;
  cloudflare: CloudflareOptions;
  firebase: FirebaseOptions;
  vercel: VercelOptions;
  awsAmplify: AWSAmplifyOptions;
}
