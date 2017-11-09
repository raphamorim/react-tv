# React-TV TODOLIST

- Verify if I can map props before pass to ReactReconciler.
- Reduce appendChilds (DOM Iteration) on appendInitialChild for textNodes (?)
  - maybe not necessary: `appendChildToContainer` it's the only one to real append it. But still need to check benchmark results.
  - ReactTV.CreateElement, solves it.
- Create a benchmark about ReactDOM against ReactTV.
  - simplest render case, based on only appendChildToContainer.
  - with a lot of updateProperties (maybe focused on animations).
  - memory usage of both.
- Stop propagation of onClick (?)
- Think about `AppIsReady` for TVS. It's about done/loaded events which WebOS and Tizen dispatch, start mapping it in a HOC?
- Propagate handler for keyboard on React.Elements.
- `ReactTV.CreateCanvasElement`
- Simulator Component (`TVSimulator`).
  - render children as app.
  - `({children}) => <TVSimulator>{children}<Keyboard/></TVsimulator>`
  - share keyboard state with rendered container.
- Write a guide for create your first application for WebOS using ReactTV.
