import React from "react";
import { BrowserRouter, Switch, Route } from "react-router-dom";


import Navigation from "./components/Navigation";
import Calendar from "./components/Calendar";
import History from "./components/History";
import Home from "./components/Home";

const title = "Navigation Bar";

function App() {
  return (
    <div>
      <BrowserRouter>
      <Navigation />
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/calendar" component={Calendar} />
        <Route path="/history" component={History} />
      </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;
