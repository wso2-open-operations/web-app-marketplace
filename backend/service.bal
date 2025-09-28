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
import app_store.authorization;
import app_store.database;
import app_store.people;

import ballerina/cache;
import ballerina/http;
import ballerina/log;

final cache:Cache cache = new ({
    capacity: 2000,
    defaultMaxAge: 1800.0,
    cleanupInterval: 900.0
});

@display {
    label: "Visitor Service",
    id: "people-ops-suite/visitor-service"
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
    resource function get user\-info(http:RequestContext ctx) returns UserInfo|http:InternalServerError {
        // User information header.
        authorization:CustomJwtPayload|error userInfo = ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError(USER_INFO_HEADER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {
                    message: USER_INFO_HEADER_NOT_FOUND_ERROR
                }
            };
        }

        // Check if the employees are already cached.
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
            return <http:InternalServerError>{
                body: {
                    message: "No information found for the user!"
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

    # Handle GET /links and return app links visible to the user.
    #
    # + ctx - Request context carrying authenticated user info
    # + return - AppLinks[] on success, 404 when no links, or 500 on internal errors
    resource function get links(http:RequestContext ctx)
        returns AppLinks[]|http:NotFound|http:InternalServerError {

        // read user info from header context
        authorization:CustomJwtPayload|error userInfo =
        ctx.getWithType(authorization:HEADER_USER_INFO);
        if userInfo is error {
            log:printError(USER_INFO_HEADER_NOT_FOUND_ERROR, userInfo);
            return <http:InternalServerError>{
                body: {message: USER_INFO_HEADER_NOT_FOUND_ERROR}
            };
        }

        // fetch links for user's roles
        AppLinks[]|error? result =
        database:getCollectionByRoles(userInfo.email, userInfo.groups);

        // db/repo failure → 500
        if result is error {
            string customError = "Error while retrieving app links";
            log:printError(customError, result);
            return <http:InternalServerError>{
                body: {message: customError}
            };
        }

        // no links for these roles 
        if result is () {
            string customError = string `No app links found for user : ${userInfo.email}`;
            log:printError(customError, result);
            return <http:NotFound>{
                body: {message: customError}
            };
        }

        return result;
    }
}
