import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Navbar from "./components/Navbar";
import Sidebar from "./components/sidebar";
import Login from "./components/login";
import EmailVerification from "./pages/EmailVerification";
import BusinessDetail from "./pages/BusinessDetails";
import ContactUs from "./pages/contactus";
import Home from "./pages/Home";
import IdentityVerification from "./pages/identityverification";
import ProfileForm from "./pages/ProfileFrom";
import Dashboard from "./pages/Admin/dashbord";
import BookingComponent from "./components/Admin/Booking";
import SidebarAdmin from "./components/Admin/sidebar"
import ClientComponent from "./components/Admin/clients"

const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navbar */}
        

        <div className="flex flex-1">
          {/* Sidebar */}
          <SidebarAdmin/>
          
          

          {/* Main Content */}
          <main className="flex-1 p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login/" element={<Login />} />
              <Route path="/register/email-verification/" element={<EmailVerification />} />
              
             

              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/register/business-details" element={<BusinessDetail />}/>

              <Route path="/register/identity-verification" element={<IdentityVerification />} />
              <Route path="/register/profil" element={<ProfileForm />} />
              <Route path="/admin/dashbord" element={<Dashboard />} />
              <Route path="/admin/booking" element={<BookingComponent />} />
              <Route path="/admin/clients" element={<ClientComponent />} />
              <Route path="*" element={<Register />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default App;
