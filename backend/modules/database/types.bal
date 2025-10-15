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

# [Database] App record.
public type App record {|
    # Unique identifier of the link
    @sql:Column {name: "id"}
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
    # Tag/category ID
    @sql:Column {name: "tag_id"}
    int tagId;
    # Tag name of the target app
    @sql:Column {name: "tag_name"}
    string tagName;
    # Tag color of the target app
    @sql:Column {name: "color"}
    string tagColor;
|};

# [Database] Extended app record containing all app fields.
public type ExtendedApp record {|
    *App;
    # Email of the user who last updated the app
    @sql:Column {name: "is_favourite"}
    string isFavourite;
    # Active status of the app - "1" for active, "0" for inactive
    @sql:Column {name: "is_active"}
    string isActive;
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
    # Tag/category ID
    @sql:Column {name: "tag_id"}
    int tagId;
    # Tag name of the target app
    @sql:Column {name: "name"}
    string tagName;
    # Tag color of the target app
    @sql:Column {name: "color"}
    string tagColor;
    # User groups of the target app
    @sql:Column {name: "user_groups"}
    string[] userGroups;
    # Is the App is active or not
    @sql:Column {name: "is_active"}
    boolean isActive;
|};

# Result record for app ID validation queries.
type ValidAppResult record {|
    # 1 if app exists and is active, 0 otherwise
    @sql:Column {name: "is_valid"}
    int isValid;
|};

# [Database] Tag record.
public type Tag record {|
    # Unique identifier of the tag
    @sql:Column {name: "id"}
    int id;
    # Display name of the tag
    @sql:Column {name: "name"}
    string name;
|};

# Filter criteria for querying apps with optional conditions.
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
    # Comma-separated user groups associated with the app 
    string[]? userGroups = ();
|};
