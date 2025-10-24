import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import DrawOutlinedIcon from '@mui/icons-material/DrawOutlined';
import StyleOutlinedIcon from '@mui/icons-material/StyleOutlined';

import TabsPage from "@root/src/layout/pages/TabsPage";

import CreateApp from "./panel/createApp";
import UpdateApp from "./panel/updateApp";
import CreateTags from "./panel/createTags";


export default function Admin() {
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
                    page: <UpdateApp/>,
                },
                {
                    tabTitle: "Create Tags",
                    tabPath: "create-tags",
                    icon: <StyleOutlinedIcon />,
                    page: <CreateTags/>,
                }
            ]} />
    )
}
