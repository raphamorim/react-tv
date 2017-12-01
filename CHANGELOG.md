# 0.3.0-beta.1

- breaks CLI
- supports spatial navigation
- supports events
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
