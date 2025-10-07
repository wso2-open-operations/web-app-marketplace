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

# Fetch all app links visible to the given `roles`
#
# + email - User email used to look up favourites
# + roles - Role names used to resolve visible links
# + return - App[] with `isFavourite` set, or an `error?` on failure
public isolated function fetchAppByRoles(string email, string[] roles) returns App[]|error {
    stream<App, error?> result = databaseClient->query(fetchAppsWithFavouritesQuery(email, roles));
    return from App app in result
        select {
            id: app.id,
            header: app.header,
            description: app.description,
            versionName: app.versionName,
            tagId: app.tagId,
            iconName: app.iconName,
            addedBy: app.addedBy,
            isFavourite: app.isFavourite,
            urlName: app.urlName
        };
}
