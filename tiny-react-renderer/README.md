# Tiny React Renderer

Creating a React Renderer will give you the opportunity to apply the same React
knowledge that you and your team already know and enjoy from the web and native
to whatever host environment you need.

Creating a renderer is a fairly straight-forward affair once you know what
you’re looking for.

Many languages have this concept of a `main`—the entry point to your
application. If you look at any React application code you’ve written you’ll see
that you “start” your app with a call like the following:

```jsx
// web
ReactDOM.render(React.createElement(MyApp), document.getElementById('app'));

// native
AppRegistry.registerComponent('MyApp', () => MyApp);
```

This is where your application enters into the React domain and comes alive. Your
root React element is instantiated and attached to the host environment.

If you follow either the ReactDOM or React Native codebases from where these
methods are defined you will quickly find yourself at the `React{Host}Mount.js`
file. Our renderer also begins there.

With that let’s get started! Our tour continues in [./src/stack/mount.js](./src/stack/mount.js).

## Work in Progress

Please note this guide is a work in progress. Much of this knowledge is derived
from my experience in creating [React Hardware](https://github.com/iamdustan/react-hardware).

## Tests

* `npm test` will run the tests with the stack-based renderer
* `npm test -- --fiber` will run the tests with the upcoming fiber implementation

## Renderer Implementations

* Stack
* Fiber

The React that we have worked with to date has been using what is called the
stack renderer. This is because it is implemented on the traditional JavaScript
stack and operates within those confines.

Fiber, on the other-hand, can be thought of like a React VM. It is influenced by
OCaml, algebraic effects, and other functional ideas. From an implementation
level, Fiber has a first-class renderer API allowing creating custom renderers a
much nicer experience.

The documentation for stack is no in maintenance mode and will not be very
accurate as time progresses. This can be found in `./src/stack`. The Fiber API
changes will be followed throughout its development to a stable release in
`./src/fiber`

## Thanks

* [@thejameskyle](https://github.com/thejameskyle): for the inspiration of repo style
* [@ryanflorence](https://github.com/ryanflorence) and [@mjackson](https://github.com/mjackson) for React Router and the problem that inspired this
* [@gaearon](https://github.com/gaearon), [@matthewwithanm](https://github.com/matthewwithanm),
  [@vjeux](https://github.com/vjeux), [@zpao](https://github.com/zpao),
  [@Yomguithereal](https://github.com/Yomguithereal), [@axemclion](https://github.com/axemclion),
  and everyone else who has helped me poke around the React codebase.
