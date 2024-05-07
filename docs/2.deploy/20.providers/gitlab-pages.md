# GitLab Pages

> Deploy Nitro apps to GitLab Pages.

**Preset:** `gitlab_pages`

:read-more{title="GitLab Pages" to="https://pages.github.com/"}

## Setup

Follow the steps to [create a GitLab Pages site](https://docs.gitlab.com/ee/user/project/pages/#getting-started).

## Deployment

1. Here is an example GitLab Pages workflow to deploy your site to GitLab Pages:

```yaml [.gitlab-ci.yml]
# The Docker image that will be used to build your app
image: node:lts
# Functions that should be executed before the build script is run
before_script:
  - npm install
pages:
  cache:
    paths:
      # Directories that are cached between builds
      - node_modules/
  variables:
    NITRO_PRESET: gitlab_pages
  script:
    # Specify the steps involved to build your app here
    - npm run build
  artifacts:
    paths:
      # The directory that contains the built files to be published
      - .output/public
  # The directory that contains the built files to be published
  publish: .output/public
  rules:
    # This ensures that only pushes to the default branch
    # will trigger a pages deploy
    - if: $CI_COMMIT_REF_NAME == $CI_DEFAULT_BRANCH
```
