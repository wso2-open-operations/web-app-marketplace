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
    int[]|error? rolesIds = getRoleIdsByNames(roles);

    // Return null id not ids are found
    if rolesIds is () {
        return;
    }

    // Return custom error if id is error
    if rolesIds is error {
        return rolesIds;
    }

    // Resolve user's favourites id; maybe `error` when no favourites exist
    int|error favId = databaseClient->queryRow(findUserHasFavourites(email));

    if favId is error {
        log:printError("User has no favourites ", favId);
    }

    // Fetch all links visible to the roles
    stream<AppLinks, error?> collectionStream = databaseClient->query(fetchLinksByRolesQuery(rolesIds));

    AppLinks[] links = [];

    // For each link, check if it's a favourite (only if user has a favourites id)
    check from AppLinks link in collectionStream
        do {

            int isFav = 0;
            if favId is int {
                // Returns 1/0 for favourite; will error if not found
                isFav = check databaseClient->queryRow(findIfItIsFavQuery(favId, link.id));
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

# Resolve DB role IDs for the provided role names and handle empty input.
#
# + roles - Role names to resolve
# + return - int[] of role IDs, () when roles empty, or error? on failure
public isolated function getRoleIdsByNames(string[] roles) returns int[]|error? {
    // short-circuit when no roles are provided
    if roles.length() == 0 {
        return;
    }
    // query role ids as a stream
    stream<record {|int id;|}, error?> rs =
        databaseClient->query(getRoleIdsByNamesQuery(roles));

    int[] rolesIds = [];
    do {
        // pull rows and project to int[]
        rolesIds = check from record {|int id;|} row in rs
            select row.id;

        check rs.close();
    } on fail var e {
        // close stream but do not override the original error
        string customError = "Error while retrieving user roles";
        log:printError(customError, e);
        return error(customError);
    }

    return rolesIds;
}
