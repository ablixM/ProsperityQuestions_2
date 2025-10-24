import { createBrowserRouter } from "react-router-dom";
import HomePage from "./pages/HomePage";

import Layout from "./pages/Layout";
import GamePage from "./pages/GamePage";
import QuestionPage from "./pages/QuestionPage";
import QuestionReaderPage from "./pages/QuestionReaderPage";

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
      {
        path: "/question-reader",
        element: <QuestionReaderPage />,
      },
    ],
  },
]);

export default router;
