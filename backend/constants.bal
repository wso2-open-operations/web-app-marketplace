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

// Validation regex patterns
public final string:RegExp WSO2_EMAIL = re `^[a-zA-Z0-9._%+-]+@wso2\.com$`;
public final string:RegExp NON_EMPTY_URL = re `^https?://\S+$`;
public final string:RegExp NON_EMPTY_HEX_VALUE = re `^#(?:[0-9a-fA-F]{3}){1,2}$`;
public final string:RegExp NON_EMPTY_BASE64_STRING = re `^(?:data:image/svg\+xml;base64,)?(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{4}|[A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)$`;

public final string USER_NOT_FOUND_ERROR = "User information header not found!";
public final string ACCESS_DENINED_ERROR = "Access denied: Only administrators can add new apps.";