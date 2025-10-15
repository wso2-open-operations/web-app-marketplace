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
# + return - App[] or an `error?` on failure
public isolated function fetchApps() returns App[]|error {
    stream<App, error?> result = databaseClient->query(fetchAppsQuery());
    return from App app in result
        select app;
}

# Fetch app details by applying filters for validation and admin operations.
#
# + filters - Filter criteria to query apps
# + email - Email of the user
# + return - Array of extended app records
public isolated function fetchAppsByFilter(string email, AppsFilter filters) returns ExtendedApp[]|error {
    stream<ExtendedApp, error?> result =  databaseClient->query(fetchAppsByFilterQuery(email, filters));
    return from ExtendedApp app in result
        select app;
}
# Retrieves a single app from the database based on filter criteria.
#
# + filters - Filter conditions for searching the app
# + return - Returns ExtendedApp, nill or error
public isolated function fetchApp(AppFilter filters) returns ExtendedApp|error? {
    ExtendedApp|error result =  databaseClient->queryRow(fetchAppQuery(filters));

    if result is error {
        if result is sql:NoRowsError {
            return;
        }
        return  result;
    }
    return result;
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
# 
# + app - App data to create
# + return - Error if creation fails
public isolated function createApp(CreateApp app) returns error? {
    _ = check databaseClient->execute(createAppQuery(app));
}

# Retrieve user groups from the database schema.
# 
# + return - Array of user groups or error
public isolated function fetchUserGroups() returns string[]|error? {
    string|error result = databaseClient->queryRow(fetchUserGroupsQuery());

    if result is error {
        if result is sql:NoRowsError {
            return;
        }
        return result;
    }
    
    string[] userGroups = check result.fromJsonStringWithType();
    return  userGroups;
}

# Fetch all active tags.
# 
# + return - Array of tags or error
public isolated function fetchTags() returns Tag[]|error? {
    stream<Tag, error?> result = databaseClient->query(fetchTagsQuery());
    return from Tag tag in result
        select {
            id: tag.id,
            name: tag.name
        };
}
