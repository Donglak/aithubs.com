<<<<<<< HEAD
import { Suspense, lazy } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import PopupManager from "./components/PopupManager";
import ScrollToTop from "./components/ScrollToTop";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ChatBotButton } from "./components/ChatBot";

// Lazy load page components for code splitting
const HomePage = lazy(() => import("./pages/HomePage"));
const ToolsPage = lazy(() => import("./pages/ToolsPage"));
const ToolDetailPage = lazy(() => import("./pages/ToolDetailPage"));
const BlogPage = lazy(() => import("./pages/BlogPage"));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage"));
const AuthorPage = lazy(() => import("./pages/AuthorPage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const EbooksPage = lazy(() => import("./pages/EbooksPage"));
const BecomeVendorPage = lazy(() => import("./pages/BecomeVendorPage"));
const VendorStorefrontPage = lazy(() => import("./pages/VendorStorefrontPage"));
const ProductDetailPage = lazy(() => import("./pages/ProductDetailPage"));

// Vendor workspace (lazy)
const VendorLayout = lazy(() => import("./components/vendor/VendorLayout"));
const VendorDashboardPage = lazy(
  () => import("./pages/vendor/VendorDashboardPage"),
);
const VendorProfilePage = lazy(
  () => import("./pages/vendor/VendorProfilePage"),
);
const VendorProductsPage = lazy(
  () => import("./pages/vendor/VendorProductsPage"),
);
const VendorProductFormPage = lazy(
  () => import("./pages/vendor/VendorProductFormPage"),
);
const VendorAnalyticsPage = lazy(
  () => import("./pages/vendor/VendorAnalyticsPage"),
);
const VendorLeadsPage = lazy(() => import("./pages/vendor/VendorLeadsPage"));
const VendorSubscriptionPage = lazy(
  () => import("./pages/vendor/VendorSubscriptionPage"),
);
const VendorSettingsPage = lazy(
  () => import("./pages/vendor/VendorSettingsPage"),
);
const ProtectedRoute = lazy(() => import("./components/vendor/ProtectedRoute"));

// Admin pages (lazy)
const AdminVendorsPage = lazy(() => import("./pages/admin/AdminVendorsPage"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage"));

// Loading fallback component
function PageLoading() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          <Header />
          <main>
            <ScrollToTop />

            <Suspense fallback={<PageLoading />}>
              <ChatBotButton autoOpenDelay={30000} openOnScroll={0.7} />
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/tools" element={<ToolsPage />} />
                <Route path="/tools/:slug" element={<ToolDetailPage />} />
                <Route path="/blog" element={<BlogPage />} />
                <Route path="/courses" element={<CoursesPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />
                <Route path="/author/:slug" element={<AuthorPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/ebooks" element={<EbooksPage />} />

                {/* Vendor public pages */}
                <Route path="/become-vendor" element={<BecomeVendorPage />} />
                <Route
                  path="/vendors/:slug"
                  element={<VendorStorefrontPage />}
                />
                <Route path="/products/:slug" element={<ProductDetailPage />} />

                {/* Vendor workspace (protected) */}
                <Route
                  path="/vendor"
                  element={
                    <ProtectedRoute>
                      <VendorLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<VendorDashboardPage />} />
                  <Route path="profile" element={<VendorProfilePage />} />
                  <Route path="products" element={<VendorProductsPage />} />
                  <Route
                    path="products/new"
                    element={<VendorProductFormPage />}
                  />
                  <Route
                    path="products/:id/edit"
                    element={<VendorProductFormPage />}
                  />
                  <Route path="analytics" element={<VendorAnalyticsPage />} />
                  <Route path="leads" element={<VendorLeadsPage />} />
                  <Route
                    path="subscription"
                    element={<VendorSubscriptionPage />}
                  />
                  <Route path="settings" element={<VendorSettingsPage />} />
                </Route>

                {/* Admin pages */}
                <Route path="/admin/vendors" element={<AdminVendorsPage />} />
                <Route path="/admin/products" element={<AdminProductsPage />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <PopupManager />
        </div>
      </Router>
    </ThemeProvider>
=======
import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import PopupManager from './components/PopupManager';
import ScrollToTop from './components/ScrollToTop';
import AboutPage from './pages/AboutPage';
import AuthorPage from './pages/AuthorPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import BookmarksPage from './pages/BookmarksPage';
import ContactPage from './pages/ContactPage';
import CoursesPage from './pages/CoursesPage';
import DashboardPage from './pages/DashboardPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import ToolDetailPage from './pages/ToolDetailPage';
import ToolsPage from './pages/ToolsPage';


export default function App() {
  // Always force dark mode
  useEffect(() => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  const darkMode = true;
  const toggleDarkMode = () => {}; // disabled

  return (
    <Router>
      {/* Only dark styling */}
      <div className="min-h-screen bg-gray-900 text-gray-100 transition-colors duration-300">
        <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />
        <main>
          <ScrollToTop />
          
            <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/tools/:slug" element={<ToolDetailPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/author/:slug" element={<AuthorPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/bookmarks" element={<BookmarksPage />} />
            </Routes>
          
        </main>
        <Footer />
        <PopupManager />
      </div>
    </Router>
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
  );
}
