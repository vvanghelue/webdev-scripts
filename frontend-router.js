import routeParser from "route-parser";

// router is a singleton
let onAddState;

export function goToRoute(route, options = {}) {
  if (options.replaceState) {
    history.replaceState({}, "", route);
  } else {
    history.pushState({}, "", route);
  }
  setTimeout(() => window.scrollTo(0, 0), 100);

  if (!onAddState) {
    throw new Error("You must instanciate router() first !");
  }
  onAddState();
}

export function router({ routes, onMatch, onNotFound, onChange }) {
  function matchRoute() {
    onChange();
    let path = location.pathname;
    if (path.endsWith("/")) path = path.slice(0, -1);
    if (path == "") path = "/";
    for (const route of routes) {
      const match = routeParser(route.pattern).match(path);
      if (match) {
        onMatch({ route, params: match });
        return;
      }
    }
    onNotFound();
  }

  // router is a singleton
  window.onpopstate = matchRoute;
  onAddState = matchRoute;
}
