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

# [Database] Build query to fetch apps visible to any of the given user roles.
# Apps with empty user_groups are visible to everyone.
#
# + roles - User roles to filter
# + return - Parameterized query selecting apps for the roles
isolated function fetchAppsByUserRolesQuery(string[] roles) returns sql:ParameterizedQuery {
    sql:ParameterizedQuery selectClause = `
        SELECT 
            id,
            header,
            url,
            description,
            version_name,
            tag_id,
            icon,
            added_by
        FROM apps
        WHERE is_active = 1`;

    if roles.length() == 0 {
        // No roles provided: show only apps with empty user_groups
        return sql:queryConcat(selectClause, `
          AND (user_groups IS NULL OR user_groups = '')
        ORDER BY header`);
    }

    // Roles provided: show apps matching any role OR with empty user_groups
    sql:ParameterizedQuery[] roleConditions = [];
    foreach var role in roles {
        roleConditions.push(`FIND_IN_SET(${role}, user_groups)`);
    }

    sql:ParameterizedQuery roleClause = roleConditions[0];
    foreach int i in 1 ..< roleConditions.length() {
        roleClause = sql:queryConcat(roleClause, ` OR `, roleConditions[i]);
    }

    sql:ParameterizedQuery whereClause = sql:queryConcat(`
          AND ((`, roleClause, `) OR (user_groups IS NULL OR user_groups = ''))`);

    return sql:queryConcat(selectClause, whereClause, `
        ORDER BY header`);
}

# [Database] Build query to check if a given app is a favourite for a user.
#
# + appId - App ID to check
# + email - User email to check
# + return - Parameterized query returning 1 if favourite, 0 otherwise
isolated function findUserHasFavouritesQuery(int appId, string email) returns sql:ParameterizedQuery {
    sql:ParameterizedQuery query = `
        SELECT CAST(EXISTS(
            SELECT 1
            FROM user_favourites
            WHERE app_id = ${appId}
                AND user_email = ${email}
                AND is_active = 1
        ) AS UNSIGNED) AS is_fav`;

    return query;
}
