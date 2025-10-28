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
import ballerinax/mysql;

# [Configurable] Database configs.
type DatabaseConfig record {|
    # If the MySQL server is secured, the username
    string user;
    # The password of the MySQL server for the provided username
    string password;
    # The name of the database
    string database;
    # Hostname of the MySQL server
    string host;
    # Port number of the MySQL server
    int port;
    # The `mysql:Options` configurations
    mysql:Options options?;
    # The `sql:ConnectionPool` configurations
    sql:ConnectionPool connectionPool?;
|};

# [Database] Tag record.
public type Tag record {|
    # Unique identifier of the tag
    int id;
    # Display name of the tag
    string name;
    # Color code of the tag
    string color;
|};

# Structure of Tag record.
public type CreateTag record {|
    # Display name of the tag
    string name;
    # Color code of the tag
    string color;
    # Email of the tag creator
    string addedBy;
|};

# [Database] App record to fetch apps with comma seperated tags.
public type AppRecord record {|
    # Unique identifier of the link
    int id;
    # Display title
    string name;
    # Target URL 
    string url;
    # Short description
    string description;
    # Version label of the target app
    @sql:Column {name: "version_name"}
    string versionName;
    # Icon asset name/key
    string icon;
    # User who added the link
    @sql:Column {name: "added_by"}
    string addedBy;
    # Tags as JSON array containing tag details
    string tags;
    # User groups of the target app
    @sql:Column {name: "user_groups"}
    string userGroups?;
    # Active status of the app - "1" for active, "0" for inactive
    @sql:Column {name: "is_active"}
    boolean isActive?;
|};

# [Database] App record.
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
    @sql:Column {name: "version_name"}
    string versionName;
    # Icon asset name/key
    string icon;
    # User who added the link
    @sql:Column {name: "added_by"}
    string addedBy;
    # Tags as JSON array containing tag details
    Tag[] tags;
    # User groups of the target app
    @sql:Column {name: "user_groups"}
    string[] userGroups?;
    # Active status of the app - "1" for active, "0" for inactive
    @sql:Column {name: "is_active"}
    boolean isActive?;
|};

# [Database] Extended user app record with comma seperated tags.
public type UserAppRecord record {|
    # Unique identifier of the link
    int id;
    # Display title
    string name;
    # Target URL 
    string url;
    # Short description
    string description;
    # Version label of the target app
    @sql:Column {name: "version_name"}
    string versionName;
    # Icon asset name/key
    string icon;
    # User who added the link
    @sql:Column {name: "added_by"}
    string addedBy;
    # Tags as JSON array containing tag details
    string tags;
    # Email of the user who last updated the app
    @sql:Column {name: "is_favourite"}
    int isFavourite;
|};

# [Database] Extended app record.
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
    @sql:Column {name: "version_name"}
    string versionName;
    # Icon asset name/key
    string icon;
    # User who added the link
    @sql:Column {name: "added_by"}
    string addedBy;
    # Tags as JSON array containing tag details
    Tag[] tags;
    # Email of the user who last updated the app
    @sql:Column {name: "is_favourite"}
    int isFavourite;
|};

# [Database] Create App record.
public type CreateApp record {|
    # Display title
    string name;
    # Target URL 
    string url;
    # Short description
    string description;
    # Version label of the target app
    @sql:Column {name: "version_name"}
    string versionName;
    # Icon asset name/key
    string icon;
    # User who added the link
    @sql:Column {name: "added_by"}
    string addedBy;
    # Tag IDs of the target app
    int[] tags;
    # User groups of the target app
    @sql:Column {name: "user_groups"}
    string[] userGroups;
    # Is the App is active or not
    @sql:Column {name: "is_active"}
    boolean isActive;
|};

# [Database] Update App record.
public type UpdateApp record {|
    # Display title
    string name?;
    # Target URL 
    string url?;
    # Short description
    string description?;
    # Version label of the target app
    @sql:Column {name: "version_name"}
    string versionName?;
    # Icon asset name/key
    string icon?;
    # Tag IDs of the target app
    int[] tags?;
    # User groups of the target app
    string[] userGroups?;
    # Active status of the app - "1" for active, "0" for inactive
    @sql:Column {name: "is_active"}
    boolean isActive?;
    # User who added the link
    @sql:Column {name: "updated_by"}
    string updatedBy;
|};

# [Database] Filter criteria for querying apps with optional conditions.
public type AppsFilter record {|
    # Unique identifier of the app to filter by
    int? id = ();
    # Display title/App name to filter by
    string? name = ();
    # Target URL to filter by
    string? url = ();
    # Email of the user who added the app
    string? addedBy = ();
    # Active status filter 
    string? isActive = ();
    # user groups associated with the app 
    string[]? userGroups = ();
|};

# [Database] Filter criteria for querying a app with optional conditions.
public type AppFilter record {|
    # Unique identifier of the app to filter by
    int? id = ();
    # Display title/App name to filter by
    string? name = ();
    # Target URL to filter by
    string? url = ();
|};
