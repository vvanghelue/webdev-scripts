import routeParser from "route-parser";

export function Link({ to = "", children }) {
  return (
    <a
      href={to}
      onClick={(e) => {
        if (e.ctrlKey || e.shiftKey || e.metaKey || e.altKey) return; // let the browser handle
        e.preventDefault();
        // e.stopPropagation();
        goToRoute(to);
      }}
    >
      {children}
    </a>
  );
}

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
    onNotFound && onNotFound();
  }

  // router is a singleton
  window.onpopstate = matchRoute;
  onAddState = matchRoute;

  goToRoute(location.pathname + location.search);
}

// Example :

// npm install route-parser

// import { goToRoute, router, Link } from "./_common/router";

// const routes = [
//   {
//     id: "home",
//     pattern: "/",
//   },
//   {
//     id: "product",
//     pattern: "/product/:id",
//   },
// ];

// function App() {
//   const [route, setRoute] = React.useState(null);

//   React.useEffect(() => {
//     router({
//       routes,
//       onMatch({ route, params }) {
//         setRoute({ ...route, params });
//       },
//       onNotFound() {},
//       onChange() {},
//     });
//     goToRoute("/");
//   }, []);

//   return (
//     <div className="flex gap-2">
//       {route && (
//         <>
//           <Link to="/" className={route.id === "product" && "active"}>
//             home
//           </Link>

//           <Link to="/product/3" className={route.id === "product" && "active"}>
//             product 3
//           </Link>

//           <div className="pt-4">
//             {route.id == "home" && <div>home</div>}
//             {route.id == "product" && <div>product {route.params.id}</div>}
//           </div>
//         </>
//       )}
//     </div>
//   );
// }

// ReactDOM.createRoot(document.getElementById("root")).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );
