# CodeSphere

Deploy Nitro apps to [CodeSphere](https://codesphere.com/).

**Preset:** `codesphere` ([switch to this preset](/deploy/#changing-the-deployment-preset))

## Setup

1. Push your code to your git repository (GitHub, GitLab, Bitbucket).
2. [Import your project](https://codesphere.com/ide/menu/workspaces) into CodeSphere.
3. Configure your CI/CD pipeline to deploy your application.


## Deployment using CI/CD

Here is an example CI Configuration to deploy your site to CodeSphere using the `codesphere` preset:

```yaml [ci.yml]
prepare:
  steps:
    - name: install deps
      command: npm install
    - name: build
      command: npx nuxi generate
test:
  steps: []
run:
  steps:
    - name: deploy
      command: npx serve ./output/public
```
