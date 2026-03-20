import { createBrowserRouter } from "react-router";
import Root from "./pages/Root";
import Landing from "./pages/Landing";
import Home from "./pages/Home";
import MenuDetail from "./pages/MenuDetail";
import RecipeDetail from "./pages/RecipeDetail";
import NotFound from "./pages/NotFound";
import MenuDemoList from "./pages/MenuDemoList";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Landing },
      { path: ":venueCode/menu", Component: Home },
      { path: ":venueCode/menu/:menuId", Component: MenuDetail },
      { path: ":venueCode/menu/:menuId/recipe/:recipeId", Component: RecipeDetail },
      { path: ":venueCode/menu_demo", Component: MenuDemoList },
      { path: ":venueCode/menu_demo/:menuId", Component: MenuDetail },
      { path: "*", Component: NotFound },
    ],
  },
]);
