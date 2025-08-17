import { useEffect } from 'react';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Header from './components/Header';
import PopupManager from './components/PopupManager';
import ScrollToTop from './components/ScrollToTop';
import AboutPage from './pages/AboutPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import ContactPage from './pages/ContactPage';
import HomePage from './pages/HomePage';
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
            <Route path="/tools/:id" element={<ToolDetailPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
          </Routes>
        </main>
        <Footer />
        <PopupManager />
      </div>
    </Router>
  );
}
