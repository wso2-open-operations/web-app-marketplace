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
import web_app_marketplace.people;

import ballerina/constraint;

# Response for fetching user information.
type UserInfo record {|
    *people:Employee;
    # Array of privileges assigned to the user
    int[] privileges;
    json...;
|};

# Structure of App record.
public type App record {|
    # Unique identifier of the link
    int id;
    # Display title
    string header;
    # Target URL
    string url;
    # Short description
    string description;
    # Version label of the target app
    string versionName;
    # Tag id of the target app
    int tagId;
    # Tag name of the target app
    string tagName;
    # Tag color of the target app
    string tagColor;
    # Icon asset name or key
    string icon;
    # User who added the link
    string addedBy;
    # Whether the current user has favorited this link (0 = no, 1 = yes)
    int isFavourite;
|};

# [Database] Create App record.
public type CreateApp record {|
    # Display title
    string header;
    # Target URL
    @constraint:String{
        pattern: {
            value: NON_EMPTY_URL,
            message: "The URL should be non empty and valid URL"
        }
    }
    string url;
    # Short description
    string description;
    # Version label of the target app
    string versionName;
    # Tag id of the target app
    int tagId;
    # Tag name of the target app
    string tagName;
    # Tag color of the target app
    @constraint:String {
        pattern: {
            value: NON_EMPTY_HEX_VALUE,
            message: "Color value should be a valid  hex value"
        }
    }
    string tagColor;
    # Icon asset name or key
    @constraint:String{
        pattern: {
            value: NON_EMPTY_BASE64_STRING,
            message: "icon must be base64 (optionally prefixed with data:image/svg+xml;base64"
        }
    }
    string icon;
    # User who added the link
    string addedBy;
    # User groups of the target app
    string[] userGroups;
    # Is the App is active or not
    boolean isActive;
|};

# [Database] Tag record.
public type Tag record {|
    # Unique identifier of the tag
    int id;
    # Display name of the tag
    string name;
|};

# User action for marking/unmarking apps as favourites.
public enum Action {
    # Mark an app as favourite
    FAVOURITE = "favourite",
    # Remove an app from favourites
    UNFAVOURITE = "unfavourite"
}

# Filter criteria for querying apps with optional conditions.
public type AppFilters record {|
    # Unique identifier of the app to filter by
    int? id = ();
    # Display title/header to filter by
    string? header = ();
    # Target URL to filter by 
    string? url = ();
    # Email of the user who added the app
    string? addedBy = ();
    # Active status filter
    string? isActive = ();
    # Comma-separated user groups associated with the app
    string? userGroups = ();
|};

# Extended app record containing all app fields plus.
public type ExtendedApp record {|
    *App;
    # Email of the user who last updated the app
    string updatedBy;
    # Active status of the app - "1" for active, "0" for inactive
    string isActive;
|};
