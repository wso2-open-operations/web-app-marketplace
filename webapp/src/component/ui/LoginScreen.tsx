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
import LoadingButton from "@mui/lab/LoadingButton";
import { Box, Card, CardContent, Container, Stack, useTheme } from "@mui/material";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import { APP_NAME } from "@root/src/config/config";
import { APP_DESC } from "@root/src/config/constant";
import { useAppAuthContext } from "@root/src/context/AuthContext";
import BackgroundImage from "@src/assets/images/app-login-background.png";
import ProductLogos from "@src/assets/images/app-login-logos.png";
import logo from "@src/assets/images/wso2-logo-black.png";

const LoginScreen = () => {
  const { appSignIn, appSignOut } = useAppAuthContext();
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        justifyContent: "center",
        backgroundImage: `url(${BackgroundImage})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        p: 0,
        color: theme.palette.customText.primary.p2.active,
      }}
    >
      <Container fixed maxWidth="xs">
        <Card
          elevation={24}
          sx={{
            borderRadius: 3,
            backgroundColor: theme.palette.surface.secondary.active,
            p: 2.5,
          }}
        >
          <CardContent sx={{ paddingY: 0 }}>
            <Grid
              container
              direction="column"
              justifyContent="center"
              alignItems="center"
              spacing={2.5}
            >
              <img alt="logo" width="130" height="auto" src={logo}></img>

              <Typography align="center" sx={{ fontWeight: "600" }} variant="h5">
                {APP_NAME}
              </Typography>

              <Typography
                variant="body1"
                align="center"
                sx={{ color: theme.palette.customText.primary.p2.active }}
              >
                {APP_DESC}
              </Typography>

              <LoadingButton
                variant="contained"
                color="primary"
                sx={{ fontWeight: "bold" }}
                onClick={() => {
                  appSignOut();

                  appSignIn();
                }}
              >
                LOG IN
              </LoadingButton>

              <Stack
                direction="column"
                spacing={2}
                color={theme.palette.customText.primary.p4.active}
              >
                <Typography align="center">Powered By</Typography>

                <Stack direction="row" spacing={2}>
                  <img height={22} alt="Product logos" src={ProductLogos} />
                </Stack>
              </Stack>
            </Grid>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default LoginScreen;
