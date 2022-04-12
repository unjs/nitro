#!/bin/bash

# Temporary forked from nuxt/framework

set -xe

# Restore all git changes
git restore -s@ -SW  -- .

# Bump versions to edge
pnpm jiti ./scripts/bump-edge

# Resolve lockfile
YARN_ENABLE_IMMUTABLE_INSTALLS=false pnpm install

# Update token
if [[ ! -z ${NODE_AUTH_TOKEN} ]] ; then
  echo "//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}" >> ~/.npmrc
  echo "registry=https://registry.npmjs.org/" >> ~/.npmrc
  echo "always-auth=true" >> ~/.npmrc
  echo "npmAuthToken: ${NODE_AUTH_TOKEN}" >> ~/.npmrc.yml
  npm whoami
fi

# Release packages
echo "Publishing package..."
npm publish --access public --tolerate-republish
