import { RouterProvider } from 'react-router';
import { router } from './routes';

// Application root: delegates all navigation to React Router.
export default function App() {
  return <RouterProvider router={router} />;
}
