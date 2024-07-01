import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Navigate,
  Routes,
} from "react-router-dom";

import { useManrope } from "yep/typefaces";
import { Index } from "yep/website/pages/Index";

export default function Website() {
  useManrope();

  return (
    <div style={{ flex: 1 }}>
      <Router>
        <div>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="*" element={<Navigate replace to="/" />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}
