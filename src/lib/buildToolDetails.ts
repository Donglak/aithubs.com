import { ToolDetail } from '../types/tool';
import { CATEGORY_TEMPLATES } from '../data/categoryTemplates';
<<<<<<< HEAD
import { loadToolDetails } from './loadToolDetails';
=======
import { TOOL_DETAILS } from '../data/toolDetails';
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e

const DEFAULTS: Partial<ToolDetail> = {
  features: ["Email support"],
  pros: ["Regular updates"],
  cons: ["Advanced features on higher plans"],
  screenshots: ["/images/placeholders/default-1.jpg"]
};

<<<<<<< HEAD
let toolDetailsPromise: Promise<Partial<ToolDetail>[]> | null = null;

async function getToolDetails(): Promise<Partial<ToolDetail>[]> {
  if (!toolDetailsPromise) {
    toolDetailsPromise = loadToolDetails();
  }
  return toolDetailsPromise;
}

function getToolDetailsSync(): Partial<ToolDetail>[] | null {
  // This will only work after the async version has been loaded
  // In practice, we use the async version in ToolDetailPage
  return null;
}

export async function buildToolDetailsAsync(toolBase: ToolDetail): Promise<ToolDetail> {
  const toolDetails = await getToolDetails();
  const override = toolDetails.find(t => t.id === toolBase.id) || {};

  const categories = Array.isArray(toolBase.categories)
    ? toolBase.categories
    : [toolBase.categories];

  // merge multiple templates if tool has multiple categories
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

  // merge in order: DEFAULTS < template < toolBase < override
  const merged: ToolDetail = {
    ...(DEFAULTS as ToolDetail),
    ...(template as ToolDetail),
    ...toolBase,
    ...(override as ToolDetail),

    // ensure arrays have values after merge
    features: override.features || toolBase.features || template.features || DEFAULTS.features!,
    pros: override.pros || toolBase.pros || template.pros || DEFAULTS.pros!,
    cons: override.cons || toolBase.cons || template.cons || DEFAULTS.cons!,
    screenshots: override.screenshots || toolBase.screenshots || template.screenshots || DEFAULTS.screenshots!
  };

  return merged;
}

// Synchronous version for backward compatibility (uses cached data if available)
export function buildToolDetails(toolBase: ToolDetail): ToolDetail {
  // Try to import synchronously as fallback
  // Note: This requires the toolDetails.ts to be available synchronously
  // For the async version, use buildToolDetailsAsync in ToolDetailPage
  const toolDetails = getToolDetailsSync();

  // Fallback - will only work if toolDetails.ts is statically imported
  let toolDetailsArray: Partial<ToolDetail>[] = [];
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { TOOL_DETAILS: StaticToolDetails } = require('../data/toolDetails.ts');
    toolDetailsArray = StaticToolDetails as Partial<ToolDetail>[];
  } catch {
    // Ignore if not available
  }

  const override = toolDetailsArray.find(t => t.id === toolBase.id) || {};
=======
export function buildToolDetails(toolBase: ToolDetail): ToolDetail {
  const override = TOOL_DETAILS.find(t => t.id === toolBase.id) || {};
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e

  const categories = Array.isArray(toolBase.categories)
    ? toolBase.categories
    : [toolBase.categories];

<<<<<<< HEAD
=======
  // merge nhiều template nếu tool có nhiều category
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
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

<<<<<<< HEAD
=======
  // hợp nhất theo ưu tiên: DEFAULTS < template < toolBase < override
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
  const merged: ToolDetail = {
    ...(DEFAULTS as ToolDetail),
    ...(template as ToolDetail),
    ...toolBase,
    ...(override as ToolDetail),

<<<<<<< HEAD
=======
    // đảm bảo các mảng có giá trị sau merge
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
    features: override.features || toolBase.features || template.features || DEFAULTS.features!,
    pros: override.pros || toolBase.pros || template.pros || DEFAULTS.pros!,
    cons: override.cons || toolBase.cons || template.cons || DEFAULTS.cons!,
    screenshots: override.screenshots || toolBase.screenshots || template.screenshots || DEFAULTS.screenshots!
  };

  return merged;
<<<<<<< HEAD
}
=======
}
>>>>>>> 1028320ebd4ce7e531a9a122d0d922f201a2053e
