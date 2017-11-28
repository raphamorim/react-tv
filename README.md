# [React-TV](https://github.com/raphamorim/react-tv) · [![license](https://img.shields.io/npm/l/react-tv.svg)]() [![npm version](https://img.shields.io/npm/v/react-tv.svg?style=flat)](https://www.npmjs.com/package/react-tv) [![circleci status](https://circleci.com/gh/raphamorim/react-tv/tree/master.svg?style=shield)](https://circleci.com/gh/raphamorim/react-tv) [![Build status](https://ci.appveyor.com/api/projects/status/h851w6fprabjuifb/branch/master?svg=true)](https://ci.appveyor.com/project/raphamorim/react-tv/branch/master) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md#pull-requests)

> <p>React Renderer for low memory applications.</p><p>React Packager for TVs (WebOS, Tizen, Orsay).</p><p>You can use it separately. Currently under development.</p>

![React-TV Logo](resources/images/reactv-cover-dark.png)

```jsx
import React from 'react'
import ReactTV, { Platform } from 'react-tv'

class Clock extends React.Component {
  state = { date: new Date() }

  componentDidMount() {
    setInterval(() => this.setState({date: new Date()}), 1000)
  }

  render() {
    if (Platform('webos')) {
      return (
        <h1>Time is {this.state.date.toLocaleTimeString()}</h1>
      )
    }

    return <h2>This App is available only at LG WebOS</h2>
  }
}

ReactTV.render(<Clock/>, document.getElementById('root'))
```

## Summary

