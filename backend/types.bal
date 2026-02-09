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
    string name;
    # Target URL 
    string url;
    # Short description
    string description;
    # Version label of the target app
    string? versionName;
    # Icon asset name/key
    string icon;
    # User who added the link
    string addedBy;
    # Tags as JSON string containing array of tag details
    Tag[] tags;
    # User groups of the target app
    string[] userGroups?;
    # Active status of the app - "1" for active, "0" for inactive
    boolean isActive?;
|};

# Structure of Extended app record containing all app fields.
public type UserApp record {|
    # Unique identifier of the link
    int id;
    # Display title
    string name;
    # Target URL 
    string url;
    # Short description
    string description;
    # Version label of the target app
    string? versionName;
    # Icon asset name/key
    string icon;
    # User who added the link
    string addedBy;
    # Tags as JSON string containing array of tag details
    Tag[] tags;
    # Email of the user who last updated the app
    int isFavourite;
|};

# Structure of Create App record.
public type CreateApp record {|
    # Display title
    string name;
    # Target URL
    @constraint:String {
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
    # Icon asset name or key
    @constraint:String {
        pattern: {
            value: NON_EMPTY_BASE64_STRING,
            message: "icon must be base64 prefixed with data:image/svg+xml;base64"
        }
    }
    string icon;
    # User who added the link
    string addedBy;
    # Tag IDs of the target app
    int[] tags;
    # User groups of the target app
    string[] userGroups;
    # Is the App is active or not
    boolean isActive;
|};

# Structure of UpdateApp record.
public type UpdateApp record {|
    # Display title
    string name?;
    # Target URL 
    string url?;
    # Short description
    string description?;
    # Version label of the target app
    string versionName?;
    # Icon asset name/key
    @constraint:String {
        pattern: {
            value: NON_EMPTY_BASE64_STRING,
            message: "icon must be base64 prefixed with data:image/svg+xml;base64"
        }
    }
    string icon?;
    # Tag IDs of the target app
    int[] tags?;
    # User groups of the target app
    string[] userGroups?;
    # Active status of the app - "1" for active, "0" for inactive
    boolean isActive?;
    # User who added the link
    string updatedBy;
|};

# Structure of Tag record.
public type Tag record {|
    # Unique identifier of the tag
    int id;
    # Display name of the tag
    string name;
    # Color code of the tag
    string color;
|};

# Structure of Create Tag record.
public type CreateTag record {|
    # Display name of the tag
    string name;
    # Color code of the tag
    string color;
    # Email of the tag creator
    string addedBy;
    # Tag active status
    boolean? isActive = true;
|};

# User action for marking/unmarking apps as favourites.
public enum Action {
    # Mark an app as favourite
    FAVOURITE = "favourite",
    # Remove an app from favourites
    UNFAVOURITE = "unfavourite"
}

# Structure of Theme record.
public type Theme record {|
    # Name of the theme
    string name;
    # Label of the theme
    string label;
|};

# Configuration for themes.
public type ThemeConfig record {|
    # Name of the active theme
    string activeThemeName;
    # Map of available themes
    map<Theme> themes;
|};

# Payload sent by the admin to update the active theme.
type UpdateTheme record {|
    # Active theme
    string activeThemeName;
|};

# Filter to filter user groups
public type Filter record {
    # Filter
    string filter?;
};

# Group.
public type Group record {|
    # Group ID
    string id;
    # Display name of the group
    string displayName;
    json...;
|};

# Group search result.
public type GroupSearchResult record {|
    # Total number of groups
    int totalResults;
    # Starting index of the response
    int startIndex;
    # Number of groups returned in the response
    int itemsPerPage;
    # List of group details
    Group[] Resources = [];
    json...;
|};
