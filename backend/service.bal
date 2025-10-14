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
            log:printError(USER_INFO_HEADER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {
                    message: USER_INFO_HEADER_NOT_FOUND_ERROR
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
            string customError = string `${ERROR_FETCHING_USER_INFO}: ${userInfo.email}`;
            log:printError(customError, employee);
            return <http:InternalServerError>{
                body: customError
            };
        }

        if employee is () {
            log:printError(string `No employee information found for the user: ${userInfo.email}`);
            return <http:NotFound>{
                body: {
                    message: NO_USER_FOUND
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
            log:printError(USER_INFO_HEADER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: USER_INFO_HEADER_NOT_FOUND_ERROR}
            };
        }

        App[]|error? result = database:fetchApps(userInfo.email, userInfo.groups);
        if result is error {
            log:printError(ERROR_RETRIEVING_APPS, result);
            return <http:InternalServerError>{
                body: {message: ERROR_RETRIEVING_APPS}
            };
        }

        if result is () {
            string customError = string `${NO_APPS_FOUND} : ${userInfo.email}`;
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
            log:printError(USER_INFO_HEADER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: USER_INFO_HEADER_NOT_FOUND_ERROR}
            };
        }

        if !authorization:checkPermissions([authorization:authorizedRoles.ADMIN_ROLE], userInfo.groups){
            log:printWarn(string `${UNAUTHORIZED_REQUEST} email: ${userInfo.email} groups: ${
                    userInfo.groups.toString()}`);
            return <http:Forbidden>{
                body: {
                    message: UNAUTHORIZED_REQUEST
                }
            };
        }

        ExtendedApp[]|error validApp = database:fetchAppByFilter({header: app.header, url: app.url});
        if validApp is error {
            log:printError(ERROR_VALIDATING_APP, validApp);
            return <http:InternalServerError>{
                body: {
                    message: ERROR_VALIDATING_APP
                }
            };
        }

        if validApp.length() === 0 {
            return <http:InternalServerError>{
                body: {
                    message: APP_ALREADY_EXISTS
                }
            };
        }

        string[]|error? validUserGroups = database:fetchValidUserGroups();
        if validUserGroups is error {
            log:printError(ERROR_RETRIEVING_USER_GROUPS, validUserGroups);
            return<http:InternalServerError>{
                body: {
                    message: ERROR_RETRIEVING_USER_GROUPS
                }
            };
        }

        if validUserGroups is () {
            log:printError(NO_USER_GROUPS);
            return<http:InternalServerError>{
                body: {
                    message: NO_USER_GROUPS
                }
            };
        }

        boolean isValidUseGroups = checkUserGroups(app.userGroups, validUserGroups);
        if !isValidUseGroups {
            log:printError(string `Invalid usergroups ${app.userGroups.toString()}`);
            return <http:BadRequest>{
                body:  {
                    message: INVALID_USER_GROUPS
                }
            };
        }

        error? appError = database:createApp(app);
        if appError is error {
            string customError = string `${ERROR_ADDING_APP} : ${app.header}`;
            log:printError(customError, appError);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        return <http:Created>{
            body: {
                message: string `${SUCCESS_APP_ADDED}`
            }
        };
    }

    # Get valid user groups.
    # 
    # + return - Array of user groups, or Forbidden/InternalServerError
    resource function get user\-groups(http:RequestContext ctx) returns string[]|http:Forbidden|http:InternalServerError {
        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError(USER_INFO_HEADER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: USER_INFO_HEADER_NOT_FOUND_ERROR}
            };
        }

        if !authorization:checkPermissions([authorization:authorizedRoles.ADMIN_ROLE], userInfo.groups){
            log:printWarn(string `${UNAUTHORIZED_REQUEST} email: ${userInfo.email} groups: ${
                    userInfo.groups.toString()}`);
            return <http:Forbidden>{
                body: {
                    message: UNAUTHORIZED_REQUEST
                }
            };
        }

        string[]|error? validUserGroups = database:fetchValidUserGroups();
        if validUserGroups is error {
            log:printError(ERROR_RETRIEVING_USER_GROUPS, validUserGroups);
            return<http:InternalServerError>{
                body: {
                    message: ERROR_RETRIEVING_USER_GROUPS
                }
            };
        }

        if validUserGroups is () {
            log:printError(NO_USER_GROUPS);
            return<http:InternalServerError>{
                body: {
                    message: NO_USER_GROUPS
                }
            };
        }

        return validUserGroups;
    }

    # Get tags.
    # + return - Array of tags, or Forbidden/InternalServerError
    resource function get tags(http:RequestContext ctx) returns Tag[]|http:Forbidden|http:InternalServerError {
        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError(USER_INFO_HEADER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: USER_INFO_HEADER_NOT_FOUND_ERROR}
            };
        }

        if !authorization:checkPermissions([authorization:authorizedRoles.ADMIN_ROLE], userInfo.groups){
            log:printWarn(string `${UNAUTHORIZED_REQUEST} email: ${userInfo.email} groups: ${
                    userInfo.groups.toString()}`);
            return <http:Forbidden>{
                body: {
                    message: UNAUTHORIZED_REQUEST
                }
            };
        }

        Tag[]|error? tags = database:fetchTags();
        if tags is error {
            log:printError(ERROR_RETRIEVING_TAGS, tags);
            return <http:InternalServerError>{
                body: {
                    message: ERROR_RETRIEVING_TAGS
                }
            };
        }

        if tags is () {
            log:printError(ERROR_RETRIEVING_TAGS);
            return <http:InternalServerError>{
                body: {
                    message: ERROR_RETRIEVING_TAGS
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
            log:printError(USER_INFO_HEADER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: USER_INFO_HEADER_NOT_FOUND_ERROR}
            };
        }

        boolean isFavourite = action == FAVOURITE;

        ExtendedApp[]|error app = database:fetchAppByFilter({id: id});
        if app is error {
            log:printError(ERROR_VALIDATING_APP_ID, app);
            return <http:InternalServerError>{
                body: {
                    message: ERROR_VALIDATING_APP_ID
                }
            };
        }

        if app.length() === 0 {
            log:printError(string `Application with ID: ${id} was not found!`);  
            return <http:NotFound>{
                body: {
                    message: APP_NOT_FOUND  
                }
            };
        }

        error? upsertError = database:upsertFavourites(userInfo.email, id, isFavourite);
        if upsertError is error {
            log:printError(ERROR_UPSERTING_APP, upsertError, id = id);  
            return <http:InternalServerError>{
                body: {
                    message: ERROR_UPSERTING_APP
                }
            };
        }
        return <http:Ok>{
            body:  {
                message: SUCCESS_FAVOURITE_UPDATED
            }
        };
    }
}
