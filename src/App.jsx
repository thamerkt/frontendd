import React from "react";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import store from './redux/store';
import Footer from "./pages/footer";

// Layout Components
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import SidebarAdmin from "./components/Admin/Adminsidebar";

// Authentication
import AuthForm from "./components/authentication";
import CallbackPage from "./components/callback";

// Common Pages
import LandingPage from "./pages/LandingPage";
import LandingPagee from "./pages/landingpagee";
import ContactUs from "./pages/contactus";
import ShopGrid from './pages/shopGrid';
import ProductDetails from "./components/EquipmentPage";
import QRScanner from "./components/QRCodeComponent";

// Registration Process
import RegistrationProgressGuard from "./components/RegistrationProgressGuard";
import EmailVerification from "./pages/EmailVerification";
import ProfileForm from "./pages/ProfileFrom";
import BusinessDetail from "./pages/BusinessDetails";
import IdentityVerification from "./pages/identityverification";

// Verification Steps
import DocumentTypeSelection from "./components/verification/DocumentUpload";
import DocumentCapture from "./components/verification/DocumentCapture";
import FrontCapture from "./components/verification/FrontCapture";
import BackCapture from "./components/verification/BackCapture";
import SelfieCapture from "./components/verification/SelfieCapture copy";
import VerificationComplete from "./components/verification/StatusCheck";

// Admin
import Dashboard from "./pages/Admin/dashbord";
import SettingsPage from "./components/Admin/settings";
import BookingComponent from "./components/Admin/Booking";
import ClientComponent from "./components/Admin/clients";
import ProductsPage from "./components/Admin/products";
import HistoryPage from "./pages/Admin/History";
import ClientDashboard from "./pages/Client/dashboard"
// Partner
import PartnerDashboard from './components/partner/dashbord';
import PartenaireClientComponent from "./components/partner/clients";
import ServicesManagement from "./components/partner/services";
import PartnerSettingsPage from "./components/partner/settings";
import PartnershipManagement from "./components/partner/partnership";

import FavoritesPage from "./components/client/favorite";
import ClientRequestsPage from "./components/client/requests";
// Utilities
import RoleRoute from "./components/RoleRoute";
import unauthorized from "./components/unauthorized";
import CheckoutProcess from "./components/paymentProcess";
import ContractSigner from "./components/signature";
import ProcessGuard from "./components/utils/ProcessGuard";
import AddProductForm from "./pages/AddProduct";
import ImageGallery from "./components/test";
import SidebarClient from "./components/client/Clientsidebar"
import TrackingService from "./services/TrackingService";
import { useEffect } from 'react';
import CategoriesPage from "./pages/CategoriesPage";
import BlogPost1 from "./components/blog1";
import { BlogSection } from "./components/LandingPage";
import BlogPost2 from "./components/blog2";
import BlogPost3 from "./components/blog3";
const App = () => {
  
  useEffect(() => {
    const session_key=localStorage.getItem('session_key')
    if(!session_key){
    const trackVisitor = async () => {
      try {
       const response= await TrackingService.visitorsinit();
       console.log(response)
        
      } catch (err) {
        console.error("Visitor tracking failed:", err);
      }
    };
  
    trackVisitor(); // Call the async function inside useEffect
  }
  
  }, []);
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen flex flex-col">
        <Navbar/>
          
          <div className="flex flex-1">
            
              <SidebarAdmin />
              <Sidebar/>
             <SidebarClient/>
          

            <main className="flex-1 ">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/collaboration" element={<LandingPagee />} />
                <Route path="/contact-us" element={<ContactUs />} />
                <Route path="/shopgrid" element={<ShopGrid />} />
                <Route path="/contact" elemnt={<ContactUs />} />
                <Route path="/equipment/:productId" element={<ProductDetails />} />
                <Route path="/qr" element={<QRScanner />} />
                <Route path="/callback" element={<CallbackPage />} />
                <Route path="/unauthorized" element={<unauthorized />} />
                <Route path="/categories" element={<CategoriesPage />} />
        <Route path="/categories/:categoryId" element={<CategoriesPage />} />
                    <Route path="/" element={<BlogSection />} />
                    <Route path="/blog/blog1" element={<BlogPost1 />} />
                    <Route path="/blog/blog2" element={<BlogPost2 />} />
                    <Route path="/blog/blog3" element={<BlogPost3 />} />

                {/* Authentication */}
                <Route path="/login" element={<AuthForm />} />
                <Route path="/register" element={<AuthForm />} />
                
                {/* Registration Process */}
                
                  <Route path="/register/email-verification" element={<EmailVerification />} />
                  <Route path="/register/profil" element={<ProfileForm />} />
                  <Route path="/register/business-details" element={<BusinessDetail />} />
                  <Route path="/register/identity-verification" element={<IdentityVerification />} />
                  <Route path="/register/equipments" element={<ShopGrid />} />
                  
                  {/* Verification Steps */}
                  <Route path="/register/identity-verification/verification/document-type/:user/:local_ip" element={<DocumentTypeSelection />} />
                  <Route path="/register/identity-verification/verification/document-captured" element={<DocumentCapture />} />
                  <Route path="/register/identity-verification/verification/front-document/" element={<FrontCapture />} />
                  <Route path="/register/identity-verification/verification/back-document" element={<BackCapture />} />
                  <Route path="/register/identity-verification/verification/selfie" element={<SelfieCapture />} />
                  <Route path="/register/identity-verification/verification/verification-complete" element={<VerificationComplete />} />
                
                <Route path="/admin/dashbord" element={<Dashboard />} />
                  <Route path="/admin/booking" element={<BookingComponent />} />
                  <Route path="/admin/products" element={<ProductsPage />} />
                  <Route path="/admin/clients" element={<ClientComponent />} />
                  <Route path="/admin/history" element={<HistoryPage />} />
                  <Route path="/admin/settings" element={<SettingsPage />} />
                
                
                
                  <Route path="/client/dashboard" element={<ClientDashboard />} />
                  <Route path="/client/bookings" element={<BookingComponent />} />
                  <Route path="/client/favorites" element={<FavoritesPage />} />
                  <Route path="/client/products" element={<ProductsPage />} />
                  <Route path="/client/clients" element={<ClientComponent />} />
                  <Route path="/client/history" element={<HistoryPage />} />
                  <Route path="/client/request" element={<ClientRequestsPage />} />
                  <Route path="/client/settings" element={<SettingsPage />} />
               
                <Route path="/partenaire/dashbord" element={<PartnerDashboard />} />
                <Route path="/partenaire/client" element={<PartenaireClientComponent />} />
                <Route path="/partenaire/services" element={<ServicesManagement />} />
                <Route path="/partenaire/partnership" element={<PartnershipManagement />} />
                {/* Partner Routes */}
                <Route path="/partenaire" element={<RoleRoute allowedRoles={['partner']} />}>
                  <Route index element={<PartnerDashboard />} />
                 
                  
                  <Route path="settings" element={<PartnerSettingsPage />} />
                </Route>

                {/* Utility Routes */}
                <Route path="/add" element={<AddProductForm />} />
                <Route path="/register/test" element={<ImageGallery />} />
                <Route path="/payment" element={<CheckoutProcess />} />
                <Route path="/signature" element={<ContractSigner />} />

                {/* Fallback */}
                <Route path="*" element={<h1>404 - Not Found</h1>} />
              </Routes>
            </main>
            
          </div>
          
      
      
        </div>
      </Router>
      
    </Provider>
  );
};

export default App;