import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import Login from "./components/login";

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navbar */}
        <Navbar />

        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar />

          {/* Main Content */}
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
