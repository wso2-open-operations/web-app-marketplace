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
import web_app_marketplace.authorization;
import web_app_marketplace.database;
import web_app_marketplace.people;
import web_app_marketplace.scim;

import ballerina/cache;
import ballerina/http;
import ballerina/log;

// User info cache
final cache:Cache cache = new ({
    defaultMaxAge: 86400.0,
    evictionFactor: 0.2
});

@display {
    label: "Web_App_Marketplace Service",
    id: "people-ops-suite/Web_App_Marketplace-service"
}

service http:InterceptableService / on new http:Listener(9090) {

    # Request interceptor.
    #
    # + return - authorization:JwtInterceptor, BadRequestInterceptor
    public function createInterceptors() returns http:Interceptor[] =>
        [new authorization:JwtInterceptor()];

    # Fetch logged-in user's details.
    #
    # + return - User information or InternalServerError
    resource function get user\-info(http:RequestContext ctx) returns UserInfo|http:InternalServerError|http:NotFound {
        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError(USER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {
                    message: USER_NOT_FOUND_ERROR
                }
            };
        }

        // Check if the employees are already cached
        if cache.hasKey(userInfo.email) {
            UserInfo|error cachedUserInfo = cache.get(userInfo.email).ensureType();
            if cachedUserInfo is UserInfo {
                return cachedUserInfo;
            }
        }

        people:Employee|error? employee = people:fetchEmployee(userInfo.email);
        if employee is error {
            string customError = string `Error occurred while fetching user information for user : ${userInfo.email}`;
            log:printError(customError, employee);
            return <http:InternalServerError>{
                body: customError
            };
        }

        if employee is () {
            log:printError(string `No employee information found for the user: ${userInfo.email}`);
            return <http:NotFound>{
                body: {
                    message: "No user found!"
                }
            };
        }

        // Fetch the user's privileges based on the roles.
        int[] privileges = [];
        if authorization:checkPermissions([authorization:authorizedRoles.EMPLOYEE_ROLE], userInfo.groups) {
            privileges.push(authorization:EMPLOYEE_PRIVILEGE);
        }
        if authorization:checkPermissions([authorization:authorizedRoles.ADMIN_ROLE], userInfo.groups) {
            privileges.push(authorization:ADMIN_PRIVILEGE);
        }

        UserInfo userInfoResponse = {...employee, privileges};

        error? cacheError = cache.put(userInfo.email, userInfoResponse);
        if cacheError is error {
            string customError = string `An error occurred while writing user info to the cache for user: ${userInfo.email}`;
            log:printError(customError, cacheError);
        }
        return userInfoResponse;
    }

    # Get apps visible to the user.
    #
    # + return - App[] on success, 404 when no apps, or 500 on internal errors
    resource function get apps(http:RequestContext ctx) returns App[]|http:NotFound|http:InternalServerError {
        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError(USER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: USER_NOT_FOUND_ERROR}
            };
        }

        App[]|error? result = database:fetchApps();
        if result is error {
            string customError = "Error while retrieving apps";
            log:printError(customError, result);
            return <http:InternalServerError>{
                body: {message: customError}
            };
        }

        if result is () {
            string customError = string `No apps found for user: ${userInfo.email}`;
            log:printError(customError);
            return <http:NotFound>{
                body: {message: customError}
            };
        }

        return result;
    }

    # Get apps visible to the user.
    #
    # + return - App[] on success, 404 when no apps, or 500 on internal errors
    resource function get apps/[string email](http:RequestContext ctx) returns UserApp[]|http:NotFound|http:BadRequest
    |http:InternalServerError {

        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError(USER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: USER_NOT_FOUND_ERROR}
            };
        }

        if !email.matches(WSO2_EMAIL) || email != userInfo.email {
            string customError = string `Invalid email: ${email}`;
            log:printError(customError);
            return <http:BadRequest>{
                body: {
                    message: customError
                }
            };
        }

        UserApp[]|error result = database:fetchUserApps(email, {userGroups: userInfo.groups, isActive: true});
        if result is error {
            string customError = string `Error while retrieving apps for user: ${email}`;
            log:printError(customError, result);
            return <http:InternalServerError>{
                body: {message: customError}
            };
        }

        if result.length() === 0 {
            string customError = string `No apps found for user: ${email}`;
            log:printError(customError);
            return <http:NotFound>{
                body: {message: customError}
            };
        }

        return result;
    }

    # Add a new app.
    #
    # + app - App data to create
    # + return - Created on success, or BadRequest/Forbidden/InternalServerError on failure
    resource function post apps(http:RequestContext ctx, CreateApp app) returns http:Created|http:BadRequest|
    http:Forbidden|http:InternalServerError {

        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError(USER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: USER_NOT_FOUND_ERROR}
            };
        }

        if !authorization:checkPermissions([authorization:authorizedRoles.ADMIN_ROLE], userInfo.groups) {
            string customError = "Access denied: Only administrators can add new apps.";
            log:printWarn(string `${customError} email: ${userInfo.email} groups: ${
                    userInfo.groups.toString()}`);
            return <http:Forbidden>{
                body: {
                    message: customError
                }
            };
        }

        App|error? validApp = database:fetchApp({name: app.name, url: app.url});
        if validApp is error {
            string customError = string `Error occurred while validating app: ${app.name}`;
            log:printError(customError, validApp);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        if !(validApp is ()) {
            log:printError(string `Application with app name : ${app.name} or url : ${app.url} already exists`);
            return <http:InternalServerError>{
                body: {
                    message: "Application with app name and url already exists"
                }
            };
        }

        string[]|error validUserGroups = database:fetchUserGroups();
        if validUserGroups is error {
            string customError = "Error occurred while retrieving user groups";
            log:printError(customError, validUserGroups);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        if validUserGroups.length() == 0 {
            string customError = "There are no user groups. Before adding user groups you have to create new user groups";
            log:printError(customError);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        boolean isValidUseGroups = checkUserGroups(app.userGroups, validUserGroups);
        if !isValidUseGroups {
            log:printError(string `Invalid user groups ${app.userGroups.toString()}`);
            return <http:BadRequest>{
                body: {
                    message: "Invalid user groups"
                }
            };
        }

        error? appError = database:createApp(app);
        if appError is error {
            string customError = string `Error occurred while adding app: ${app.name}`;
            log:printError(customError, appError);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        return <http:Created>{
            body: {
                message: "Successfully added app to the store"
            }
        };
    }

    # Update an existing app.
    #
    # + id - The ID of the app to update
    # + payload - The update data for the app
    # + return - Success response or error responses
    resource function patch apps/[int id](http:RequestContext ctx, UpdateApp payload) returns http:Ok|http:Forbidden|
    http:NotFound|http:InternalServerError {

        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError(USER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: USER_NOT_FOUND_ERROR}
            };
        }

        if !authorization:checkPermissions([authorization:authorizedRoles.ADMIN_ROLE], userInfo.groups) {
            string customError = "Access denied: Only administrators can update apps.";
            log:printWarn(string `${customError} email: ${userInfo.email} groups: ${
                    userInfo.groups.toString()}`);
            return <http:Forbidden>{
                body: {
                    message: customError
                }
            };
        }

        App|error? app = database:fetchApp({id: id});

        if app is error {
            string customError = string `Error occurred while validating app with ID : ${id}`;
            log:printError(customError, app);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        if app is () {
            log:printError("Application not found for given id");
            return <http:NotFound>{
                body: {
                    message: "Application not found"
                }
            };
        }

        error? appError = database:updateApp(id, payload);

        if appError is error {
            string customError = string `Error occurred while updating app with ID : ${id}`;
            log:printError(customError, appError);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        return <http:Ok>{
            body: {
                message: "Successfully updated"
            }
        };
    }

    # Get valid user groups.
    #
    # + return - Array of user groups, or Forbidden/InternalServerError
    resource function get user\-groups(http:RequestContext ctx) returns string[]|http:InternalServerError|error {
        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);

        if userInfo is error {
            log:printError(USER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: USER_NOT_FOUND_ERROR}
            };
        }

        Filter filter = {
            filter: null
        };

        GroupSearchResult|error scimGroups = scim:getGroups(filter);
        if scimGroups is error {
            log:printError("Error retrieving user groups : ", scimGroups);
            return <http:InternalServerError> {
                body:  {
                    message: "Error retrieving user groups"
                }
            };
        }

        string[] userGroups = [];
        foreach Group groups in scimGroups.Resources {
            userGroups.push(groups.displayName.substring(8));
        }

        return userGroups; 
    }

    # Get tags.
    #
    # + return - Array of tags, or Forbidden/InternalServerError
    resource function get tags(http:RequestContext ctx) returns Tag[]|http:Forbidden|http:InternalServerError {
        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError(USER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: USER_NOT_FOUND_ERROR}
            };
        }

        Tag[]|error? tags = database:fetchTags();
        if tags is error {
            string customError = "Error occurred while retrieving tags";
            log:printError(customError, tags);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        if tags is () {
            string customError = "Error occurred while retrieving tags";
            log:printError(customError);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        return tags;
    }

    # Create a new tag.
    #
    # + tagPayload - The tag data to create
    # + return - Ok on success, Forbidden/BadRequest/InternalServerError on failure
    resource function post tags(http:RequestContext ctx, CreateTag tagPayload) returns http:Ok|http:Forbidden|
    http:BadRequest|http:InternalServerError {

        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError(USER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: USER_NOT_FOUND_ERROR}
            };
        }

        if !authorization:checkPermissions([authorization:authorizedRoles.ADMIN_ROLE], userInfo.groups) {
            string customError = "Access denied: Only administrators can add new tags.";
            log:printWarn(string `${customError} email: ${userInfo.email} groups: ${
                    userInfo.groups.toString()}`);
            return <http:Forbidden>{
                body: {
                    message: customError
                }
            };
        }

        Tag|error? tag = database:fetchTagByName(tagPayload.name);

        if tag is error {
            string customError = "Error while validating tags";
            log:printError(customError, tag);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        if tag is Tag {
            string customError = string `Tag already exist for name : ${tagPayload.name}`;
            log:printError(customError);
            return <http:BadRequest>{
                body: {
                    message: customError
                }
            };
        }

        error? tagError = database:createTag(tagPayload);

        if tagError is error {
            string customError = "An error occurred while creating tags";
            log:printError(customError, tagError);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        return <http:Ok>{
            body: {
                message: string `Tag ${tagPayload.name} successfully created`
            }
        };

    }

    # Upsert user's favourite status for a specific app.
    #
    # + id - Application ID to update favourite status for
    # + action - Enum containing the favourite status to set
    # + return - Success response, or error responses for invalid app ID, missing user info, or server errors
    resource function post apps/[int id]/[Action action](http:RequestContext ctx)
        returns http:Ok|http:NotFound|http:BadRequest|http:InternalServerError {

        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError(USER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: USER_NOT_FOUND_ERROR}
            };
        }

        boolean isFavourite = action == FAVOURITE;

        App|error? app = database:fetchApp({id: id});
        if app is error {
            string customError = string `Error occurred while validating the App ID: ${id}`;
            log:printError(customError, app);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        if app is () {
            log:printError(string `Application with ID: ${id} was not found!`);
            return <http:NotFound>{
                body: {
                    message: "Application not found"
                }
            };
        }

        error? upsertError = database:upsertFavourites(userInfo.email, id, isFavourite);
        if upsertError is error {
            string customError = string `Error occurred while upserting the app with ID: ${id} for user: ${userInfo.email}`;
            log:printError(customError, upsertError);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }
        return <http:Ok>{
            body: {
                message: "Successfully updated"
            }
        };
    }

}
