# [React-TV](https://github.com/raphamorim/react-tv) 📺 • [![circleci status](https://circleci.com/gh/raphamorim/react-tv/tree/master.svg?style=shield)](https://circleci.com/gh/raphamorim/react-tv) [![npm version](https://img.shields.io/npm/v/react-tv.svg?style=flat)](https://www.npmjs.com/package/react-tv) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md#pull-requests)

> React Renderer for low memory applications

> React Packager for TVs (WebOS, Tizen, Orsay)

> You can use it separately.

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
- [Getting Started](#getting-started)
  - [Installing](#installing)
  - [Examples](#examples)
    - [Clock TV App rendering with React-TV](#clock-tv-app-rendering-with-react-tv)
  - [Using CLI](#using-cli)
  - [Using Module](#using-module)
- [Supported Televisions](#supported-televisions)
  - [LG WebOS](#lg-webos)
- [References for Study](#references)
  - [WebOS](#webos)
  - [Videos](#videos)
  - [Essentials to beginner](#essentials-to-beginner)
  - [React Basics and Renderer Architecture](#react-basics-and-renderer-architecture)
- [Roadmap](#roadmap)

## About React-TV

React-TV is a ecosystem for React Application for TVs (from the renderer to CLI for pack/build applications) focused now on WebOS and SmartTV.

The mission of React-TV is build & develop fast for TVs.

### Understanding the Problem

**tl;dr:** [Crafting a high-performance TV user interface using React](https://medium.com/netflix-techblog/crafting-a-high-performance-tv-user-interface-using-react-3350e5a6ad3b)

Crafting a high-performance TV user interface using React is a real challenge, because of some reasons:

- Limited graphics acceleration
- Single core CPUs
- High Memory Usage for a commom TV App

These restrictions make super responsive 60fps experiences especially tricky. The strategy is **step in the renderer**: Applying reactive concepts to unblock the processing on renderer layer, plug the TV's keyListener, avoid React.createElement (which cost a lot)[...]

In addition: Unify the build for multiple TV platforms.

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

## Examples

### [Clock TV App Rendering with React-TV](https://github.com/raphamorim/react-tv/tree/master/examples/clock-app-with-react-tv)

![clock-with-react-tv-as-renderer](examples/clock-app-with-react-tv/screenshot.png)

```jsx
import React from 'react'
import ReactTV, { Platform } from 'react-tv'

class Clock extends React.Component {
  constructor() {
    super()
    this.state = { date: new Date() }
  }

  componentDidMount() {
    setInterval(() => this.setState({date: new Date()}), 1000)
  }

  render() {
    let currentPlatform = 'Browser'
    if (Platform('webos'))
      currentPlatform = 'LG WebOS'

    return (
      <div class='container'>
        <img src='https://i.imgur.com/9yhDR0Q.png'/>
        <h1>It's {this.state.date.toLocaleTimeString()}</h1>
        <p>You're in {currentPlatform}</p>
      </div>
    )
  }
}

ReactTV.render(<Clock/>, document.getElementById('root'))
```

## Using CLI

### Initalizing React-TV Apps:

Generate react-tv projects:

```bash
$ react-tv init <app-name>
```

If you want to specify app path on commnand:

```bash
$ react-tv init <app-name> <app-path>
```

Open app folder:

```bash
$ cd app-name
```

Run emulator and devices (should pack, build and run on emulator):

```
$ react-tv run-webos
```

Run only on devices and disable create/call Emulator instance:

```
$ react-tv run-webos --disable-emulator
```

Run webos app on browser (developer mode on browser). `run-webos-dev` is using `REACT_TV_PORT` environment variable or `8500` as port number.

```
$ react-tv run-webos-dev
```

## Using Module

### Platform

When building a cross-platform tv app, you'll want to re-use as much code as possible. Scenarios may arise where it makes sense for the code to be different, for example you may want to implement separate visual components for `LG-WebOS` and `Samsung-Tizen`.

React-TV provides `Platform` module to easily organize your code and separate it by platform:

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

## Supported Televisions

### LG WebOS

![WebOS 3.0](https://i.ytimg.com/vi/tsRrFehUPEA/maxresdefault.jpg)

**Target Version: 3.0**

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

---------------------------------------------------- 

See ReactTV's [Changelog](https://github.com/raphamorim/react-tv/blob/master/CHANGELOG.md).

Currently ReactTV is licensed by [MIT License](https://github.com/raphamorim/react-tv/blob/master/LICENSE.md)

## Credits

Thanks [react-dom](https://github.com/facebook/react/tree/master/packages/react-dom) for be example and a inspiration code :)

## Roadmap

#### Stage 1

Initial proof-of-concept. [IN PROGRESS]

- [x] CLI Build Abstraction of LG Webos (`run-webos`, `run-webos-dev`)
- [ ] Create a guide or script to Install all LG WebOS environment
- [ ] Renderer ReactElements to simple DOM
  - [x] Support HOF and HOC
  - [x] Support State and Lifecycle
  - [ ] Change `className` to `class`
- [ ] Optmizate DOMRenderer for TV
  - [ ] Avoid memoize operations and use DOM Hash
- [x] Check `webos` Platform
- [ ] Migrate to `React-Reconciler`

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
