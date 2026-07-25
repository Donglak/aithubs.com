import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { useVendorContext } from "../../contexts/VendorContext";
import { vendorDb } from "../../lib/supabase";
import {
  defaultVendorProfileForm,
  type VendorProfileFormData,
} from "../../types/vendor";

export default function VendorProfilePage() {
  const { vendor, loading, refresh } = useVendorContext();
  const [form, setForm] = useState<VendorProfileFormData>(
    defaultVendorProfileForm,
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    if (vendor) {
      const social = vendor.social_links || {};
      setForm({
        brand_name: vendor.brand_name || "",
        slug: vendor.slug || "",
        bio: vendor.bio || "",
        website: vendor.website || "",
        support_email: vendor.support_email || "",
        contact_email: vendor.contact_email || "",
        logo_url: vendor.logo_url || "",
        cover_url: vendor.cover_url || "",
        facebook_url: social.facebook || "",
        x_url: social.x || social.twitter || "",
        linkedin_url: social.linkedin || "",
        youtube_url: social.youtube || "",
        instagram_url: social.instagram || "",
        discord_url: social.discord || "",
        seo_title: vendor.seo_title || "",
        seo_description: vendor.seo_description || "",
      });
    }
  }, [vendor]);

  const update = (field: keyof VendorProfileFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!vendor) return;
    setSaving(true);
    setMessage(null);

    try {
      const socialLinks: Record<string, string> = {};
      if (form.facebook_url) socialLinks.facebook = form.facebook_url;
      if (form.x_url) socialLinks.x = form.x_url;
      if (form.linkedin_url) socialLinks.linkedin = form.linkedin_url;
      if (form.youtube_url) socialLinks.youtube = form.youtube_url;
      if (form.instagram_url) socialLinks.instagram = form.instagram_url;
      if (form.discord_url) socialLinks.discord = form.discord_url;

      const { error } = await vendorDb
        .from("vendors")
        .update({
          brand_name: form.brand_name,
          slug: form.slug,
          bio: form.bio,
          website: form.website || null,
          support_email: form.support_email || null,
          contact_email: form.contact_email || null,
          logo_url: form.logo_url || null,
          cover_url: form.cover_url || null,
          social_links: socialLinks,
          seo_title: form.seo_title || null,
          seo_description: form.seo_description || null,
        })
        .eq("id", vendor.id);

      if (error) throw error;

      setMessage({ type: "success", text: "Profile updated successfully." });
      refresh();
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err?.message || "Failed to update profile.",
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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
          Manage your public vendor profile
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
        {/* Brand Info */}
        <section className={sectionClass}>
          <h2 className={headingClass}>Brand Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelLightClass}>Brand Name *</label>
              <input
                className={inputClass}
                value={form.brand_name}
                onChange={(e) => update("brand_name", e.target.value)}
                placeholder="Your brand name"
              />
            </div>
            <div>
              <label className={labelLightClass}>Slug *</label>
              <input
                className={inputClass}
                value={form.slug}
                onChange={(e) => update("slug", e.target.value)}
                placeholder="your-brand-slug"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelLightClass}>Bio</label>
              <textarea
                className={`${inputClass} h-24 resize-none`}
                value={form.bio}
                onChange={(e) => update("bio", e.target.value)}
                placeholder="Tell visitors about your brand..."
              />
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className={sectionClass}>
          <h2 className={headingClass}>Contact Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelLightClass}>Website</label>
              <input
                className={inputClass}
                value={form.website}
                onChange={(e) => update("website", e.target.value)}
                placeholder="https://yourwebsite.com"
              />
            </div>
            <div>
              <label className={labelLightClass}>Support Email</label>
              <input
                className={inputClass}
                value={form.support_email}
                onChange={(e) => update("support_email", e.target.value)}
                placeholder="support@yourbrand.com"
              />
            </div>
            <div>
              <label className={labelLightClass}>Contact Email</label>
              <input
                className={inputClass}
                value={form.contact_email}
                onChange={(e) => update("contact_email", e.target.value)}
                placeholder="contact@yourbrand.com"
              />
            </div>
          </div>
        </section>

        {/* Media URLs */}
        <section className={sectionClass}>
          <h2 className={headingClass}>Media</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelLightClass}>Logo URL</label>
              <input
                className={inputClass}
                value={form.logo_url}
                onChange={(e) => update("logo_url", e.target.value)}
                placeholder="https://example.com/logo.png"
              />
              {form.logo_url && (
                <img
                  src={form.logo_url}
                  alt="logo preview"
                  className="mt-2 w-16 h-16 rounded-lg object-cover"
                />
              )}
            </div>
            <div>
              <label className={labelLightClass}>Cover Image URL</label>
              <input
                className={inputClass}
                value={form.cover_url}
                onChange={(e) => update("cover_url", e.target.value)}
                placeholder="https://example.com/cover.png"
              />
              {form.cover_url && (
                <img
                  src={form.cover_url}
                  alt="cover preview"
                  className="mt-2 w-full h-24 rounded-lg object-cover"
                />
              )}
            </div>
          </div>
        </section>

        {/* Social Links */}
        <section className={sectionClass}>
          <h2 className={headingClass}>Social Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                key: "facebook_url" as const,
                label: "Facebook URL",
                placeholder: "https://facebook.com/your-page",
              },
              {
                key: "x_url" as const,
                label: "X (Twitter) URL",
                placeholder: "https://x.com/your-handle",
              },
              {
                key: "linkedin_url" as const,
                label: "LinkedIn URL",
                placeholder: "https://linkedin.com/company/your-brand",
              },
              {
                key: "youtube_url" as const,
                label: "YouTube URL",
                placeholder: "https://youtube.com/@your-channel",
              },
              {
                key: "instagram_url" as const,
                label: "Instagram URL",
                placeholder: "https://instagram.com/your-brand",
              },
              {
                key: "discord_url" as const,
                label: "Discord Invite URL",
                placeholder: "https://discord.gg/your-invite",
              },
            ].map((field) => (
              <div key={field.key}>
                <label className={labelLightClass}>{field.label}</label>
                <input
                  className={inputClass}
                  value={form[field.key]}
                  onChange={(e) => update(field.key, e.target.value)}
                  placeholder={field.placeholder}
                />
              </div>
            ))}
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
                placeholder="Brand Name - AIThub"
              />
            </div>
            <div>
              <label className={labelLightClass}>SEO Description</label>
              <textarea
                className={`${inputClass} h-20 resize-none`}
                value={form.seo_description}
                onChange={(e) => update("seo_description", e.target.value)}
                placeholder="Brief description for search engines..."
              />
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving || !form.brand_name || !form.slug}
            className="flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}