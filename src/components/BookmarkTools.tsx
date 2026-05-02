import { useState, useEffect } from 'react';
import { Bookmark, BookmarkCheck, X } from 'lucide-react';
import { Tool } from '../data/tools';

interface BookmarkToolsProps {
  tool: Tool;
  size?: 'sm' | 'md' | 'lg';
}

const BookmarkTools: React.FC<BookmarkToolsProps> = ({ tool, size = 'md' }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    // Check if tool is bookmarked on mount
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedTools') || '[]');
    setIsBookmarked(bookmarks.includes(tool.id));
  }, [tool.id]);

  const toggleBookmark = () => {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarkedTools') || '[]');
    const newBookmarks = isBookmarked
      ? bookmarks.filter((id: number) => id !== tool.id)
      : [...bookmarks, tool.id];

    localStorage.setItem('bookmarkedTools', JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);

    // Show toast notification
    showToast(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks');
  };

  const showToast = (message: string) => {
    // Simple toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  };

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  return (
    <button
      onClick={toggleBookmark}
      className={`flex items-center justify-center ${sizeClasses[size]} rounded-lg transition-all ${
        isBookmarked
          ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 hover:bg-primary-200 dark:hover:bg-primary-900/50'
          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
      }`}
      title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
    >
      {isBookmarked ? (
        <BookmarkCheck size={iconSize[size]} className="fill-current" />
      ) : (
        <Bookmark size={iconSize[size]} />
      )}
    </button>
  );
};

export default BookmarkTools;