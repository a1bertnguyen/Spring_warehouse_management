// Learning note: App is the top-level React shell. It owns the browser router,
// while AppRoutes decides which page component should render for each URL.
import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "../routes/AppRoutes";

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
