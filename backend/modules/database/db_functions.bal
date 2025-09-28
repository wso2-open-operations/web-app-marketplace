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
// import ballerina/sql;
import ballerina/log;

# Fetch all app links visible to the given `roles` and mark whether each link
# is a favourite for the user identified by `email`.
#
# + email - User email used to look up favourites
# + roles - Role names used to resolve visible links
# + return - List of links with `isFavourite` set, or an `error?` on failure
public isolated function getCollectionByRoles(string email, string[] roles) returns AppLinks[]|error? {

    // Resolve role IDs for the provided role names
    stream<record {|int id;|}, error?> rs = databaseClient->query(getRoleIdsByNamesQuery(roles));

    // Collect role IDs into an array
    int[] rolesIds = check from record {|int id;|} row in rs
        select row.id;

    check rs.close();

    // Resolve user's favourites id; maybe `error` when no favourites exist
    int|error id = databaseClient->queryRow(findUserHasFavourites(email));

    if id is error {
        log:printError("User has no favourites ", id);
    }

    // Fetch all links visible to the roles
    stream<AppLinks, error?> collectionStream = databaseClient->query(fetchLinksByRolesQuery(rolesIds));

    AppLinks[] links = [];

    // For each link, check if it's a favourite (only if user has a favourites id)
    check from AppLinks link in collectionStream
        do {

            int isFav = 0;
            if id is int {
                // Returns 1/0 for favourite; will error if not found
                isFav = check databaseClient->queryRow(findIfItIsFavQuery(link.id));
            }

            links.push({
                id: link.id,
                header: link.header,
                description: link.description,
                versionName: link.versionName,
                tagId: link.tagId,
                iconName: link.iconName,
                addedBy: link.addedBy,
                isFavourite: isFav,
                urlName: link.urlName
            });

        };

    return links;
}
