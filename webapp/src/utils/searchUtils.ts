// Copyright (c) 2025 WSO2 LLC. (https://www.wso2.com).
//
// WSO2 LLC. licenses this file to you under the Apache License,
// Version 2.0 (the "License"); you may not use this file except
// in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing,
// software distributed under the License is distributed on an
// "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
// KIND, either express or implied.  See the License for the
// specific language governing permissions and limitations
// under the License.
import { UserApp } from "@services/app.api";

/**
 * Filter and sort apps based on search term and selected tags
 * Priority order: Title > Tag > Description
 */
export const filterAndSortApps = (
  apps: UserApp[],
  searchTerm: string,
  selectedTagIds: number[],
): UserApp[] => {
  const normalizedSearch = searchTerm.toLowerCase().trim();

  // Filter by selected tags if any
  let filtered = apps;
  if (selectedTagIds.length > 0) {
    filtered = apps.filter((app) => app.tags.some((tag) => selectedTagIds.includes(tag.id)));
  }

  // If no search term, return tag-filtered results
  if (!normalizedSearch) {
    return filtered;
  }

  // Filter and categorize by match type
  const titleMatches: UserApp[] = [];
  const tagMatches: UserApp[] = [];
  const descriptionMatches: UserApp[] = [];

  filtered.forEach((app) => {
    const titleMatch = app.name.toLowerCase().includes(normalizedSearch);
    const tagMatch = app.tags.some((tag) => tag.name.toLowerCase().includes(normalizedSearch));
    const descriptionMatch = app.description.toLowerCase().includes(normalizedSearch);

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
  apps: UserApp[],
): Array<{ id: number; name: string; color: string }> => {
  const tagMap = new Map<number, { id: number; name: string; color: string }>();

  apps.forEach((app) => {
    app.tags.forEach((tag) => {
      if (!tagMap.has(tag.id)) {
        tagMap.set(tag.id, {
          id: tag.id,
          name: tag.name,
          color: tag.color,
        });
      }
    });
  });

  return Array.from(tagMap.values()).sort((a, b) => a.name.localeCompare(b.name));
};
