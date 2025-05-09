import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";

import Layout from "./pages/Layout";
import GamePage from "./pages/GamePage";
import QuestionPage from "./pages/QuestionPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/game",
        element: <GamePage />,
      },
      {
        path: "/question/:questionId",
        element: <QuestionPage />,
      },
    ],
  },
]);

export default router;
