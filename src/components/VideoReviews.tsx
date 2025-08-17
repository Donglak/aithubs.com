
type VideoItem = {
  title: string;
  url: string;          // link YouTube (watch?v=..., youtu.be/..., shorts/...)
  channel?: string;
  publishedAt?: string;
};

function getYouTubeId(url: string): string | null {
  try {
    const u = new URL(url);
    // youtube.com/watch?v=xxxx
    if (u.hostname.includes("youtube.com")) {
      if (u.pathname.startsWith("/watch")) return u.searchParams.get("v");
      // shorts
      const mShorts = u.pathname.match(/^\/shorts\/([^/?#]+)/);
      if (mShorts) return mShorts[1];
      // embed
      const mEmbed = u.pathname.match(/^\/embed\/([^/?#]+)/);
      if (mEmbed) return mEmbed[1];
    }
    // youtu.be/xxxx
    if (u.hostname.includes("youtu.be")) {
      const m = u.pathname.match(/^\/([^/?#]+)/);
      if (m) return m[1];
    }
    return null;
  } catch {
    return null;
  }
}

export default function VideoReviews({
  name,
  items,
  fallbackScreenshots,
}: {
  name: string;
  items?: VideoItem[];
  fallbackScreenshots?: string[];
}) {
  const vids = (items || [])
    .map(v => ({ ...v, id: getYouTubeId(v.url) }))
    .filter(v => !!v.id) as (VideoItem & { id: string })[];

  if (vids.length === 0) {
    // fallback: hiển thị ảnh cũ nếu chưa có video
    if (fallbackScreenshots && fallbackScreenshots.length > 0) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
          {fallbackScreenshots.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${name} screenshot ${i + 1}`}
              className="w-full h-56 object-cover rounded-xl"
              loading="lazy"
            />
          ))}
        </div>
      );
    }
    return <div className="text-gray-500">Video comming soon</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-6">
      {vids.map(v => (
        <article key={v.id} className="space-y-2">
          <div className="w-full aspect-video rounded-xl overflow-hidden">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${v.id}`}
              title={v.title || `YouTube video ${v.id}`}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          <h4 className="text-sm font-medium line-clamp-2">{v.title}</h4>
          {v.channel && (
            <div className="text-xs text-gray-500">
              {v.channel} {v.publishedAt ? `• ${v.publishedAt}` : ""}
            </div>
          )}
        </article>
      ))}
    </div>
  );
}
