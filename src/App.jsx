import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Provider } from 'react-redux';
import store from './redux/store';
import { AuthProvider } from './contexts/AuthContext';

// Layout Components
import Navbar from "./components/navbar";
import SidebarAdmin from "./components/Admin/Adminsidebar";
import SidebarAdministrateur from "./components/Admininstrateur/Adminsidebar";
import Sidebar from "./components/sidebar";
import ProfileNavbar from "./components/ProfileNavbar";
import RegistrationProgressGuard from "./RegistrationProgressGuard";
// Authentication
import AuthForm from "./components/authentication";
import CallbackPage from "./components/callback";

// Pages & Components
import LandingPage from "./pages/LandingPage";
import LandingPagee from "./pages/landingpagee";
import ContactUs from "./pages/contactus";
import ShopGrid from './pages/shopGrid';
import ProductDetails from "./components/EquipmentPage";
import QRScanner from "./components/QRCodeComponent";
import CategoriesPage from "./pages/CategoriesPage";

import EmailVerification from "./pages/EmailVerification";
import ProfileForm from "./pages/ProfileFrom";
import BusinessDetail from "./pages/BusinessDetails";
import IdentityVerification from "./pages/identityverification";

import DocumentTypeSelection from "./components/verification/DocumentUpload";
import DocumentCapture from "./components/verification/DocumentCapture";
import FrontCapture from "./components/verification/FrontCapture";
import BackCapture from "./components/verification/BackCapture";
import SelfieCapture from "./components/verification/SelfieCapture copy";
import VerificationComplete from "./components/verification/StatusCheck";

import Dashboard from "./pages/Admin/dashbord";
import SettingsPage from "./components/Admin/settings";
import BookingComponent from "./components/Admin/Booking";
import ClientComponent from "./components/Admin/clients";
import ProductsPage from "./components/Admin/products";
import HistoryPage from "./pages/Admin/History";
import AdminProductsPage from "./components/Admininstrateur/products";
import UserManagement from "./components/Admininstrateur/UserManagement";
import AdminCategoriesPage from "./components/Admininstrateur/Categorie";
import AdminDashboard from "./components/Admininstrateur/dashbord";

import PartnerDashboard from './components/partner/dashbord';
import PartenaireClientComponent from "./components/partner/clients";
import ServicesManagement from "./components/partner/services";
import PartnerSettingsPage from "./components/partner/settings";
import PartnershipManagement from "./components/partner/partnership";

import FavoritesPage from "./components/client/favorite";
import ClientRequestsPage from "./components/client/requests";

