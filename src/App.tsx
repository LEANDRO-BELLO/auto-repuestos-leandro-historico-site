import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Vehiculo from "./pages/Vehiculo";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route path="/vehiculo/:qr" element={<Vehiculo />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;