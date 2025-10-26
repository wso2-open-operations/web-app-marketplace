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
import ballerina/sql;

# [Database] Build query to fetch apps visible to any of the given user roles, including favourite status for the user.
#
# + return - Parameterized query selecting apps with favourite status
isolated function fetchAppsQuery() returns sql:ParameterizedQuery => `
        SELECT 
            a.id,
            a.name,
            a.url,
            a.description,
            a.version_name,
            a.icon,
            a.added_by,
            a.user_groups,
            COALESCE(
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', t.id,
                        'name', t.name,
                        'color', t.color
                    )
                ),
                JSON_ARRAY()
            ) AS tags
        FROM apps a
        LEFT JOIN tags t ON FIND_IN_SET(t.id, a.tags) > 0
        GROUP BY a.id, a.name, a.url, a.description, a.version_name, a.icon, a.added_by, a.user_groups`;

# Build query to fetch app details with filters for validation and admin operations.
#
# + email - User email to check favourite status
# + filters - Filter criteria to apply when querying apps
# + return - Parameterized SQL query with applied filters
isolated function fetchUserAppsQuery(string email, AppsFilter filters) returns sql:ParameterizedQuery {
    sql:ParameterizedQuery mainQuery = `
        SELECT 
            a.id,
            a.name,
            a.url,
            a.description,
            a.version_name,
            a.icon,
            a.added_by,
            COALESCE(
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', t.id,
                        'name', t.name,
                        'color', t.color
                    )
                ),
                JSON_ARRAY()
            ) AS tags,
            CASE WHEN uf.app_id IS NOT NULL THEN 1 ELSE 0 END AS is_favourite
        FROM apps a
        LEFT JOIN user_favourites uf ON a.id = uf.app_id 
            AND uf.user_email = ${email}
            AND uf.is_favourite = 1
        LEFT JOIN tags t ON FIND_IN_SET(t.id, a.tags) > 0
    `;

    sql:ParameterizedQuery[] filterQueries = [];
    if filters.name is string {
        filterQueries.push(` a.name = ${filters.name}`);
    }

    if filters.id is int {
        filterQueries.push(` a.id = ${filters.id}`);
    }

    if filters.url is string {
        filterQueries.push(` a.url = ${filters.url}`);
    }

    if filters.addedBy is string {
        filterQueries.push(` a.added_by = ${filters.addedBy}`);
    }

    if filters.isActive is string {
        filterQueries.push(` a.is_active = ${filters.isActive}`);
    }

    string[]? userGroups = filters.userGroups;
    if userGroups is string[] && userGroups.length() > 0 {
        // Build conditions to check if any of the provided groups exist in the app's user_groups
        sql:ParameterizedQuery[] groupConditions = [];
        foreach string group in userGroups {
            string trimmedGroup = group.trim();
            if trimmedGroup.length() > 0 {
                groupConditions.push(`FIND_IN_SET(${trimmedGroup}, a.user_groups)`);
            }
        }

        if groupConditions.length() > 0 {
            // Create OR conditions for each group, and also include apps with null or empty user_groups
            sql:ParameterizedQuery groupClause = groupConditions[0];
            foreach int i in 1 ..< groupConditions.length() {
                groupClause = sql:queryConcat(groupClause, ` OR `, groupConditions[i]);
            }
            // Add condition: matches any group OR has null/empty user_groups
            filterQueries.push(sql:queryConcat(`((`, groupClause, `) OR (a.user_groups IS NULL OR a.user_groups = ''))`));
        }
    }

    mainQuery = buildSqlSelectQuery(mainQuery, filterQueries);
    
    // Add GROUP BY clause after WHERE conditions
    mainQuery = sql:queryConcat(mainQuery, ` GROUP BY a.id, a.name, a.url, a.description, a.version_name, a.icon, 
    a.added_by, a.is_active, uf.app_id`);

    return mainQuery;
}

