import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  createRoutesFromElements,
  createBrowserRouter,
  RouterProvider 
} from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Home = lazy(() => import('./pages/Home'));
const VeeAssistance = lazy(() => import('./pages/VeeAssistance'));
const VigilentEye = lazy(() => import('./pages/VigilentEye'));
const Navigation = lazy(() => import('./pages/Navigation'));
const LocationHistory = lazy(() => import('./pages/LocationHistory'));
const Settings = lazy(() => import('./pages/Settings'));

// Loading component
function Loading() {
  return <div>Loading...</div>;
}

// Error boundary component
function ErrorBoundary() {
  return (
    <div role="alert">
      <p>Something went wrong. Please try again or return to home.</p>
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<Loading />}>
        <Login />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/register",
    element: (
      <Suspense fallback={<Loading />}>
        <Register />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/home",
    element: (
      <Suspense fallback={<Loading />}>
        <Home />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/vigilent-eye",
    element: (
      <Suspense fallback={<Loading />}>
        <VigilentEye />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/vee-assistance",
    element: (
      <Suspense fallback={<Loading />}>
        <VeeAssistance />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/navigation",
    element: (
      <Suspense fallback={<Loading />}>
        <Navigation />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/location-history",
    element: (
      <Suspense fallback={<Loading />}>
        <LocationHistory />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/settings",
    element: (
      <Suspense fallback={<Loading />}>
        <Settings />
      </Suspense>
    ),
    errorElement: <ErrorBoundary />,
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }
});

function App() {
  return <RouterProvider router={router} />;
}

export default App;
