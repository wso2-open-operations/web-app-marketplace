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

service http:InterceptableService / on new http:Listener(9095) {

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
            string customError = string `Error occurred while fetching user information: ${userInfo.email}`;
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
    # + ctx - Request context carrying authenticated user info
    # + return - App[] on success, 404 when no apps, or 500 on internal errors
    resource function get apps(http:RequestContext ctx) returns App[]|http:NotFound|http:InternalServerError {
        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError(USER_INFO_HEADER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: USER_INFO_HEADER_NOT_FOUND_ERROR}
            };
        }

        App[]|error? result = database:fetchAppByRoles(userInfo.email, userInfo.groups);

        if result is error {
            string customError = "Error while retrieving apps";
            log:printError(customError, result);
            return <http:InternalServerError>{
                body: {message: customError}
            };
        }

        if result is () {
            string customError = string `No apps found for user : ${userInfo.email}`;
            log:printError(customError);
            return <http:NotFound>{
                body: {message: customError}
            };
        }

        return result;
    }

    resource function patch apps(http:RequestContext ctx, string id, string active)
        returns http:Ok|http:NotFound|http:BadRequest|http:InternalServerError|http:NotModified {

        authorization:CustomJwtPayload|error userInfo =
            ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError(USER_INFO_HEADER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: "Authentication information not found in request. Please ensure you are logged in."}
            };
        }

        int|error appId = int:fromString(id);
        int|error isFav = int:fromString(active);

        if appId is error || isFav is error {
            string customError = string `Invalid request parameters. 'id' and 'isFav' should be valid numbers`;
            return <http:BadRequest>{
                body: {
                    message: customError
                }
            };
        }

        if isFav != 0 && isFav != 1 {
            return <http:BadRequest>{
                body: {
                    message: "Invalid 'active' value. It must be 0 (to unfavorite) or 1 (to favorite)"
                }
            };
        }

        // Validate app_id exists
        boolean|error isValid = database:isValidAppId(appId);
        if isValid is error {
            string customError = string `Invalid app_id ...`;
            log:printError(customError, isValid);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        if !isValid {
            string customError = string `Application with ID ${id} was not found in the system`;
            log:printInfo(customError);
            return <http:NotFound>{
                body: {
                    message: customError
                }
            };
        }

        error|boolean result = database:updateFavourites(userInfo.email, appId, isFav);

        if result is error {
            string customError = string `Failed to update favorite status for application ${id}`;
            log:printError(customError, result);
            return <http:InternalServerError>{
                body: {
                    message: customError
                }
            };
        }

        if result is true {
            string customError = string `Successfully ${isFav == 1 ? "added to" : "removed from"} favorites`;
            return <http:Ok>{
                body: {
                    message: customError
                }
            };
        }

        string customError = string `User ${userInfo.email} not found while trying to update favorites`;
        log:printError(customError);
        return <http:NotModified>{
            body: {
                message: customError
            }
        };
    }
}
