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

import ballerina/cache;
import ballerina/http;
import ballerina/log;

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
        [new authorization:JwtInterceptor(), new BadRequestInterceptor()];

    # Fetch logged-in user's details.
    #
    # + return - User information or InternalServerError
    resource function get user\-info(http:RequestContext ctx) returns UserInfo|http:InternalServerError|http:NotFound {
        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError("User information header not found!", userInfo);
            return <http:InternalServerError>{
                body: {
                    message: "User information header not found!"
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
            log:printError("An error occurred while writing user info to the cache", cacheError);
        }
        return userInfoResponse;
    }

    # Get apps visible to the user.
    #
    # + return - App[] on success, 404 when no apps, or 500 on internal errors
    resource function get apps(http:RequestContext ctx) returns App[]|http:NotFound|http:InternalServerError {
        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError("User information header not found!", userInfo);
            return <http:InternalServerError>{
                body: {message: "User information header not found!"}
            };
        }

        App[]|error? result = database:fetchApps();
        if result is error {
            log:printError("Error while retrieving apps", result);
            return <http:InternalServerError>{
                body: {message: "Error while retrieving apps"}
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
    resource function get apps/[string email](http:RequestContext ctx) returns UserApps[]|http:NotFound|http:BadRequest|http:InternalServerError {
        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError("User information header not found!", userInfo);
            return <http:InternalServerError>{
                body: {message: "User information header not found!"}
            };
        }

        if !email.matches(WSO2_EMAIL) || email != userInfo.email {
            log:printError("Invalid email.");
            return<http:BadRequest>{
                body:  {
                    message: "Invalid email"
                }
            };
        }

        UserApps[]|error result = database:fetchUserApps(email, {userGroups: userInfo.groups});
        if result is error {
            log:printError("Error while retrieving apps", result);
            return <http:InternalServerError>{
                body: {message: "Error while retrieving apps"}
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
    resource function post apps(http:RequestContext ctx, CreateApp app) returns http:Created|http:BadRequest|http:Forbidden|http:InternalServerError {
        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError("User information header not found!", userInfo);
            return <http:InternalServerError>{
                body: {message: "User information header not found!"}
            };
        }

        if !authorization:checkPermissions([authorization:authorizedRoles.ADMIN_ROLE], userInfo.groups){
            log:printWarn(string `Access denied: Only administrators can add new apps. email: ${userInfo.email} groups: ${
                    userInfo.groups.toString()}`);
            return <http:Forbidden>{
                body: {
                    message: "Access denied: Only administrators can add new apps."
                }
            };
        }

        UserApps|error? validApp = database:fetchApp({name: app.name, url: app.url});
        if validApp is error {
            log:printError("Error occurred while validating app", validApp);
            return <http:InternalServerError>{
                body: {
                    message: "Error occurred while validating app"
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
            log:printError("Error occurred while retrieving user groups", validUserGroups);
            return<http:InternalServerError>{
                body: {
                    message: "Error occurred while retrieving user groups"
                }
            };
        }

        if validUserGroups.length() == 0 {
            log:printError("There are no user groups. Before adding usergroups you have to create new user groups");
            return<http:InternalServerError>{
                body: {
                    message: "There are no user groups. Before adding usergroups you have to create new user groups"
                }
            };
        }

        boolean isValidUseGroups = checkUserGroups(app.userGroups, validUserGroups);
        if !isValidUseGroups {
            log:printError(string `Invalid usergroups ${app.userGroups.toString()}`);
            return <http:BadRequest>{
                body:  {
                    message: "Invalid usergroups"
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

    # Get valid user groups.
    # 
    # + return - Array of user groups, or Forbidden/InternalServerError
    resource function get user\-groups(http:RequestContext ctx) returns string[]|http:Forbidden|http:InternalServerError {
        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError("User information header not found!", userInfo);
            return <http:InternalServerError>{
                body: {message: "User information header not found!"}
            };
        }

        if !authorization:checkPermissions([authorization:authorizedRoles.ADMIN_ROLE], userInfo.groups){
            log:printWarn(string `Access denied: Only administrators can add new apps. email: ${userInfo.email} groups: ${
                    userInfo.groups.toString()}`);
            return <http:Forbidden>{
                body: {
                    message: "Access denied: Only administrators can add new apps."
                }
            };
        }

        string[]|error validUserGroups = database:fetchUserGroups();
        if validUserGroups is error {
            log:printError("Error occurred while retrieving user groups", validUserGroups);
            return<http:InternalServerError>{
                body: {
                    message: "Error occurred while retrieving user groups"
                }
            };
        }

        if validUserGroups.length() == 0 {
            log:printError("There are no user groups. Before adding usergroups you have to create new user groups");
            return<http:InternalServerError>{
                body: {
                    message: "There are no user groups. Before adding usergroups you have to create new user groups"
                }
            };
        }

        return validUserGroups;
    }

    # Get tags.
    # 
    # + return - Array of tags, or Forbidden/InternalServerError
    resource function get tags(http:RequestContext ctx) returns Tag[]|http:Forbidden|http:InternalServerError {
        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError("User information header not found!", userInfo);
            return <http:InternalServerError>{
                body: {message: "User information header not found!"}
            };
        }

        if !authorization:checkPermissions([authorization:authorizedRoles.ADMIN_ROLE], userInfo.groups){
            log:printWarn(string `Access denied: Only administrators can add new apps. email: ${userInfo.email} groups: ${
                    userInfo.groups.toString()}`);
            return <http:Forbidden>{
                body: {
                    message: "Access denied: Only administrators can add new apps."
                }
            };
        }

        Tag[]|error? tags = database:fetchTags();
        if tags is error {
            log:printError("Error occurred while retrieving tags", tags);
            return <http:InternalServerError>{
                body: {
                    message: "Error occurred while retrieving tags"
                }
            };
        }

        if tags is () {
            log:printError("Error occurred while retrieving tags");
            return <http:InternalServerError>{
                body: {
                    message: "Error occurred while retrieving tags"
                }
            };
        }

        return tags;
    }

    # Update user's favourite status for a specific app.
    #
    # + id - Application ID to update favourite status for
    # + action - Enum containing the favourite status to set
    # + return - Success response, or error responses for invalid app ID, missing user info, or server errors
    resource function post apps/[int id]/[Action action](http:RequestContext ctx)
        returns http:Ok|http:NotFound|http:BadRequest|http:InternalServerError {

        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError("User information header not found!", userInfo);
            return <http:InternalServerError>{
                body: {message: "User information header not found!"}
            };
        }

        boolean isFavourite = action == FAVOURITE;

        UserApps|error? app = database:fetchApp({id: id});
        if app is error {
            log:printError("Error occurred while validating the App ID", app);
            return <http:InternalServerError>{
                body: {
                    message: "Error occurred while validating the App ID"
                }
            };
        }

        if app is (){
            log:printError(string `Application with ID: ${id} was not found!`);  
            return <http:NotFound>{
                body: {
                    message: "Application not found"
                }
            };
        }

        error? upsertError = database:upsertFavourites(userInfo.email, id, isFavourite);
        if upsertError is error {
            log:printError("Error occurred while upserting the app", upsertError, id = id);  
            return <http:InternalServerError>{
                body: {
                    message: "Error occurred while upserting the app"
                }
            };
        }
        return <http:Ok>{
            body:  {
                message: "Successfully updated"
            }
        };
    }
}
