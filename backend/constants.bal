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

// Error messages
public const USER_INFO_HEADER_NOT_FOUND_ERROR = "User information header not found!";
public const UNAUTHORIZED_REQUEST = "Access denied: Only administrators can add new apps.";
public const ERROR_RETRIEVING_APPS = "Error while retrieving apps";
public const ERROR_VALIDATING_APP_ID = "Error occurred while validating the App ID";
public const ERROR_VALIDATING_APP = "Error occurred while validating app";
public const ERROR_ADDING_APP = "Error occurred while adding app";
public const ERROR_UPSERTING_APP = "Error occurred while upserting the app";
public const ERROR_FETCHING_USER_INFO = "Error occurred while fetching user information";
public const ERROR_RETRIEVING_TAGS = "Error occurred while retrieving tags";
public const ERROR_RETRIEVING_USER_GROUPS = "Error occurred while retrieving user groups";

// Success messages
public const SUCCESS_APP_ADDED = "Successfully added app to the store";
public const SUCCESS_FAVOURITE_UPDATED = "Successfully updated";

// Not found messages
public const NO_APPS_FOUND = "No apps found for user";
public const NO_USER_FOUND = "No user found!";
public const APP_NOT_FOUND = "Application not found";
public const NO_USER_GROUPS = "There are no user groups. Before adding usergroups you have to create new user groups";
public const APP_ALREADY_EXISTS = "Application with app name and url already exists";

// Validation messages
public const INVALID_USER_GROUPS = "Invalid usergroups";

public final string:RegExp WSO2_EMAIL = re `^[a-zA-Z0-9._%+-]+@wso2\.com$`;
public final string:RegExp NON_EMPTY_URL = re `^https?://\S+$`;
public final string:RegExp NON_EMPTY_HEX_VALUE = re `^#(?:[0-9a-fA-F]{3}){1,2}$`;
public final string:RegExp NON_EMPTY_BASE64_STRING = re `^(?:data:image/svg\+xml;base64,)?(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$`;
