# Directories

## `rootDir`

Project main directory

## `srcDir`

Project source directory. Same as `rootDir` unless specified. Helpful to move code into `src/`.

## `scanDirs`

- Default: (source directory when empty array)

List of directories to scan and auto-register files, such as API routes.

## `buildDir`

- Default: `.nitro`

nitro's temporary working directory for generating build-related files.

## `output`

- Default: `{ dir: '.output', serverDir: '.output/server', publicDir: '.output/public' }`

Output directories for production bundle.

