import { ArrowLeft, ArrowRight, ExternalLink, Tag } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { activeDealForTool } from "../data/deals";
import { TOOL_REVIEWS, VERDICT_LABELS } from "../data/reviews";
import { tools } from "../data/tools";
import { USE_CASES } from "../data/useCases";
import { toSlug } from "../utils/slug";

function UseCaseList() {
  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-gray-900">
      <Helmet>
        <title>AI Tool Stacks for Making Money Online | AIThubs</title>
        <meta
          name="description"
          content="Ready-made AI tool stacks for faceless YouTube, Etsy and print on demand, affiliate blogging, freelancing and side hustles."
        />
        <link rel="canonical" href="https://aithubs.com/use-cases" />
      </Helmet>
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
          AI tool stacks for making money online
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl">
          Pick how you earn. We list the tools that do each job in the workflow, so you only pay for what you need.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {USE_CASES.map((u) => (
            <Link
              key={u.slug}
              to={`/use-cases/${u.slug}`}
              className="group rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:border-primary-400 hover:shadow-md transition-all"
            >
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {u.title}
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{u.description}</p>
              <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400">
                {u.steps.length} tools <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function UseCasesPage() {
  const { slug } = useParams();
  if (!slug) return <UseCaseList />;

  const useCase = USE_CASES.find((u) => u.slug === slug);
  if (!useCase) {
    return (
      <div className="pt-24 min-h-screen bg-white dark:bg-gray-900 text-center px-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stack not found</h1>
        <Link to="/use-cases" className="mt-4 inline-block text-primary-600 underline">
          See all tool stacks
        </Link>
      </div>
    );
  }

  const others = USE_CASES.filter((u) => u.slug !== useCase.slug);

  return (
    <div className="pt-16 min-h-screen bg-white dark:bg-gray-900">
      <Helmet>
        <title>{`${useCase.title} (${new Date().getFullYear()}) | AIThubs`}</title>
        <meta name="description" content={useCase.description} />
        <link rel="canonical" href={`https://aithubs.com/use-cases/${useCase.slug}`} />
      </Helmet>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link
          to="/use-cases"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> All tool stacks
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">{useCase.title}</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-10">{useCase.intro}</p>

        <ol className="space-y-4">
          {useCase.steps.map((step, i) => {
            const tool = tools.find((t) => t.id === step.toolId);
            if (!tool) return null;
            const review = TOOL_REVIEWS[tool.id];
            const deal = activeDealForTool(tool.id);
            return (
              <li
                key={`${step.role}-${tool.id}`}
                className="flex gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 p-5"
              >
                <span className="flex items-center justify-center w-8 h-8 shrink-0 rounded-full bg-primary-600 text-white text-sm font-semibold">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-400">
                    {step.role}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <img src={tool.image} alt="" className="w-6 h-6 rounded" loading="lazy" />
                    <Link
                      to={`/tools/${toSlug(tool.name)}`}
                      className="text-lg font-semibold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400"
                    >
                      {tool.name}
                    </Link>
                    {review && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        Verdict: {VERDICT_LABELS[review.verdict]}
                      </span>
                    )}
                    {deal && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                        <Tag className="w-3 h-3" /> {deal.headline}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-gray-700 dark:text-gray-300">{step.why}</p>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Price: {review?.realMonthlyCost ?? tool.price}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm">
                    <Link
                      to={`/tools/${toSlug(tool.name)}`}
                      className="font-medium text-primary-600 dark:text-primary-400 hover:underline"
                    >
                      Read the review
                    </Link>
                    {tool.website && (
                      <a
                        href={tool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:underline"
                      >
                        Visit website <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>

        <p className="mt-8 text-xs text-gray-500 dark:text-gray-400">
          Some links are affiliate links. We may earn a commission at no extra cost to you. It never changes which
          tools we recommend.
        </p>

        <section className="mt-12">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Other tool stacks</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {others.map((u) => (
              <Link
                key={u.slug}
                to={`/use-cases/${u.slug}`}
                className="flex items-center justify-between gap-2 rounded-xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-sm font-medium text-gray-900 dark:text-white hover:border-primary-400"
              >
                {u.title}
                <ArrowRight className="w-4 h-4 shrink-0 text-primary-600" />
              </Link>
            ))}
          </div>
        </section>
      </article>
    </div>
  );
}
