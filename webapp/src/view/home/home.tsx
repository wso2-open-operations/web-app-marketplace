import { Box } from "@mui/material";
import AppCard from "../../component/ui/AppCard";
import {
  RootState,
  useAppDispatch,
  useAppSelector,
} from "@root/src/slices/store";
import { fetchAppLinks } from "@root/src/slices/appSlice/app";
import { State } from "@root/src/types/types";

export default function Home() {
  const dispatch = useAppDispatch();

  dispatch(fetchAppLinks());

  const apps = useAppSelector((state: RootState) => state.appLinks);

  return (
    <Box
      sx={{
        padding: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
      }}
    >
      <AppCard
        title="People App"
        description="Your comprehensive hub for all Customer Success tooling resources"
        logoUrl="https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png"
        logoAlt="Google Logo"
        category="HR"
        appUrl="https://www.google.com"
      />
    </Box>
  );
}