import Contracts from "./components/contracts";
import CheckoutProcess from "./components/paymentProcess";
import ContractSigner from "./components/signature";
import AddProductForm from "./pages/AddProduct";
import ImageGallery from "./components/test";
import ClientDashboard from "./pages/Client/dashboard";
import BlogPost1 from "./components/blog1";
import BlogPost2 from "./components/blog2";
import BlogPost3 from "./components/blog3";
import ChatComponent from "./components/Messanger";
import TrackingService from "./services/TrackingService";
import Unauthorized from "./components/unauthorized";
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  useEffect(() => {
    const session_key = localStorage.getItem('session_key');
    if (!session_key) {
      const trackVisitor = async () => {
        try {
          const response = await TrackingService.visitorsinit();
          console.log(response);
        } catch (err) {
          console.error("Visitor tracking failed:", err);
        }
      };
      trackVisitor();
    }
  }, []);

  return (
    <Provider store={store}>
      
        <Router>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <ProfileNavbar />
            <div className="flex flex-1">
              <SidebarAdmin />
              <SidebarAdministrateur />
              <SidebarClient />
              <Sidebar />
              <main className="flex-1">
                <Routes>

                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/collaboration" element={<LandingPagee />} />
                  <Route path="/contact-us" element={<ContactUs />} />
                  <Route path="/shopgrid" element={<ShopGrid />} />
                  <Route path="/equipment/:productId" element={<ProductDetails />} />
                  <Route path="/qr" element={<QRScanner />} />
                  <Route path="/callback" element={<CallbackPage />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/categories/:categoryId" element={<CategoriesPage />} />
                  <Route path="/blog/blog1" element={<BlogPost1 />} />
                  <Route path="/blog/blog2" element={<BlogPost2 />} />
                  <Route path="/blog/blog3" element={<BlogPost3 />} />

                  {/* Auth Routes */}
                  <Route path="/login" element={<AuthForm />} />
                  <Route path="/register" element={<AuthForm />} />

                  {/* Registration Process */}
                  <Route element={<RegistrationProgressGuard allowedStep="step1" />}>
                    <Route path="/register/email-verification" element={<EmailVerification />} />
                  </Route>

                  <Route element={<RegistrationProgressGuard allowedStep="step2" />}>
                    <Route path="/register/profil" element={<ProfileForm />} />
                  </Route>

                  <Route element={<RegistrationProgressGuard allowedStep="step3" />}>
                    <Route path="/register/business-details" element={<BusinessDetail />} />
                  </Route>

                  <Route element={<RegistrationProgressGuard allowedStep="step4" />}>
                    <Route path="/register/identity-verification" element={<IdentityVerification />} />
                  </Route>
                  <Route path="/equipments" element={<ShopGrid />} />

                  {/* Identity Verification Steps */}
                  <Route path="/register/identity-verification/verification/document-type/:user/:local_ip" element={<DocumentTypeSelection />} />
                  <Route path="/register/identity-verification/verification/document-captured" element={<DocumentCapture />} />
                  <Route path="/register/identity-verification/verification/front-document" element={<FrontCapture />} />
                  <Route path="/register/identity-verification/verification/back-document" element={<BackCapture />} />
                  <Route path="/register/identity-verification/verification/selfie" element={<SelfieCapture />} />
                  <Route path="/register/identity-verification/verification/verification-complete" element={<VerificationComplete />} />
                  <Route path="/payment" element={<CheckoutProcess />} />
                  {/* Admin Routes */}
                  <Route path="/admin" element={<ProtectedRoute role="rental" />}>
                    <Route path="dashbord" element={<Dashboard />} />
                    <Route path="booking" element={<BookingComponent />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="clients" element={<ClientComponent />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="history" element={<HistoryPage />} />
                    <Route path="contracts" element={<Contracts />} />
                    
                  </Route>
                  <Route path="add" element={<AddProductForm />} />

                  {/* Owner Routes */}
                  <Route path="/owner" element={<ProtectedRoute role="admin" />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="categorie" element={<AdminCategoriesPage />} />
                    <Route path="products" element={<AdminProductsPage />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="history" element={<HistoryPage />} />
                    <Route path="contracts" element={<Contracts />} />
                  </Route>

                  {/* Partner Routes */}
                  <Route path="/partenaire" element={<ProtectedRoute role="partner" />}>
                    <Route index element={<PartnerDashboard />} />
                    <Route path="client" element={<PartenaireClientComponent />} />
                    <Route path="services" element={<ServicesManagement />} />
                    <Route path="partnership" element={<PartnershipManagement />} />
                    <Route path="settings" element={<PartnerSettingsPage />} />
                  </Route>

                  {/* Client Routes */}
                  <Route path="/client" element={<ProtectedRoute role="customer" />}>
                    <Route path="dashboard" element={<ClientDashboard />} />
                    <Route path="bookings" element={<BookingComponent />} />
                    <Route path="favorites" element={<FavoritesPage />} />
                    <Route path="products" element={<ProductsPage />} />
                    <Route path="clients" element={<ClientComponent />} />
                    <Route path="history" element={<HistoryPage />} />
                    <Route path="request" element={<ClientRequestsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="contracts" element={<Contracts />} />
                    <Route path="payment" element={<CheckoutProcess />} />
                    <Route path="signature" element={<ContractSigner />} />
                  </Route>
                  <Route path="signature" element={<ContractSigner />} />

                  {/* Utilities */}
                  <Route path="/register/test" element={<ImageGallery />} />
                  <Route path="/messanger" element={<ChatComponent isEquipmentChat={false} />} />
                  {/* 404 Not Found */}
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
