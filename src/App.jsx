import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import PlanBuilder from "./pages/PlanBuilder.jsx";
import PlanResults from "./pages/PlanResults.jsx";
import Goals from "./pages/Goals.jsx";
import StepHeader from "./components/StepHeader.jsx";
import NavBar from "./components/NavBar.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <StepHeader />

      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/plan" element={<PlanBuilder />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/plan/:id" element={<PlanResults />} />
      </Routes>
    </BrowserRouter>
  );
}
