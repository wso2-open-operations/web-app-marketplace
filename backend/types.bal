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

# Structure for Action Enum
public enum Action {
    FAVOURITE = "favourite",
    UNFAVOURITE = "unfavourite"
}
