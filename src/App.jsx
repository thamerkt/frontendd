import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthForm from "./components/authentication";
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
import LandingPage from "./pages/LandingPage";
import History from "./pages/Admin/History";
import HistoryPage from "./pages/HistoryPage";
import CallbackPage from "./components/callback";
import LandingPagee from "./pages/landingpagee";
import QRScanner from "./components/QRCodeComponent";

import DocumentUpload from "./components/verification/DocumentUpload";
import QrDisplay from "./components/verification/QrDisplay";
import SelfieCapture from "./components/verification/SelfieCapture copy";
import VerificationComplete from "./components/verification/StatusCheck";
import DocumentCapture from "./components/verification/DocumentCapture";
import DocumentTypeSelection from "./components/verification/DocumentUpload";
import ImageGallery from "./components/test";
import BackCapture from "./components/verification/BackCapture";
import FrontCapture from "./components/verification/FrontCapture";
import { Provider } from 'react-redux';
import store from './redux/store';
const App = () => {
  return (
    <Provider store={store}>
    <Router>
      <div className="min-h-screen flex flex-col">
        {/* Navbar */}
        <Navbar/>
        

        <div className="flex flex-1">
          {/* Sidebar */}
          <Sidebar/>
          
          

          {/* Main Content */}
          <main className="flex-1 p-4">
            <Routes>
              <Route path="/" element={<LandingPagee />} />
              <Route path="/register/" element={<AuthForm />} />
              <Route path="/login/" element={<AuthForm />} />
              <Route path="/register/email-verification/" element={<EmailVerification />} />
              <Route path="/register/test/" element={<ImageGallery />} />
              
             

              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/register/business-details" element={<BusinessDetail />}/>
              <Route path="/callback" element={<CallbackPage />}/>
              <Route path="/register/identity-verification/verification/document-type" element={< DocumentTypeSelection/>}/>
              <Route path="/register/identity-verification/verification/front-document" element={<FrontCapture />}/>
              <Route path="/register/identity-verification/verification/back-document" element={<BackCapture />}/>
              <Route path="/register/identity-verification/verification/selfie" element={<SelfieCapture />}/>
              <Route path="/register/identity-verification/verification/VerificationComplete" element={<VerificationComplete />}/>
              <Route path="/register/identity-verification" element={<IdentityVerification />} />
              <Route path="/register/profil" element={<ProfileForm />} />
              <Route path="/admin/dashbord" element={<Dashboard />} />
              <Route path="/admin/booking" element={<BookingComponent />} />
              <Route path="/admin/clients" element={<ClientComponent />} />
              <Route path="/admin/history" element={<HistoryPage />} />
              <Route path="/qr" element={<QRScanner />} />
              
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
    </Provider>
  );
};

export default App;
