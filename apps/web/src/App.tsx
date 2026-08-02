import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { ToastProvider } from "./contexts/ToastContext";
import { AuthProvider } from "./contexts/AuthContext";
import { CartDrawer } from "./components/cart/CartDrawer";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { About, Stats } from "./components/sections/About";
import { BlogPreview } from "./components/sections/BlogPreview";
import { Contact } from "./components/sections/Contact";
import { Donation } from "./components/sections/Donation";
import { MilkSubscription } from "./components/sections/MilkSubscription";
import { Education } from "./components/sections/Education";
import { Events } from "./components/sections/Events";
import { FarmVisit } from "./components/sections/FarmVisit";
import { Gallery } from "./components/sections/Gallery";
import { Hero } from "./components/sections/Hero";
import { MissionVision } from "./components/sections/MissionVision";
import { OurCows } from "./components/sections/OurCows";
import { Products } from "./components/sections/Products";
import { Testimonials } from "./components/sections/Testimonials";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { ProtectedRoute } from "./features/auth/ProtectedRoute";
import { AccountLayout } from "./features/customer/AccountLayout";
import { AccountDashboard } from "./features/customer/AccountDashboard";
import { AccountOrdersPage } from "./features/customer/AccountOrdersPage";
import { AccountProfilePage } from "./features/customer/AccountProfilePage";
import { AccountDonationsPage } from "./features/customer/AccountDonationsPage";
import { AccountAdoptionsPage } from "./features/customer/AccountAdoptionsPage";
import { AccountSubscriptionsPage } from "./features/customer/AccountSubscriptionsPage";
import { AccountComingSoon } from "./features/customer/AccountComingSoon";
import { AdminLayout } from "./features/admin/AdminLayout";
import { AdminDashboard } from "./features/admin/AdminDashboard";
import {
  AdminAdoptionsPage,
  AdminDonationsPage,
  AdminOrdersPage,
  AdminPaymentsPage,
  AdminSubscriptionsPage,
  AdminUsersPage,
} from "./features/admin/AdminListPages";
import { AdminProductsPage } from "./features/admin/AdminProductsPage";
import { FarmLayout } from "./features/farm/FarmLayout";
import { FarmDashboard } from "./features/farm/FarmDashboard";
import { FarmCowsPage } from "./features/farm/FarmCowsPage";
import { FarmMilkPage } from "./features/farm/FarmMilkPage";
import { FarmHealthPage } from "./features/farm/FarmHealthPage";
import { FarmFeedPage } from "./features/farm/FarmFeedPage";
import { FarmVaccinationsPage } from "./features/farm/FarmVaccinationsPage";
import { FarmReportsPage } from "./features/farm/FarmReportsPage";
import { InventoryLayout } from "./features/inventory/InventoryLayout";
import { InventoryDashboard } from "./features/inventory/InventoryDashboard";
import { InventoryItemsPage } from "./features/inventory/InventoryItemsPage";
import { InventoryMovementsPage } from "./features/inventory/InventoryMovementsPage";

function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Stats />
        <About />
        <MissionVision />
        <OurCows />
        <Products />
        <Donation />
        <MilkSubscription />
        <FarmVisit />
        <Events />
        <Education />
        <Gallery />
        <Testimonials />
        <BlogPreview />
        <Contact />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/account"
                element={
                  <ProtectedRoute>
                    <AccountLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AccountDashboard />} />
                <Route path="orders" element={<AccountOrdersPage />} />
                <Route path="profile" element={<AccountProfilePage />} />
                <Route path="wishlist" element={<AccountComingSoon title="Wishlist" />} />
                <Route path="donations" element={<AccountDonationsPage />} />
                <Route path="adoptions" element={<AccountAdoptionsPage />} />
                <Route path="subscriptions" element={<AccountSubscriptionsPage />} />
                <Route
                  path="notifications"
                  element={<AccountComingSoon title="Notifications" />}
                />
              </Route>
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={["admin", "super_admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="donations" element={<AdminDonationsPage />} />
                <Route path="adoptions" element={<AdminAdoptionsPage />} />
                <Route path="subscriptions" element={<AdminSubscriptionsPage />} />
                <Route path="payments" element={<AdminPaymentsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
              </Route>
              <Route
                path="/farm"
                element={
                  <ProtectedRoute
                    roles={["farm_staff", "veterinary_doctor", "admin", "super_admin"]}
                  >
                    <FarmLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<FarmDashboard />} />
                <Route path="cows" element={<FarmCowsPage />} />
                <Route path="milk" element={<FarmMilkPage />} />
                <Route path="health" element={<FarmHealthPage />} />
                <Route path="feed" element={<FarmFeedPage />} />
                <Route path="vaccinations" element={<FarmVaccinationsPage />} />
                <Route path="reports" element={<FarmReportsPage />} />
              </Route>
              <Route
                path="/inventory"
                element={
                  <ProtectedRoute
                    roles={["inventory_manager", "admin", "super_admin"]}
                  >
                    <InventoryLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<InventoryDashboard />} />
                <Route path="items" element={<InventoryItemsPage />} />
                <Route
                  path="low-stock"
                  element={<InventoryItemsPage lowStockOnly />}
                />
                <Route path="movements" element={<InventoryMovementsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
