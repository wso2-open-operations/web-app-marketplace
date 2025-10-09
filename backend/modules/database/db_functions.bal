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

# Fetch all apps visible to the given `roles`
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
            iconName: app.iconName,
            addedBy: app.addedBy,
            isFavourite: app.isFavourite,
            urlName: app.urlName
        };
}

# Updates the favourite status of an app for a specific user.
#
# + email - The email address of the user
# + appId - ID of the target app
# + isFav - The favourite status (1 for favourite, 0 for not favourite)
# + return - Returns `true` if the update was successful, `false` if no rows were affected, or an `error` on failure
public isolated function upsertFavourites(string email, int appId, int isFav) returns error? {
    _ = check databaseClient->execute(upsertFavouritesQuery(email, appId, isFav));
}

# Validates whether the given application ID exists in the database.
#
# + appId - The unique identifier of the application to validate
# + return - Returns `true` if the app ID is valid, `false` if invalid, or an `error` on failure
public isolated function isValidAppId(int appId) returns boolean|error {
    ValidAppResult result = check databaseClient->queryRow(isValidAppIdQuery(appId));
    return result.isValid === 1;
}
