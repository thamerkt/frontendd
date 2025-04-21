import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthForm from "./components/authentication";
import Navbar from "./components/navbar";
import Sidebar from "./components/sidebar";
import Login from "./components/login";
import EmailVerification from "./pages/EmailVerification";
import BusinessDetail from "./pages/BusinessDetails";
import ContactUs from "./pages/contactus";
import Home from "./pages/Home";
import IdentityVerification from "./pages/identityverification";
import ProfileForm from "./pages/ProfileFrom";
import Dashboard from "./pages/Admin/dashbord";
import SettingsPage from "./components/Admin/settings";
import BookingComponent from "./components/Admin/Booking";
import SidebarAdmin from "./components/Admin/sidebar"
import ClientComponent from "./components/Admin/clients"
import ProductsPage from "./components/Admin/products";
import LandingPage from "./pages/LandingPage";
import History from "./pages/Admin/History";
import HistoryPage from "./pages/HistoryPage";
import CallbackPage from "./components/callback";
import LandingPagee from "./pages/landingpagee";
import QRScanner from "./components/QRCodeComponent";
import ProductDetails from "./components/EquipmentPage";
import AddProductForm from "./pages/AddProduct";
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
import ShopGrid from './pages/shopGrid'
import PartnerDashboard from './components/Partenaire/dashbord'
import PartenaireClientComponent from "./components/Partenaire/clients";
import RegistrationProgressGuard from "./components/RegistrationProgressGuard";
import unauthorized from "./components/unauthorized";
import RoleRoute from "./components/RoleRoute"
import CheckoutProcess from "./components/paymentProcess"
import ContractSigner from "./components/signature"
import ServicesManagement from "./components/Partenaire/services";
import PartnerSettingsPage from "./components/Partenaire/settings"
import ProcessGuard from "./components/utils/ProcessGuard"
const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <div className="min-h-screen flex flex-col">
          {/* Navbar */}

          <div className="flex">


            <div className="flex flex-1">
              {/* Sidebar */}
              <Sidebar />
              {/* Sidebar */}
              <SidebarAdmin />




              {/* Main Content */}
              <main className="flex-1 p-4">

                <Routes>
                  <Route path="/collaboration" element={<LandingPagee />} />
                  <Route path="/register/" element={<AuthForm />} />
                  <Route path="/shopgrid/" element={<ShopGrid />} />
                  <Route path="/login/" element={<AuthForm />} />
                  <Route path="/unauthorized" element={<unauthorized />} />
                  <Route path="/signature" element={<ContractSigner />} />
                  <Route path="/partenaire" element={<PartnerDashboard />} />
                  <Route path="/partenaire/services" element={<ServicesManagement />} />
                  <Route path="/partenaire/client" element={<PartenaireClientComponent />} />
                  <Route path="/partenaire/settings" element={<PartnerSettingsPage />} />
                  {/* CUSTOMER ONLY */}
                  <Route path="/register" element={<ProcessGuard />}>
  <Route path="email-verification" element={<EmailVerification />} />
  <Route path="profil" element={<ProfileForm />} />
  <Route path="business-details" element={<BusinessDetail />} />
  <Route path="identity-verification" element={<IdentityVerification />} />
</Route>
                  <Route
                    path="/register/identity-verification/verification/document-type"
                    element={
                      <DocumentTypeSelection />

                    } />
                  <Route
                    path="/register/identity-verification/verification/document-captured"
                    element={
                      <DocumentCapture />

                    } />

                  <Route
                    path="/register/identity-verification/verification/front-document/:user"
                    element={

                      <FrontCapture />

                    }

                  />
                  <Route
                    path="/payment"
                    element={

                      <CheckoutProcess />

                    }

                  />
                  <Route
                    path="/register/identity-verification/verification/back-document"
                    element={

                      <BackCapture />

                    }
                  />
                  <Route
                    path="/register/identity-verification/verification/selfie"
                    element={

                      <SelfieCapture />

                    }
                  />
                  <Route
                    path="/register/identity-verification/verification/verification-complete"
                    element={

                      <VerificationComplete />

                    }
                  />
                  {/* END CUSTOMER ONLY */}

                  <Route path="/register/test/" element={<ImageGallery />} />
                  <Route path="/equipment/" element={<ProductDetails />} />
                  <Route path="/qr" element={<QRScanner />} />
                  <Route path="/add" element={<AddProductForm />} />
                  <Route path="/contact-us" element={<ContactUs />} />
                  <Route path="/callback" element={<CallbackPage />} />

                  {/* Admin routes (not protected yet) */}
                  <Route path="/admin/dashbord" element={<Dashboard />} />
                  <Route path="/admin/booking" element={<BookingComponent />} />
                  <Route path="/admin/products" element={<ProductsPage />} />
                  <Route path="/admin/clients" element={<ClientComponent />} />
                  <Route path="/admin/history" element={<HistoryPage />} />
                  <Route path="/" element={<LandingPage />} />

                  {/* Fallback for unauthorized */}
                  <Route path="/unauthorized" element={<h1>403 - Unauthorized</h1>} />




                </Routes>
              </main>
            </div>
          </div>
        </div>
      </Router>
    </Provider>
  );
};

export default App;
