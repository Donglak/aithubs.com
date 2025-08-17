import { ArrowLeft, Award, Calendar, Check, ChevronRight, DollarSign, ExternalLink, Star, Users, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import VideoReviews from '../components/VideoReviews';
import { tools } from '../data/tools';
import { buildToolDetails } from '../lib/buildToolDetails';

// ------------------------------------------------------------
// 5) Page component
// ------------------------------------------------------------


const ToolDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'pricing' | 'video'>('overview');

  const toolBase = useMemo(() => tools.find(t => t.id === parseInt(id || '0')), [id]);

  if (!toolBase) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-semibold mb-3">Tool not found</div>
          <Link to="/tools" className="inline-flex items-center gap-2 text-blue-600 hover:underline">
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Link>
        </div>
      </div>
    );
  }
  const tool = useMemo(
  () => buildToolDetails(toolBase as any),
  [toolBase]
);

const relatedTools = useMemo(() => {
  if (!tool) return [];
  return tools
    .filter(t => t.id !== tool.id)
    .filter(t => {
      if (Array.isArray(t.category) && Array.isArray(tool.category)) {
        return t.category.some(cat => tool.category.includes(cat));
      }
      return t.category === tool.category;
    })
    .sort((a, b) => {
      const commonA = Array.isArray(tool.category) && Array.isArray(a.category)
        ? a.category.filter(cat => tool.category.includes(cat)).length
        : 0;
      const commonB = Array.isArray(tool.category) && Array.isArray(b.category)
        ? b.category.filter(cat => tool.category.includes(cat)).length
        : 0;
      return commonB - commonA;
    })
    .slice(0, 3);
}, [tool]);

  
  const categories = Array.isArray(tool.category) ? tool.category : [tool.category];

  return (
    <>
      <Helmet>
        <title>{tool.seo?.title ?? `${tool.name} - ${categories.join(', ')}`}</title>
        <meta name="description" content={tool.seo?.description ?? tool.description} />
        <link rel="canonical" href={tool.seo?.canonical ?? `https://aithubs.com/tools/${tool.id}`} />
        <meta property="og:title" content={`${tool.name} | DigitalToolsHub`} />
        <meta property="og:description" content={tool.seo?.description ?? tool.description} />
        <meta property="og:image" content={tool.image} />
        <meta name="robots" content="index, follow" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center gap-3">
          <Link to="/tools" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white">
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
          <div className="text-gray-400">{tool.name}</div>
        </div>

        {/* Top card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6">
              <div className="flex items-start gap-4">
                <img src={tool.image} alt={tool.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{tool.name}</h1>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <span className="inline-flex items-center gap-1"><Star className="w-4 h-4 text-yellow-500" /> {(tool.rating ?? 0).toFixed(1)} ({tool.reviews} reviews)</span>
                    <span className="inline-flex items-center gap-1"><Award className="w-4 h-4" /> {categories.join(' / ')}</span>
                    {tool.company && <span className="inline-flex items-center gap-1"><Users className="w-4 h-4" /> {tool.company}</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <a
                    href={tool.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Visit website <ExternalLink className="w-4 h-4" />
                  </a>
                  {tool.freeTrial && (
                    <div className="text-xs text-green-600 text-right">Free trial available</div>
                  )}
                </div>
              </div>

              <p className="mt-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                {tool.longDescription ?? tool.description}
              </p>

              {/* Tabs */}
              <div className="mt-6 border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex gap-6" aria-label="Tabs">
                  {['overview', 'pricing', 'video'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`pb-3 capitalize border-b-2 transition ${
                        activeTab === tab
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab panels */}
              {activeTab === 'overview' && (
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Features */}
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Key features</h3>
                    <ul className="space-y-2">
                      {tool.features?.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 mt-1 text-green-600" />
                          <span className="text-gray-700 dark:text-gray-300">{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Pros & Cons */}
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Pros</h3>
                      <ul className="space-y-2">
                        {tool.pros?.map((p, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <Check className="w-4 h-4 mt-1 text-green-600" />
                            <span className="text-gray-700 dark:text-gray-300">{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Cons</h3>
                      <ul className="space-y-2">
                        {tool.cons?.map((c, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <X className="w-4 h-4 mt-1 text-red-600" />
                            <span className="text-gray-700 dark:text-gray-300">{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'pricing' && (
                <div className="mt-6">
                  {tool.pricingTiers && tool.pricingTiers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {tool.pricingTiers.map((tier, idx) => (
                        <div key={idx} className="rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-semibold">{tier.name}</div>
                            <DollarSign className="w-4 h-4 text-gray-400" />
                          </div>
                          <div className="mt-1 text-2xl font-bold">{tier.price}</div>
                          {tier.billing && (
                            <div className="text-xs text-gray-500">Billed {tier.billing}</div>
                          )}
                          <ul className="mt-4 space-y-2">
                            {tier.features.map((f, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm">
                                <Check className="w-4 h-4 mt-0.5 text-green-600" />
                                <span className="text-gray-700 dark:text-gray-300">{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-600 dark:text-gray-300">Pricing details will be added soon.</div>
                  )}
                </div>
              )}

              {activeTab === 'video' && (
                  <div className="mt-6">
                    <VideoReviews
                      name={tool.name}
                      items={tool.videoReviews}          // <-- dữ liệu video
                      fallbackScreenshots={tool.screenshots} // fallback nếu chưa có video
                    />
                  </div>
                )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
          {/* stack dọc 2 thẻ: Info (sticky) + Related */}
        <div className="flex flex-col gap-6">
          {/* Info card (giữ nguyên nội dung cũ) */}
        <aside className="bg-white dark:bg-gray-900 rounded-2xl shadow p-6 sticky top-6">
          <div className="space-y-4">
        {/* Price and trial */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">Starting price</div>
          <div className="font-semibold">{tool.price}</div>
        </div>
        {tool.freeTrial && (
          <div className="text-xs text-green-600">Free trial available</div>
        )}

        {/* Meta */}
        <div className="grid grid-cols-3 gap-4 mt-2">
          <div>
            <div className="text-xs text-gray-500">Founded</div>
            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" /> {tool.metrics?.founded ?? '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Users</div>
            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
              <Users className="w-4 h-4 text-gray-400" /> {tool.metrics?.users ?? '—'}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500">Updated</div>
            <div className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
              <Calendar className="w-4 h-4 text-gray-400" /> {tool.metrics?.lastUpdated ?? '—'}
            </div>
          </div>
        </div>

        {/* Ideal for */}
        {tool.idealFor && tool.idealFor.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-2">Best for</div>
            <div className="flex flex-wrap gap-2">
              {tool.idealFor.map((seg, i) => (
                <span key={i} className="px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs">
                  {seg}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Integrations */}
        {tool.integrations && tool.integrations.length > 0 && (
          <div className="mt-4">
            <div className="text-sm text-gray-500 mb-2">Integrations</div>
            <div className="flex flex-wrap gap-2">
              {tool.integrations.map((name, i) => (
                <span key={i} className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-xs">
                  {name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Website button */}
        <a
          href={tool.website}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex w-full items-center justify-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
        >
          Visit website <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </aside>

    {/* Related Tools — moved to right column */}
    {relatedTools.length > 0 && (
      <aside className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
          Related Tools
        </h3>
        <div className="space-y-4">
          {relatedTools.map((relatedTool) => (
            <Link
              key={relatedTool.id}
              to={`/tools/${relatedTool.id}`}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <img
                src={relatedTool.image}
                alt={relatedTool.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
              <div className="flex-1">
                <div className="font-medium text-gray-900 dark:text-white">
                  {relatedTool.name}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {relatedTool.price}
                </div>
              </div>
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">
                  {relatedTool.rating}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    )}
  </div>
    </div>
  </div>
</div>
    </>
  );
};

export default ToolDetailPage;
