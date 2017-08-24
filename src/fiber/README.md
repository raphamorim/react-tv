# Tiny React Renderer

> Note that this is currently targeting the **React 16.0.0-alpha.3** release.

Creating a fiber-based React renderer is quite direct, though there are a few
awkward pieces around tooling that will be smoothed over in time.

This guide can be read by jumping straight into the code to see the minimal work
to implement a renderer, or you can read the [./HowDoesFiberWork.md](./HowDoesFiberWork.md)
document for additional information on *how* Fiber works.

With Fiber, all renderers begin (and maybe even end) in the React{Host}Fiber.js
file.

With that let’s get started in [./ReactTinyFiber.js](./ReactTinyFiber.js)!

## Work in Progress

Please note this guide is a work in progress. Much of this knowledge is derived
from my experience in creating [React Hardware](https://github.com/iamdustan/react-hardware).

