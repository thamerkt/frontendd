import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import Sidebar from "./components/sidebar";
import Login from "./components/login";
import EmailVerification from "./pages/EmailVerification";
import BusinessDetails from "./pages/BusinessDetails";
import ContactUs from "./pages/contactus";
import Home from "./pages/Home";

import IdentityVerification from "./pages/identityverification";

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
          <main className="flex-1 p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login/" element={<Login />} />
              <Route path="/register/email-verification/" element={<EmailVerification />} />

              <Route path="/register/business-details" element={<BusinessDetails />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/register/business-details" element={<BusinessDetails />}/>
              <Route path="/register/identity-verification" element={<IdentityVerification />} />
              <Route path="*" element={<Register />}  />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;