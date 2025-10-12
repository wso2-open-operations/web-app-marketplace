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
# + email - User email to check favourites
# + roles - User roles to filter
# + return - Parameterized query selecting apps with favourite status
isolated function fetchAppByRolesQuery(string email, string[] roles) returns sql:ParameterizedQuery {
    sql:ParameterizedQuery selectClause = `
        SELECT 
            a.id,
            a.header,
            a.url,
            a.description,
            a.version_name,
            a.tag_id,
            t.name,
            t.color,
            a.icon,
            a.added_by,
            CASE WHEN uf.app_id IS NOT NULL THEN 1 ELSE 0 END AS is_favourite
        FROM apps a
        LEFT JOIN user_favourites uf ON a.id = uf.app_id 
            AND uf.user_email = ${email} 
            AND uf.is_favourite = 1
        LEFT JOIN tags t ON a.tag_id =t.id
        WHERE a.is_active = 1`;

    if roles.length() == 0 {
        // No roles provided: show only apps with empty user_groups
        return sql:queryConcat(selectClause, `
          AND (a.user_groups IS NULL OR a.user_groups = '')
        ORDER BY a.header`);
    }

    // Roles provided: show apps matching any role OR with empty user_groups
    sql:ParameterizedQuery[] roleConditions = [];
    foreach var role in roles {
        roleConditions.push(`FIND_IN_SET(${role}, a.user_groups)`);
    }

    sql:ParameterizedQuery roleClause = roleConditions[0];
    foreach int i in 1 ..< roleConditions.length() {
        roleClause = sql:queryConcat(roleClause, ` OR `, roleConditions[i]);
    }

    sql:ParameterizedQuery whereClause = sql:queryConcat(`
          AND ((`, roleClause, `) OR (a.user_groups IS NULL OR a.user_groups = ''))`);

    return sql:queryConcat(selectClause, whereClause, `
        ORDER BY a.header`);
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

# Build query to check if an application ID is valid and active.
#
# + appId - Application ID to validate
# + return - Parameterized SQL query that returns boolean result
isolated function isValidAppIdQuery(int appId) returns sql:ParameterizedQuery => `
    SELECT EXISTS(
        SELECT 1 FROM apps 
        WHERE id = ${appId} AND is_active = 1
    ) AS is_valid`;


isolated function createAppQuery(CreateApp app) returns sql:ParameterizedQuery => `
    INSERT INTO apps (
        header,
        url,
        description,
        version_name,
        tag_id,
        icon,
        user_groups,
        is_active,
        added_by,
    ) VALUES (
        ${app.header},
        ${app.url},
        ${app.description},
        ${app.versionName},
        ${app.tagId},
        ${app.icon},
        ${app.userGroups},
        ${app.isActive},
        ${app.addedBy},
    )`;
