import { Loader2, Save, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useVendorContext } from "../../contexts/VendorContext";
import { vendorDb } from "../../lib/supabase";
import {
  defaultProductForm,
  type ProductCategory,
  type ProductFormData,
  type PriceModel,
} from "../../types/vendor";

export default function VendorProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { vendor } = useVendorContext();
  const isEdit = !!id;

  const [form, setForm] = useState<ProductFormData>(defaultProductForm);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [tagInput, setTagInput] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    vendorDb
      .from("product_categories")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .then(({ data }) => setCategories((data || []) as ProductCategory[]));
  }, []);

  useEffect(() => {
    if (!id || !vendor) return;
    setLoading(true);
    vendorDb
      .from("digital_products")
      .select("*, media:digital_product_media(*)")
      .eq("id", id)
      .eq("vendor_id", vendor.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          const p = data as any;
          setForm({
            title: p.title || "",
            slug: p.slug || "",
            short_description: p.short_description || "",
            full_description: p.full_description || "",
            category_id: p.category_id || "",
            tags: p.tags || [],
            price_model: p.price_model || "paid",
            price: p.price?.toString() || "",
            external_sales_link: p.external_sales_link || "",
            demo_url: p.demo_url || "",
            cover_image: p.cover_image || "",
            seo_title: p.seo_title || "",
            seo_description: p.seo_description || "",
            media: (p.media || []).map((m: any) => ({
              url: m.url,
              type: m.type,
              alt_text: m.alt_text,
            })),
          });
        }
        setLoading(false);
      });
  }, [id, vendor]);

  const update = (field: keyof ProductFormData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const autoSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      update("tags", [...form.tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    update(
      "tags",
      form.tags.filter((t) => t !== tag),
    );
  };

  const addMedia = () => {
    update("media", [...form.media, { url: "", type: "image", alt_text: "" }]);
  };

  const updateMedia = (index: number, field: string, value: string) => {
    const media = [...form.media];
    media[index] = { ...media[index], [field]: value };
    update("media", media);
  };

  const removeMedia = (index: number) => {
    update(
      "media",
      form.media.filter((_, i) => i !== index),
    );
  };

  const handleSave = async (status: "draft" | "submitted") => {
    if (!vendor) return;
    setSaving(true);
    setMessage(null);

    const slug = form.slug || autoSlug(form.title);

    const payload = {
      vendor_id: vendor.id,
      title: form.title,
      slug,
      short_description: form.short_description || null,
      full_description: form.full_description || null,
      category_id: form.category_id || null,
      tags: form.tags,
      price_model: form.price_model,
      price: form.price ? parseFloat(form.price) : null,
      external_sales_link: form.external_sales_link || null,
      demo_url: form.demo_url || null,
      cover_image: form.cover_image || null,
      seo_title: form.seo_title || null,
      seo_description: form.seo_description || null,
      status,
    };

    try {
      if (isEdit) {
        const { error } = await vendorDb
          .from("digital_products")
          .update(payload)
          .eq("id", id)
          .eq("vendor_id", vendor.id);
        if (error) throw error;
      } else {
        const { error } = await vendorDb
          .from("digital_products")
          .insert(payload);
        if (error) throw error;
      }

      setMessage({
        type: "success",
        text: status === "draft" ? "Draft saved." : "Submitted for review.",
      });
      setTimeout(() => navigate("/vendor/products"), 1000);
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Failed to save product.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 bg-white dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const inputClass =
    "w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2.5 text-gray-900 dark:text-white text-sm placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  const sectionClass =
    "bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6";

  const headingClass = "text-lg font-semibold text-gray-900 dark:text-white mb-4";

  const labelLightClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? "Edit Product" : "Add New Product"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          {isEdit
            ? "Update your product listing"
            : "Create a new digital product listing"}
        </p>
      </div>

      {message && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Basic Info */}
        <section className={sectionClass}>
          <h2 className={headingClass}>Basic Information</h2>
          <div className="space-y-4">
            <div>
              <label className={labelLightClass}>Title *</label>
              <input
                className={inputClass}
                value={form.title}
                onChange={(e) => {
                  update("title", e.target.value);
                  if (!isEdit) update("slug", autoSlug(e.target.value));
                }}
                placeholder="Product title"
              />
            </div>
            <div>
              <label className={labelLightClass}>Slug *</label>
              <input
                className={inputClass}
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="product-slug"
              />
            </div>
            <div>
              <label className={labelLightClass}>Short Description</label>
              <textarea
                className={`${inputClass} h-20 resize-none`}
                value={form.short_description}
                onChange={(e) => update("short_description", e.target.value)}
                placeholder="Brief description (max 160 characters)"
                maxLength={160}
              />
            </div>
            <div>
              <label className={labelLightClass}>Full Description</label>
              <textarea
                className={`${inputClass} h-32 resize-none`}
                value={form.full_description}
                onChange={(e) => update("full_description", e.target.value)}
                placeholder="Detailed description. HTML or markdown supported."
              />
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className={sectionClass}>
          <h2 className={headingClass}>Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelLightClass}>Price Model *</label>
              <select
                className={inputClass}
                value={form.price_model}
                onChange={(e) =>
                  update("price_model", e.target.value as PriceModel)
                }
              >
                <option value="paid">Paid</option>
                <option value="free">Free</option>
                <option value="freemium">Freemium</option>
                <option value="contact">Contact for Price</option>
              </select>
            </div>
            {(form.price_model === "paid" ||
              form.price_model === "freemium") && (
              <div>
                <label className={labelLightClass}>Price ($)</label>
                <input
                  className={inputClass}
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => update("price", e.target.value)}
                  placeholder="9.99"
                />
              </div>
            )}
            <div className="md:col-span-2">
              <label className={labelLightClass}>External Sales Link</label>
              <input
                className={inputClass}
                value={form.external_sales_link}
                onChange={(e) => update("external_sales_link", e.target.value)}
                placeholder="https://gumroad.com/l/your-product"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelLightClass}>Demo URL</label>
              <input
                className={inputClass}
                value={form.demo_url}
                onChange={(e) => update("demo_url", e.target.value)}
                placeholder="https://your-demo.com"
              />
            </div>
          </div>
        </section>

        {/* Media */}
        <section className={sectionClass}>
          <h2 className={headingClass}>Media</h2>
          <div className="space-y-3">
            <div>
              <label className={labelLightClass}>Cover Image URL</label>
              <input
                className={inputClass}
                value={form.cover_image}
                onChange={(e) => update("cover_image", e.target.value)}
                placeholder="https://example.com/cover-image.png"
              />
              {form.cover_image && (
                <img
                  src={form.cover_image}
                  alt=""
                  className="mt-2 w-full h-32 rounded-lg object-cover"
                />
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <label className={labelLightClass}>Gallery</label>
              <button
                type="button"
                onClick={addMedia}
                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300"
              >
                + Add Image
              </button>
            </div>
            {form.media.map((m, i) => (
              <div key={i} className="flex gap-2 items-start">
                <input
                  className={inputClass}
                  value={m.url}
                  onChange={(e) => updateMedia(i, "url", e.target.value)}
                  placeholder="Image URL"
                />
                <input
                  className={`${inputClass} w-40`}
                  value={m.alt_text}
                  onChange={(e) => updateMedia(i, "alt_text", e.target.value)}
                  placeholder="Alt text"
                />
                <button
                  type="button"
                  onClick={() => removeMedia(i)}
                  className="p-2.5 text-red-600 dark:text-red-400 hover:text-red-500 dark:hover:text-red-300"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Categorization */}
        <section className={sectionClass}>
          <h2 className={headingClass}>Categorization</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelLightClass}>Category</label>
              <select
                className={inputClass}
                value={form.category_id}
                onChange={(e) => update("category_id", e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelLightClass}>Tags</label>
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Add tag and press Enter"
                />
              </div>
              {form.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-xs bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 px-2 py-1 rounded-full"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:text-primary-900 dark:hover:text-primary-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SEO */}
        <section className={sectionClass}>
          <h2 className={headingClass}>SEO</h2>
          <div className="space-y-4">
            <div>
              <label className={labelLightClass}>SEO Title</label>
              <input
                className={inputClass}
                value={form.seo_title}
                onChange={(e) => update("seo_title", e.target.value)}
                placeholder="Product Name - AIThub"
              />
            </div>
            <div>
              <label className={labelLightClass}>SEO Description</label>
              <textarea
                className={`${inputClass} h-20 resize-none`}
                value={form.seo_description}
                onChange={(e) => update("seo_description", e.target.value)}
                placeholder="SEO meta description..."
              />
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => handleSave("draft")}
            disabled={saving || !form.title}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save as Draft
          </button>
          <button
            onClick={() => handleSave("submitted")}
            disabled={saving || !form.title}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Submit for Review
          </button>
        </div>
      </div>
    </div>
  );
}