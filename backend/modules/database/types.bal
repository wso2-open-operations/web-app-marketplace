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
    @sql:Column {name: "header"}
    string header;
    # Target URL 
    @sql:Column {name: "url"}
    string urlName;
    # Short description
    string description;
    # Version label of the target app
    @sql:Column {name: "version_name"}
    string versionName;
    # Tag/category ID
    @sql:Column {name: "tag_id"}
    int tagId;
    # Icon asset name/key
    @sql:Column {name: "icon"}
    string iconName;
    # User who added the link
    @sql:Column {name: "added_by"}
    string addedBy;
    # Whether the current user has favorited this link (0 = no, 1 = yes)
    @sql:Column {name: "is_favourite"}
    int isFavourite;
|};
