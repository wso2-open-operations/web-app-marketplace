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
import ballerina/log;

# Fetch all apps visible to the given roles.
#
# + return - App[] or an error? on failure
public isolated function fetchApps() returns App[]|error {
    App[] apps = [];
    stream<AppStr, error?> result = databaseClient->query(fetchAppsQuery());
        error? iterateError = from AppStr appStr in result
            do{
                Tag[]|error tag = appStr.tags.fromJsonStringWithType();
                if tag is error {
                    string customError = string `An error occured when retrieving tags of ${appStr.name}`;
                    log:printError(customError, tag);
                    return error(customError);
                }
                apps.push({
                    id: appStr.id,
                    name: appStr.name,
                    url: appStr.url,
                    description: appStr.description,
                    versionName: appStr.versionName,
                    icon: appStr.icon,
                    addedBy: appStr.addedBy,
                    tags: tag,
                    isActive: appStr.isActive
                });
            };
        
    if iterateError is sql:Error {
        string errorMsg = string `An error occurred when retrieving apps!`;
        log:printError(errorMsg, iterateError);
        return error(errorMsg);
    }

    return apps;
}

# Fetch app details by applying filters for validation and admin operations.
#
# + filters - Filter criteria to query apps
# + email - Email of the user
# + return - Array of extended app records
public isolated function fetchUserApps(string email, AppsFilter filters) returns UserApps[]|error {
    UserApps[] userApps = [];
    stream<UserAppStr, error?> result =  databaseClient->query(fetchUserAppsQuery(email, filters));
    error? iterateError = from UserAppStr app in result
        do {
            Tag[]|error tag = app.tags.fromJsonStringWithType();
            if tag is error {
                string customError = string `An error occured when retrieving tags of ${app.name}`;
                log:printError(customError, tag);
                return error(customError);
            }
            userApps.push({
                id: app.id,
                name: app.name,
                url: app.url,
                description: app.description,
                versionName: app.versionName,
                icon: app.icon,
                addedBy: app.addedBy,
                tags: tag,
                isFavourite: app.isFavourite
            });
        };

    if iterateError is sql:Error {
        string errorMsg = string `An error occurred when retrieving apps!`;
        log:printError(errorMsg, iterateError);
        return error(errorMsg);
    }

    return userApps;
    
}
# Retrieves a single app from the database based on filter criteria.
#
# + filters - Filter conditions for searching the app
# + return - Returns App, nil or error
public isolated function fetchApp(AppFilter filters) returns App|error? {
    stream<AppStr, error?> result = databaseClient->query(fetchAppQuery(filters));
    
    // Get the next record from the stream
    record {|AppStr value;|}? appRecord = check result.next();

    if appRecord is () {
        return; 
    }
    
    AppStr app = appRecord.value;
    Tag[]|error tag = app.tags.fromJsonStringWithType();
    if tag is error {
        string customError = string `An error occurred when retrieving tags of ${app.name}`;
        log:printError(customError, tag);
        return error(customError);
    }
    
    return {
        id: app.id,
        name: app.name,
        url: app.url,
        description: app.description,
        versionName: app.versionName,
        icon: app.icon,
        addedBy: app.addedBy,
        tags: tag
    };
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

# Create a new app in the database.
# 
# + app - App data to create
# + return - Error if creation fails
public isolated function createApp(CreateApp app) returns error? {
    _ = check databaseClient->execute(createAppQuery(app));
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
