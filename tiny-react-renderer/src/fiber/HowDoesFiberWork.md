## How Does Fiber Work?

> Note: it is highly recommended that you read [https://github.com/acdlite/react-fiber-architecture](https://github.com/acdlite/react-fiber-architecture)
> along with this. Andrew has a lot more foundational definitions and describes
> the `fiber` data structure, whereas this describes how updates are scheduled
> and commited from the renderers point of view.

The fiber reconciler builds on the idea of Algebraic Effects. A custom renderer
coordinates with the reconciler by informing it when certain effects should be
scheduled. The type of effects are:

* `NoEffect`
* `Placement`
* `Update`
* `PlacementAndUpdate`
* `Deletion`
* `ContentReset`
* `Callback`
* `Err`
* `Ref`

This is likely best explained with an example using the DOM renderer. We’ll
create a Composite Component that renders a text instance with the `"Hello"`
inside of a `div` host instance. We’ll immediately render the `App` composite
component updating the text instance contents to be the string `"World"`.

```jsx
const App = (props) => <div>{props.children}</div>;

ReactDOM.render(<App>Hello</App>, document.body);
ReactDOM.render(<App>Goodbye</App>, document.body);
```

In the initial rendering Fiber will schedule `PlacementAndUpdate` effects to
create the simple `<div /> -> [text#Hello]` tree. When reconciling the second
render call, when beginning work Fiber will schedule a `ContentReset` effect to
clear the text of the `div` and an `Update` effect to schedule setting the new
text content.

A renderer informs a fiber reconciler what text effects to schedule and how to
complete them through the following handful of methods:

* `shouldSetTextContent`: communicates to the reconciler if a `ContentReset`
  effect should be scheduled
* `resetTextContent`: Fiber calls this method when commiting the `ContentReset` effect
* `createTextInstance`: Fiber calls this method when it needs a new host text instance
* `commitTextUpdate`: Fiber calls this method to commit the new text content `Update` effect

