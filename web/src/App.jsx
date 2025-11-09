import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Redirect from "@/pages/Redirect";

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/u/:code" element={<Redirect />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