# Build query to fetch app details with filters for validation and admin operations.
#
# + filters - Filter criteria to apply when querying apps
# + return - Parameterized SQL query with applied filters
isolated function fetchAppQuery(AppFilter filters) returns sql:ParameterizedQuery {
    sql:ParameterizedQuery mainQuery = `
        SELECT 
            a.id,
            a.name,
            a.url,
            a.description,
            a.version_name,
            a.icon,
            a.added_by,
            COALESCE(
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', t.id,
                        'name', t.name,
                        'color', t.color
                    )
                ),
                JSON_ARRAY()
            ) AS tags
        FROM apps a
        LEFT JOIN tags t ON FIND_IN_SET(t.id, a.tags) > 0 
            AND a.tags IS NOT NULL 
            AND a.tags != ''
    `;

    sql:ParameterizedQuery[] filterQueries = [];
    if filters.name is string {
        filterQueries.push(` a.name = ${filters.name}`);
    }

    if filters.id is int {
        filterQueries.push(` a.id = ${filters.id}`);
    }

    if filters.url is string {
        filterQueries.push(` a.url = ${filters.url}`);
    }

    mainQuery = buildSqlSelectQuery(mainQuery, filterQueries);
    
    // Add GROUP BY clause after WHERE conditions
    mainQuery = sql:queryConcat(mainQuery, ` GROUP BY a.id, a.name, a.url, a.description, a.version_name, a.icon,
     a.added_by`);
    
    return mainQuery;
}

# Build query to create a new app.
# 
# + app - App data to insert
# + return - Parameterized query for app creation
isolated function createAppQuery(CreateApp app) returns sql:ParameterizedQuery {
    string userGroups = app.userGroups.length() > 0 ? string:'join(",", ...app.userGroups) : "";
    string tags = app.tags.length() > 0 ? string:'join(",", ...from int tagId in app.tags select tagId.toString()) : "";

    sql:ParameterizedQuery query = sql:queryConcat(
        `INSERT INTO apps (
            name,
            url,
            description,
            version_name,
            tags,
            icon,
            user_groups,
            is_active,
            added_by,
            updated_by
        ) VALUES (
            ${app.name},
            ${app.url},
            ${app.description},
            ${app.versionName},
            ${tags},
            ${app.icon},
            ${userGroups},
            ${app.isActive},
            ${app.addedBy},
            ${app.addedBy} 
        )`
    );
    return query;
}

# Build query to update an existing app.
#
# + id - The ID of the app to update
# + payload - The update payload containing fields to update
# + return - Parameterized query for app update
isolated function updateAppQuery(int id, UpdateApp payload) returns sql:ParameterizedQuery {
    sql:ParameterizedQuery mainQuery = `
        UPDATE apps
        SET
    `;

    sql:ParameterizedQuery subQuery = `
        WHERE id = ${id}
    `;

    sql:ParameterizedQuery[] filters = [];

    if payload.name is string {
        filters.push(` name = ${payload.name}`);
    }

    if payload.description is string {
        filters.push(` description = ${payload.description}`);
    }

    if payload.icon is string {
        filters.push(` icon = ${payload.icon}`);
    }

    if payload.isActive is boolean {
        filters.push(` is_active = ${payload.isActive}`);
    }

    if payload.url is string {
        filters.push(` url = ${payload.url}`);
    }

    if payload.versionName is string {
        filters.push(` version_name = ${payload.versionName}`);
    }

    filters.push(` updated_by = ${payload.updatedBy}`);

    int[]? payloadTags = payload.tags;
    if payloadTags is int[]{
        string tags = payloadTags.length() > 0 ? string:'join(",", from int tagId in payloadTags select 
        tagId.toString()) : "";
        filters.push(` tags = ${tags}`);
    }

    mainQuery = buildSqlUpdateQuery(mainQuery, filters);

    return sql:queryConcat(mainQuery, subQuery);
}

# Build query to insert or update user's favourite status for an app.
#
# + email - User email to associate with the favourite
# + appId - Application ID to mark as favourite/unfavourite
# + isFavourite - Record containing the favourite status to set
# + return - Parameterized SQL query for upsert operation
isolated function upsertFavouritesQuery(string email, int appId, boolean isFavourite)
    returns sql:ParameterizedQuery => `
    INSERT INTO user_favourites (
        user_email, 
        app_id, 
        is_favourite
    ) VALUES (
        ${email}, 
        ${appId}, 
        ${isFavourite}
    )
    ON DUPLICATE KEY UPDATE
        is_favourite = ${isFavourite}`;

# Build query to fetch active user groups.
# 
# + return - Parameterized query for user groups
isolated function fetchUserGroupsQuery() returns sql:ParameterizedQuery {
    sql:ParameterizedQuery query = `
        SELECT 
            name
        FROM user_groups
        WHERE is_active = 1`;
    return query;
}

# Build query to fetch active tags.
# 
# + return - Parameterized query for tags
isolated function fetchTagsQuery() returns sql:ParameterizedQuery => `
    SELECT 
        id,
        name,
        color
    FROM tags
    WHERE is_active = 1`;
