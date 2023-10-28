#!/bin/bash

# Temporary forked from nuxt/nuxt

set -xe

# Restore all git changes
git restore -s@ -SW  -- .

# Bump acording to changelog
pnpm changelogen --bump

# Bump versions to nightly
pnpm jiti ./scripts/bump-nightly

# Resolve lockfile
# pnpm install

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
