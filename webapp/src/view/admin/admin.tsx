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

import AddBoxOutlinedIcon from "@mui/icons-material/AddBoxOutlined";
import DrawOutlinedIcon from "@mui/icons-material/DrawOutlined";
import StyleOutlinedIcon from "@mui/icons-material/StyleOutlined";

import { useEffect } from "react";

import TabsPage from "@layout/pages/TabsPage";
import { fetchApps } from "@root/src/slices/appSlice/app";
import { useAppDispatch } from "@root/src/slices/store";

import CreateApp from "./panel/createApp";
import UpdateApp from "./panel/updateApp";
import CreateTags from "./panel/createTags";

export default function Admin() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchApps());
  }, [dispatch]);

  return (
    <TabsPage
      title={"Admin"}
      tabsPage={[
        {
          tabTitle: "Create App",
          tabPath: "create-app",
          icon: <AddBoxOutlinedIcon />,
          page: <CreateApp />,
        },
        {
          tabTitle: "Update App",
          tabPath: "update-app",
          icon: <DrawOutlinedIcon />,
          page: <UpdateApp />,
        },
        {
          tabTitle: "Create Tags",
          tabPath: "create-tags",
          icon: <StyleOutlinedIcon />,
          page: <CreateTags />,
        },
      ]}
    />
  );
}
