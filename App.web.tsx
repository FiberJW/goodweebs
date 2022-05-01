import AppLoading from "expo-app-loading";
import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from "react-router-dom";

import { useManrope } from "yep/typefaces";
import { Index } from "yep/website/pages/Index";

export default function Website() {
  const fontsLoaded = useManrope();

  // Vercel only deploys when website/** is changed

  return fontsLoaded ? (
    <Router>
      <div>
        <Switch>
          <Route exact path="/">
            <Index />
          </Route>

          <Redirect to="/" />
        </Switch>
      </div>
    </Router>
  ) : (
    <AppLoading />
  );
}
