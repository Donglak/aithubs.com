import { Bookmark, ExternalLink, Heart, Loader2, Star } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useUserLibrary } from '../hooks/useToolInteractions'

type Tab = 'saved' | 'bookmarked' | 'liked'

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth()
  const { bookmarked, liked, saved, loading } = useUserLibrary()
  const [activeTab, setActiveTab] = useState<Tab>('saved')

  // Chưa đăng nhập → redirect login
  if (!authLoading && !user) return <Navigate to="/login" replace />

  const tabs: { key: Tab; label: string; icon: any; data: any[]; color: string }[] = [
    { key: 'saved',       label: 'Saved',      icon: Star,     data: saved,      color: 'text-yellow-500' },
    { key: 'bookmarked',  label: 'Bookmarked', icon: Bookmark, data: bookmarked, color: 'text-blue-500'   },
    { key: 'liked',       label: 'Liked',      icon: Heart,    data: liked,      color: 'text-red-500'    },
  ]

  const currentData = tabs.find(t => t.key === activeTab)?.data || []

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header profile */}
        <div className="flex items-center gap-4 mb-8">
          <img
            src={user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user?.email}`}
            alt="avatar"
            referrerPolicy="no-referrer"
            className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
          />
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user?.user_metadata?.full_name || 'My Dashboard'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {tabs.map(tab => (
            <div key={tab.key} className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center shadow-sm border border-gray-100 dark:border-gray-700">
              <tab.icon className={`w-6 h-6 ${tab.color} mx-auto mb-1`} />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{tab.data.length}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{tab.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-primary-600 text-white shadow'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                activeTab === tab.key
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500'
              }`}>
                {tab.data.length}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          </div>
        ) : currentData.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            {(() => {
              const tab = tabs.find(t => t.key === activeTab)!
              return (
                <>
                  <tab.icon className={`w-12 h-12 ${tab.color} mx-auto mb-4 opacity-30`} />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    No tools available in the "{tab.label}" section
                  </p>
                  <Link
                    to="/tools"
                    className="inline-block bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    explore tools
                  </Link>
                </>
              )
            })()}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentData.map(item => (
              <Link
                key={item.tool_slug}
                to={`/tools/${item.tool_slug}`}
                className="group bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {item.tool_logo ? (
                      <img src={item.tool_logo} alt={item.tool_name} className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg">
                        {item.tool_name[0]}
                      </div>
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm group-hover:text-primary-600 transition-colors">
                        {item.tool_name}
                      </h3>
                      <span className="text-xs text-gray-400">{item.tool_category || 'AI Tool'}</span>
                    </div>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-primary-500 transition-colors flex-shrink-0" />
                </div>

                {/* Badge trạng thái */}
                <div className="flex gap-1.5 flex-wrap">
                  {item.is_saved && (
                    <span className="flex items-center gap-1 text-xs bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 px-2 py-0.5 rounded-full border border-yellow-100 dark:border-yellow-800">
                      <Star className="w-3 h-3 fill-current" /> Saved
                    </span>
                  )}
                  {item.is_bookmarked && (
                    <span className="flex items-center gap-1 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-100 dark:border-blue-800">
                      <Bookmark className="w-3 h-3 fill-current" /> Bookmark
                    </span>
                  )}
                  {item.is_liked && (
                    <span className="flex items-center gap-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 px-2 py-0.5 rounded-full border border-red-100 dark:border-red-800">
                      <Heart className="w-3 h-3 fill-current" /> Liked
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}