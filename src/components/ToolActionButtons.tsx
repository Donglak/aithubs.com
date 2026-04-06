import { Bookmark, Heart, Star } from 'lucide-react'
import { useToolInteraction } from '../hooks/useToolInteractions'

interface Props {
  tool: {
    slug: string
    name: string
    logo?: string
    category?: string
  }
  size?: 'sm' | 'md'
}

export default function ToolActionButtons({ tool, size = 'md' }: Props) {
  const { is_bookmarked, is_liked, is_saved, toggle, loading } = useToolInteraction(tool)

  const btnClass = size === 'sm'
    ? 'p-1.5 rounded-lg transition-all'
    : 'p-2 rounded-xl transition-all'
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'

  return (
    <div className="flex items-center gap-1" onClick={e => e.preventDefault()}>
      {/* Bookmark */}
      <button
        onClick={() => toggle('is_bookmarked')}
        disabled={loading}
        title="Bookmark"
        className={`${btnClass} ${
          is_bookmarked
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400'
            : 'text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20'
        }`}
      >
        <Bookmark className={`${iconSize} ${is_bookmarked ? 'fill-current' : ''}`} />
      </button>

      {/* Like */}
      <button
        onClick={() => toggle('is_liked')}
        disabled={loading}
        title="Like"
        className={`${btnClass} ${
          is_liked
            ? 'bg-red-100 text-red-500 dark:bg-red-900/40 dark:text-red-400'
            : 'text-gray-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20'
        }`}
      >
        <Heart className={`${iconSize} ${is_liked ? 'fill-current' : ''}`} />
      </button>

      {/* Save */}
      <button
        onClick={() => toggle('is_saved')}
        disabled={loading}
        title="Save"
        className={`${btnClass} ${
          is_saved
            ? 'bg-yellow-100 text-yellow-500 dark:bg-yellow-900/40 dark:text-yellow-400'
            : 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20'
        }`}
      >
        <Star className={`${iconSize} ${is_saved ? 'fill-current' : ''}`} />
      </button>
    </div>
  )
}