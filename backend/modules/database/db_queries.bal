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

# [Database] Build query to fetch all non-deleted collection rows.
#
# + return - Parameterized query for selecting collection metadata
isolated function fetchAllCollectionQuery() returns sql:ParameterizedQuery {
    sql:ParameterizedQuery query = `
        SELECT
            id,
            header,
            description,
            url_name,
            version_name,
            tag,
            icon,
            role_ids,
            added_by
        FROM collection
        WHERE is_deleted = 0
    `;
    return query;
}

# [Database] Build query to fetch a user's favourites row by email.
#
# + email - User email to match
# + return - Parameterized query selecting favourites for the user
isolated function fetchFavouritesQuery(string email) returns sql:ParameterizedQuery {
    sql:ParameterizedQuery query = `
        SELECT
            user_email,
            favourite_collection
        FROM favourites
        WHERE user_email = ${email}
    `;
    return query;
}

# [Database] Build query to resolve role IDs from role names.
#
# + roleNames - Role names to filter
# + return - Parameterized query selecting distinct role ids for given names
isolated function getRoleIdsByNamesQuery(string[] roleNames) returns sql:ParameterizedQuery {
    return sql:queryConcat(`
        SELECT 
            id 
        FROM 
            roles 
        WHERE 
            name IN(`, sql:arrayFlattenQuery(roleNames), `) 
            AND is_deleted = 0
    `);
}

# [Database] Build query to test if a link is favourited within a specific favourites bucket.
#
# + favId - Favourites table id for the user
# + linkId - Link id to test
# + return - Parameterized query returning 0 or 1 as is_fav
isolated function findIfItIsFavQuery(int favId, int linkId) returns sql:ParameterizedQuery {
    return `SELECT CAST(EXISTS(
              SELECT 1
              FROM favourite_links fl
              WHERE fl.favourite_id = ${favId}
                AND fl.link_id      = ${linkId}
            ) AS UNSIGNED) AS is_fav`;
}

# [Database] Build query to fetch the favourites id for a user by email.
#
# + email - User email to match
# + return - Parameterized query selecting favourites id
isolated function findUserHasFavourites(string email) returns sql:ParameterizedQuery {
    sql:ParameterizedQuery query = `
        SELECT id
        FROM favourites
        WHERE user_email = ${email}
    `;
    return query;
}

# [Database] Build query to fetch distinct links visible to any of the given role IDs.
#
# + roleIds - Role ids used in the IN filter
# + return - Parameterized query selecting link metadata for the roles
isolated function fetchLinksByRolesQuery(int[] roleIds) returns sql:ParameterizedQuery {
    sql:ParameterizedQuery head = `
    SELECT DISTINCT
           l.id, 
           l.header, 
           l.url_name, 
           l.description, 
           l.version_name,
           l.tag, 
           l.icon, 
           l.added_by
    FROM links l
    JOIN role_links rl ON rl.link_id = l.id
    WHERE l.is_deleted = 0
      AND rl.role_id IN (
`;
    sql:ParameterizedQuery mid = sql:arrayFlattenQuery(roleIds);
    sql:ParameterizedQuery tail = `)
    ORDER BY l.header
`;
    return sql:queryConcat(head, mid, tail);
}
