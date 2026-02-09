// Copyright (c) 2026 WSO2 LLC. (https://www.wso2.com).
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

# Retrieves groups from the SCIM service based on the provided filter criteria.
#
# + filter - The filter criteria to search for groups
# + return - A GroupSearchResult containing the search results or an error if the operation fails
public isolated function getGroups(Filter filter) returns GroupSearchResult|error {
    return scimOperationsClient->/organizations/internal/groups/search.post(filter);
}