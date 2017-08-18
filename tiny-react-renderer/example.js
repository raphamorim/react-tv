const React = require('react');
const {
  Router,
  Route,
  Link,
  browserHistory,
  renderToJSON
} = require('react-router');

console.log(
  ReactDOM.render(
    renderToJSON(
      <Route path="/" component={App}>
        <Route path="about" component={About} />
        <Route path="users" component={Users}>
          <Route path="/user/:userId" component={User} />
        </Route>
        <Route path="*" component={NoMatch} />
      </Route>
    )
  )
);

/**
 * { path: '/',
 *   component: App,
 *   childRoutes: [
 *   ]
 *   ...
 * }
 */
