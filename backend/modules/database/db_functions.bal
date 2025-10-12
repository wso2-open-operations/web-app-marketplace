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

# Fetch all apps visible to the given `roles`.
#
# + email - User email used to look up favourites
# + roles - Role names used to resolve visible apps
# + return - App[] with `isFavourite` set, or an `error?` on failure
public isolated function fetchAppByRoles(string email, string[] roles) returns App[]|error {
    stream<App, error?> result = databaseClient->query(fetchAppByRolesQuery(email, roles));
    return from App app in result
        select {
            id: app.id,
            header: app.header,
            description: app.description,
            versionName: app.versionName,
            tagId: app.tagId,
            tagName: app.tagName,
            tagColor: app.tagColor,
            icon: app.icon,
            addedBy: app.addedBy,
            isFavourite: app.isFavourite,
            url: app.url
        };
}


# Insert or update user's favourite status for an app.
#
# + email - User email to associate with the favourite
# + appId - Application ID to mark as favourite/unfavourite
# + isFavourite - favourite status to set
# + return - `error?` on failure
public isolated function upsertFavourites(string email, int appId, boolean isFavourite) returns error? {
    _ = check databaseClient->execute(upsertFavouritesQuery(email, appId, isFavourite));
}

# Create a new app in the database.
# + app - App data to create
# + return - Error if creation fails
public isolated function createApp(CreateApp app) returns error? {
    _ = check databaseClient->execute(createAppQuery(app));
}

# Check if an app exists by name and URL.
# + name - App name
# + url - App URL
# + return - True if exists, false otherwise, or error
public isolated function checkAppExists(string name, string url) returns boolean|error {
    ValidAppResult result = check databaseClient->queryRow(checkAppExistsQuery(name, url));
    return result.isValid === 1;
}

# Retrieve user groups from the database schema.
# + return - Array of user groups or error
public isolated function validatingUserGroups() returns string[]|error? {
    GroupsRow|error result = databaseClient->queryRow(validatingUserGroupsQuery());

    if result is sql:NoRowsError {
        return;
    }

    if result is error {
        return result;
    }
    
    string[] userGroups = check result.user_groups.cloneWithType();
    return  userGroups;
}

# Validates whether the given application ID exists in the database.
#
# + appId - The unique identifier of the application to validate
# + return - Returns `true` if the app ID is valid, `false` if invalid, or an `error` on failure
public isolated function isValidAppId(int appId) returns boolean|error {
    ValidAppResult result = check databaseClient->queryRow(isValidAppIdQuery(appId));
    return result.isValid === 1;
}
