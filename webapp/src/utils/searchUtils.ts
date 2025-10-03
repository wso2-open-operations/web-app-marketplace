import { AppLinks } from "@root/src/slices/appSlice/app";

/**
 * Filter and sort apps based on search term and selected tags
 * Priority order: Title > Tag > Description
 */
export const filterAndSortApps = (
  apps: AppLinks[],
  searchTerm: string,
  selectedTagIds: number[]
): AppLinks[] => {
  const normalizedSearch = searchTerm.toLowerCase().trim();

  // Filter by selected tags if any
  let filtered = apps;
  if (selectedTagIds.length > 0) {
    filtered = apps.filter((app) => selectedTagIds.includes(app.tagId));
  }

  // If no search term, return tag-filtered results
  if (!normalizedSearch) {
    return filtered;
  }

  // Filter and categorize by match type
  const titleMatches: AppLinks[] = [];
  const tagMatches: AppLinks[] = [];
  const descriptionMatches: AppLinks[] = [];

  filtered.forEach((app) => {
    const titleMatch = app.header.toLowerCase().includes(normalizedSearch);
    const tagMatch = app.tagName.toLowerCase().includes(normalizedSearch);
    const descriptionMatch = app.description
      .toLowerCase()
      .includes(normalizedSearch);

    if (titleMatch) {
      titleMatches.push(app);
    } else if (tagMatch) {
      tagMatches.push(app);
    } else if (descriptionMatch) {
      descriptionMatches.push(app);
    }
  });

  // Combine in priority order
  return [...titleMatches, ...tagMatches, ...descriptionMatches];
};

/**
 * Extract unique tags from apps array
 */
export const extractUniqueTags = (
  apps: AppLinks[]
): Array<{ id: number; name: string; color: string }> => {
  const tagMap = new Map<number, { id: number; name: string; color: string }>();

  apps.forEach((app) => {
    if (!tagMap.has(app.tagId)) {
      tagMap.set(app.tagId, {
        id: app.tagId,
        name: app.tagName,
        color: app.tagColor,
      });
    }
  });

  return Array.from(tagMap.values()).sort((a, b) =>
    a.name.localeCompare(b.name)
  );
};
