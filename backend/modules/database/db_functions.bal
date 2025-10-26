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

# Fetch all apps visible to the given roles.
#
# + return - App[] or an error? on failure
public isolated function fetchApps() returns App[]|error {
    stream<AppRecord, error?> result = databaseClient->query(fetchAppsQuery());
    return from AppRecord app in result
        let Tag[] tags = check app.tags.fromJsonStringWithType()
        select {
            id: app.id,
            name: app.name,
            url: app.url,
            description: app.description,
            versionName: app.versionName,
            icon: app.icon,
            addedBy: app.addedBy,
            tags,
            isActive: app.isActive
        };
}

# Fetch app details by applying filters for validation and admin operations.
#
# + filters - Filter criteria to query apps
# + email - Email of the user
# + return - Array of extended app records
public isolated function fetchUserApps(string email, AppsFilter filters) returns UserApps[]|error {
    stream<UserAppRecord, error?> result = databaseClient->query(fetchUserAppsQuery(email, filters));
    return from UserAppRecord app in result
        let Tag[] tags = check app.tags.fromJsonStringWithType()
        select {
            id: app.id,
            name: app.name,
            url: app.url,
            description: app.description,
            versionName: app.versionName,
            icon: app.icon,
            addedBy: app.addedBy,
            tags,
            isFavourite: app.isFavourite
        };
}

# Fetch a single app by applying filter criteria.
#
# + filters - Filter criteria to query a specific app
# + return - App record if found, () if no matching app exists, or error on failure
public isolated function fetchApp(AppFilter filters) returns App|error? {
    AppRecord|error appRecord = databaseClient->queryRow(fetchAppQuery(filters));

    if appRecord is error {
        if appRecord is sql:NoRowsError {
            return;
        }
        return appRecord;
    }

    return {
        id: appRecord.id,
        name: appRecord.name,
        url: appRecord.url,
        description: appRecord.description,
        versionName: appRecord.versionName,
        icon: appRecord.icon,
        addedBy: appRecord.addedBy,
        tags: check appRecord.tags.fromJsonStringWithType()
    };
}

# Create a new app in the database.
#
# + app - App data to create
# + return - Error if creation fails
public isolated function createApp(CreateApp app) returns error? {
    _ = check databaseClient->execute(createAppQuery(app));
}

# Insert or update user's favourite status for an app.
#
# + email - User email to associate with the favourite
# + appId - Application ID to mark as favourite/unfavourite
# + isFavourite - favourite status to set
# + return - error? on failure
public isolated function upsertFavourites(string email, int appId, boolean isFavourite) returns error? {
    _ = check databaseClient->execute(upsertFavouritesQuery(email, appId, isFavourite));
}

# Retrieve user groups.
#
# + return - Array of user groups or error
public isolated function fetchUserGroups() returns string[]|error {
    stream<record {|string name;|}, error?> result = databaseClient->query(fetchUserGroupsQuery());
    return from var item in result
        select item.name;
}

# Fetch all active tags.
#
# + return - Array of tags or error
public isolated function fetchTags() returns Tag[]|error? {
    stream<Tag, error?> result = databaseClient->query(fetchTagsQuery());
    return from Tag tag in result
        select {
            id: tag.id,
            name: tag.name,
            color: tag.color
        };
}
