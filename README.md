# React-TV [![circleci status](https://circleci.com/gh/raphamorim/react-tv/tree/master.svg?style=shield)](https://circleci.com/gh/raphamorim/react-tv) [![npm version](https://img.shields.io/npm/v/react-tv.svg?style=flat)](https://www.npmjs.com/package/react-tv) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md#pull-requests)

> React development for TV (WebOS, SmartTVs) 📺

![React-TV Logo](resources/images/react-tv-cover.png)

```js
import React from 'react'
import ReactTV, { Platform } from 'react-tv'

class Clock extends React.Component {
  constructor(props) {
    super(props)
    this.state = {date: new Date()}
  }

  render() {
    if (Platform.webos) {
      return (
        <div>
          <h1>Hello, {Platform}</h1>
          <h2>It is {this.state.date.toLocaleTimeString()}</h2>
        </div>
      )
    }

    return <div>This App is available only at Samsung WebOS</div>
  }
}

ReactTV.render(Clock, document.getElementById('root'))
```

## Summary

- [About React-TV](#about-react-tv)
  - [Understanding the Problem](#understanding-the-problem)
- [Getting Started](#getting-started)
  - [Installing](#installing)
  - [Examples](#examples)
  - [Using CLI](#using-cli)
  - [Using Module](#using-module)
- [Supported Televisions](#supported-televisions)
  - [LG WebOS](#lg-webos)
- [References for Study](#references)
  - [WebOS](#webos)
  - [Videos](#videos)
  - [Essentials to beginner](#essentials-to-beginner)
  - [React Basics and Renderer Architecture](#react-basics-and-renderer-architecture)
- [TODOLIST for 1.0.0](#todolist)

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

To install `react-tv` as a CLI:

```bash
$ npm install -g react-tv
# or
$ yarn global add react-tv
```

To install `react-tv` as a Module:

```bash
$ npm install react-tv --save
# or
$ yarn add react-tv
```

## Examples

[WORK IN PROGRESS]

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

### Components (?)

- Platform

```js
import { Platform } from 'react-tv'

console.log(Platform.WebOS === true) // true
console.log(Platform.Tizen === true) // false
console.log(Platform.Orsay === true) // false
```

- Keys

```js
import { Keys } from 'react-tv'

<Keys onChange={myCustomHandler}/>
```

## Supported Televisions

### LG WebOS

![WebOS 3.0](https://i.ytimg.com/vi/tsRrFehUPEA/maxresdefault.jpg)

WebOS, also known as Open WebOS or LG WebOS, (previously known as HP WebOS and Palm WebOS, stylized as webOS) is a Linux kernel-based multitasking operating system for smart devices such as Smart TVs and it has been used as a mobile operating system. Initially developed by Palm, Inc. (which was acquired by Hewlett-Packard), HP made the platform open source, at which point it became Open WebOS. The operating system was later sold to LG Electronics. In January 2014, Qualcomm announced that it had acquired technology patents from HP, which included all the WebOS and Palm patents that HP held.

Various versions of WebOS have been featured on several devices since launching in 2009, including Pre, Pixi, and Veer smartphones, TouchPad tablet, LG Smart TVs since 2015.


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

## TODOLIST

- [ ] {cli} init project
  - [x] mkdir app-path
  - [x] generate react app tv based on app-name and app-path
  - [ ] create a npm script on app: `react-tv run-webos-dev`
- [ ] {cli} run-webos-dev
  - [ ] mount bundle (crow-scripts)
    - [ ] check if exists webpack config existent on folder
  - [ ] copy bundle for respective folders
  - [x] run server (express?)
- [ ] {cli} run-webos
  - [ ] CROW bundling
  - [ ] Check executable bin path for Windows, OSX and Linux
  - [x] pack and install script
  - [x] check if virtualbox is up
  - [x] launch
  - [x] `--disable-emulator`
- [ ] {renderer}
  - [ ] WebOS
    - [ ] platform
    - [ ] volume
  - [ ] SmartTV
    - [ ] platform
    - [ ] volume
