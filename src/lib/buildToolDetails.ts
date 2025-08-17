import { ToolDetail } from '../types/tool';
import { CATEGORY_TEMPLATES } from '../data/categoryTemplates';
import { TOOL_DETAILS } from '../data/toolDetails';

const DEFAULTS: Partial<ToolDetail> = {
  features: ["Email support"],
  pros: ["Regular updates"],
  cons: ["Advanced features on higher plans"],
  screenshots: ["/images/placeholders/default-1.jpg"]
};

export function buildToolDetails(toolBase: ToolDetail): ToolDetail {
  const override = TOOL_DETAILS.find(t => t.id === toolBase.id) || {};
  
  const categories = Array.isArray(toolBase.category)
    ? toolBase.category
    : [toolBase.category];

  // merge nhiều template nếu tool có nhiều category
  const template = categories.reduce<Partial<ToolDetail>>((acc, cat) => {
    const t = CATEGORY_TEMPLATES[cat] || {};
    return {
      ...acc,
      features: acc.features || t.features,
      pros: acc.pros || t.pros,
      cons: acc.cons || t.cons,
      screenshots: acc.screenshots || t.screenshots
    };
  }, {});

  // hợp nhất theo ưu tiên: DEFAULTS < template < toolBase < override
  const merged: ToolDetail = {
    ...(DEFAULTS as ToolDetail),
    ...(template as ToolDetail),
    ...toolBase,
    ...(override as ToolDetail),

    // đảm bảo các mảng có giá trị sau merge
    features: override.features || toolBase.features || template.features || DEFAULTS.features!,
    pros: override.pros || toolBase.pros || template.pros || DEFAULTS.pros!,
    cons: override.cons || toolBase.cons || template.cons || DEFAULTS.cons!,
    screenshots: override.screenshots || toolBase.screenshots || template.screenshots || DEFAULTS.screenshots!
  };

  return merged;
}
