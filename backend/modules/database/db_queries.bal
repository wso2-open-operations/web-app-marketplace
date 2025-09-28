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

isolated function fetchFavouritesQuery(string email) returns sql:ParameterizedQuery {
    sql:ParameterizedQuery query = `
        SELECT
            user_email,
            favourite_collection
        FROM favourites
        WHERE user_email = ${email}
    `;

    return query;
};

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
};

isolated function findIfItIsFavQuery(int favId, int linkId)
        returns sql:ParameterizedQuery {
    return `SELECT CAST(EXISTS(
              SELECT 1
              FROM favourite_links fl
              WHERE fl.favourite_id = ${favId}
                AND fl.link_id      = ${linkId}
            ) AS UNSIGNED) AS is_fav`;
}

isolated function findUserHasFavourites(string email) returns sql:ParameterizedQuery {
    sql:ParameterizedQuery query = `
        SELECT id
        FROM favourites
        WHERE user_email = ${email}
    `;

    return query;
}

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