- [About React-TV](#about-react-tv)
  - [Understanding the Problem](#understanding-the-problem)
  - [React-TV Renderer Characteristics](#react-tv-renderer-characteristics)
  - [Spatial Navigation](#spatial-navigation)
- [Getting Started](#getting-started)
  - [Installing](#installing)
  - [Using CLI](#using-cli)
    - [React-TV CLI for WebOS](#react-tv-cli-for-webos)
      - [Setup WebOS Environment](#2-setup-webos-environment)
  - [Using Module](#using-module)
- [Examples](#examples)
    - [Clock](#clock)
    - [Youtube](#youtube)
- [Supported Televisions](#supported-televisions)
  - [LG WebOS](#lg-webos)
- [References for Study](#references)
  - [WebOS](#webos)
  - [Videos](#videos)
  - [Essentials to beginner](#essentials-to-beginner)
  - [React Basics and Renderer Architecture](#react-basics-and-renderer-architecture)
- [Roadmap](#roadmap)
- [Credits](#credits)

## About React-TV

React-TV is an ecosystem for TV based React applications (from the renderer to CLI for pack/build applications).  
At the moment we're focusing on WebOS and SmartTV.  
React-TV's aims to be a better tool for building and developing fast for TVs.

### Understanding the Problem

**tl;dr:** [Crafting a high-performance TV user interface using React](https://medium.com/netflix-techblog/crafting-a-high-performance-tv-user-interface-using-react-3350e5a6ad3b)

Crafting a high-performance TV user interface using React is a real challenge, because of some reasons:

- Limited graphics acceleration
- Single core CPUs
- High Memory Usage for a common TV App

These restrictions make super responsive 60fps experiences especially tricky. The strategy is **step in the renderer**: Applying reactive concepts to unblock the processing on the renderer layer, plug the TV's keyListener, avoid React.createElement (which cost a lot)[...]

In addition: Unify the build for multiple TV platforms.

### React-TV Renderer Characteristics

The React-TV renderer is **asynchronous by default**. Does not check for accessibility properties.

### Spatial Navigation

React-TV provides a spatial navigation system on render level. 

Just add `focusable` for navigable elements and `focused` for an element which starts focused. 

```jsx
<div>
  <div focusable onBlur={() => console.log('blur') } >
    Item with Blur Handler
  </div>
  <div class="my-horizontal-list">
    <div class="item" focusable onPress={() => console.log('pressed') } >
      Horizontal Item 1 with Press Handler
    </div>
    <div class="item" focusable focused>
      Horizontal Item 2 which started focused
    </div>
  </div>
  <div class="item" focusable onFocus={() => console.log('focused') } >
    Item with Focus Handler
  </div>
  <div class="item">
    Item which can't be focused or selected
  </div>
</div>
```

See [examples/navigation](examples/navigation) for more details about usage.

## Getting Started

### Installing

To install `react-tv` as a CLI Packager:

```bash
$ npm install -g react-tv
# or
$ yarn global add react-tv
```

To install `react-tv` as a React Renderer:

```bash
$ npm install react-tv --save
# or
$ yarn add react-tv
```

## Using CLI

### React-TV CLI for WebOS

#### 1: Install globally React-TV

```bash
$ yarn add --global react-tv
```

#### 2: Setup WebOS Environment

[Setup WebOS Enviroment](docs/setup-webos-environment.md)

#### 3: Setting Up

3.1: If you doesn't have a project yet and you want to start from scratch, jump to topic 3 (Running It!).

```bash
$ react-tv init <my-app-name>
```

3.2: If you already have some source code. Just run `react-tv init` on the project root.  

3.3: Add the files related to your app on the React-TV entry on `package.json`:

```json
{
  "name": "my-app-name",
  "react-tv": {
    "files": [
      "index.html",
      "bundle.js",
      "style.css"
    ]
  }
}
```

#### 4: Running It!

Run the emulator and devices (should pack, build and run it on the emulator):

```
$ react-tv run-webos
```

## Using Module

### Platform

When building a cross-platform TV app, you'll want to re-use as much code as possible. You'll probably have different scenarios where different code might be necessary.  
For instance, you may want to implement separated visual components for `LG-WebOS` and `Samsung-Tizen`.

React-TV provides the `Platform` module to easily organize your code and separate it by platform:

```js
import { Platform } from 'react-tv'

console.log(Platform('webos')) // true
console.log(Platform('tizen')) // false
console.log(Platform('orsay')) // false
```

- Keys (in-draft)

```js
import { Keys } from 'react-tv'

<Keys onChange={myCustomHandler}/>
```

## Examples

### [Clock App](https://github.com/raphamorim/react-tv/tree/master/examples/clock-app-with-react-tv)

![clock-with-react-tv-as-renderer](examples/clock-app-with-react-tv/screenshot.png)

### [Youtube App](https://github.com/dead/react-key-navigation/tree/master/examples/youtube-react-tv)

![Youtube App Example](https://raw.githubusercontent.com/dead/react-key-navigation/master/examples/youtube-react-tv/example.gif)

## Supported Televisions

### LG WebOS

![WebOS 3.0](https://i.ytimg.com/vi/tsRrFehUPEA/maxresdefault.jpg)

**Target Version: 3.0**

For 2.0, 1.0 versions: [use polyfills](https://github.com/raphamorim/react-tv/issues/64).

WebOS, also known as Open WebOS or LG WebOS, (previously known as HP WebOS and Palm WebOS, stylized as webOS) is a Linux kernel-based multitasking operating system for smart devices such as Smart TVs and it has been used as a mobile operating system.

### Samsung Tizen

[Work in Progress]

### Samsung Orsay

[Work in Progress]

## References:

### WebOS

- http://webostv.developer.lge.com/sdk/download/download-sdk/
- http://webostv.developer.lge.com/sdk/install-instructions/installing-sdk/
- http://webostv.developer.lge.com/sdk/emulator/introduction-emulator/
- http://webostv.developer.lge.com/develop/building-your-first-web-app-webos-tv/
- http://webostv.developer.lge.com/develop/app-test/
- http://webostv.developer.lge.com/api/web-api/supported-standard-web-api/

#### Videos

##### Windows

- [LG WebOS SDK Installing (Setup Webos IDE)](https://www.youtube.com/watch?v=4l-3ZdRkRgc)

##### OSX

- [Build Your First App for webOS TV (Setup OSX)](https://www.youtube.com/watch?v=DXOCbt6oTmk)

### Essentials to beginner

- http://developer.samsung.com/tv/develop/getting-started/setup-sdk/installing-tv-sdk/
- http://developer.samsung.com/tv/develop/getting-started/using-sdk/tv-simulator
- http://developer.samsung.com/tv/develop/getting-started/essentials-for-beginner

### Developing for SmartTV Guidelines

- https://github.com/ruiposse/smart-tv-app-dev-guidelines
- https://github.com/immosmart/smartbox
- https://github.com/linuxenko/awesome-smarttv

### React Basics and Renderer Architecture
- https://github.com/reactjs/react-basic
- https://github.com/iamdustan/tiny-react-renderer
- https://facebook.github.io/react/blog/2015/12/18/react-components-elements-and-instances.html

## Roadmap

#### Stage 1

Initial proof-of-concept. [IN PROGRESS]

- [x] CLI Build Abstraction of LG Webos (`run-webos`, `run-webos-dev`)
- [x] Create a guide or script to Install all LG WebOS environment
- [ ] Renderer ReactElements to simple DOM
  - [x] Support HOF and HOC
  - [x] Support State and Lifecycle
  - [ ] Keyboard Navigation
- [ ] Optmizate DOMRenderer for TV
- [x] Check `webos` Platform
- [x] Migrate to `React-Reconciler`
- [ ] Improve documentation

#### Stage 2

Implement essential functionality needed for daily use by early adopters.

- [ ] Support render to Canvas instead DOM using `React.CanvasComponent`
- [ ] `run-webos` support TV device as param
- [ ] Start CLI for Tizen
- [ ] Develop helpers for WebOS debbug (e.g: Log System).
- [ ] Support Cross Platform
  - [ ] Check executable bin path for Windows, OSX and Linux
- [ ] Bind TV key listeners on `React.Element`
- [ ] Benchmark it

#### Stage 3

Add additional features users expect from a Renderer. Then fix bugs and stabilize through continuous daily use. At this point we can start to experiment with innovative ideas and paradigms.

- [ ] Start CLI for Orsay
- [ ] Update Benchmarks
- [ ] Handle common errors
- [ ] Reactive Renderer
- [ ] Testing and stability

---------------------------------------------------- 

See ReactTV's [Changelog](https://github.com/raphamorim/react-tv/blob/master/CHANGELOG.md).

Currently ReactTV is licensed by [MIT License](https://github.com/raphamorim/react-tv/blob/master/LICENSE.md)

## Credits

Thanks [react-dom](https://github.com/facebook/react/tree/master/packages/react-dom) for be example and a inspiration code :)
