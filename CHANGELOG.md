# 0.4.3

- react-tv-navigation in yarn workspaces
- fixes for https://github.com/raphamorim/react-tv/issues/134

# 0.4.0

- react `^16.3.2`
- react-reconciler `0.10.0`
- support to React DevTools
- fixes on development bundle
- `development` and `production` bundles based on `process.node.env`

# 0.3.4

- update `react-tv-navigation` on react-tv-cli generator to 0.4.0

# 0.3.3

- update docs using separated package for Navigation (#114)
- change custom-app template to use new navigation system (0f58e09)
- add `react-tv-navigation` package on dependecies of custom app (0f58e09)
- migrate `node-webos` to react-tv/node-webos

# 0.3.2

- add findDOMNode (#112)
- remove navigation from Renderer (#108)

# 0.3.1

- remove engine specification
- update help command with new webos commands

# 0.3.0

- support style prop
- yarn workspaces (split into `react-tv-cli` and `react-tv`)
- `react-tv-cli setup-webos` for setup WebOS devices
- `react-tv-cli get-key-webos <device>` for get key file from device
- react-reconciler 0.7.0
- support className
- support spatial navigation
- support events
- update to nodejs 8
- update to yarn 1.3.2
- update to npm 5

# 0.3.0-beta.0

- stable CLI react-tv init
- fixes on react-tv run-webos
- on process.end remove/cleanup files
- on virtualbox call remove/cleanup files

# 0.3.0-alpha.2

- CLI: `react-tv init`
- CLI: `react-tv init <app-name>`
- add tests for CLI behavior
- add .npmignore
- add `jest:ci` job

# 0.3.0-alpha.1

- migrate to react-reconciler 0.6.0
- check if is need to format code on CI
- add benchmark example
- fix update render tor nodeText
- update postinstall to prebublishOnly (newest npm)
- remove: react-tv run-webos-dev
- react-tv cli {init} breaking changes

# 0.2.3

- use ReactReconciler from `react-reconciler` instead from `react-dom`

# 0.2.2

- fix state management

# 0.2.1

- support nested React.Element
- update examples

# 0.2.0

- Add a single example using Renderer (clock-app-with-react-tv)
- `yarn build-all` for PROD env
- prepublish script (using `yarn build-all`)
- update docs

# 0.2.0-rc

- Simple DOM renderer (ref: #11)
- New test architecture (using Jest)
- Add node (umd) version
- Add minified version
- Update .editorconfig to Facebook/react

# 0.1.4-rc.1, 0.1.4-rc.2

- fixes on cli

# 0.1.4

- fix cli not working because npmignore to all scripts

# 0.1.3

- cli: fix path on create apptv template
- Platform check for WebOS
- Add common ignore for npmignore

# 0.1.2

- update on ReactTV Renderer (still not working)
- update on README info
- add MIT license

# 0.1.1

- stable CLI (with template generator and pack to IPK)
