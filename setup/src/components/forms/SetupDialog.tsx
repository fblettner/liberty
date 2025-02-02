/** @jsxImportSource @emotion/react */
import { Fragment, useState } from "react";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import axios from "axios";
import { Div_AppsSetup, Div_DialogToolbar, Div_DialogToolbarButtons, Div_Logs, Div_Setup, Div_SetupLayout, Main_Content, Paper_Setup } from "@ly_components/styles/Div";
import { LYLogoIcon } from "@ly_styles/icons";
import { Input } from '@ly_components/common/Input';
import { Button } from "@ly_components/common/Button";
import { Checkbox } from "@ly_components/common/Checkbox";

// Styles
const Form_Setup = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));

const Title = styled.h2`
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 16px;
`;

export const Button_Setup = styled(Button)(({ theme, variant }) => ({
  marginTop: theme.spacing(2),
  color: theme.palette.text.primary,
  "&:hover": {
    boxShadow: theme.shadows[4],
    background: theme.palette.primary.main,
    transform: "scale(1.03)",
  },
}));

const progressBarAnimation = keyframes`
  from { width: 0; }
  to { width: 100%; }
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: ${({ progress }) => progress}%;
  height: 8px;
  background: #28a745;
  border-radius: 6px;
  transition: width 0.5s ease-in-out;
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid #007bff;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default function SetupDialog() {
  const [step, setStep] = useState(1); // Track form step
  const [formData, setFormData] = useState({
    host: "localhost",
    port: "5432",
    database: "liberty",
    user: "liberty",
    password: "nomana",
    admin_password: "nomana",
    enterprise: false,
    keycloak: false,
    airflow: false,
    gitea: false,
    load_data: false,
  });

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {

    const { id, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: type === "checkbox" ? checked : value,
    }));
  };

  const logMessage = (message: string) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  const handleInstall = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setLogs([]);
    logMessage("Starting installation...");
    setProgress(20);

    try {
      let queryAPI = window.location.origin + "/api/setup/install"
      logMessage("Creating database...");
      setProgress(50);
      const response = await axios.post(queryAPI, JSON.stringify(formData), {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.data;
      if (data.status === "success") {
        setProgress(100);
        logMessage("Installation complete! Redirecting...");

        // 🔄 Refresh the page after a short delay (1.5s)
        setTimeout(() => {
          window.location.href = window.location.origin;
        }, 1500);
      } else {
        logMessage(`Error: ${data.items[0].message}`);
        setLoading(false);
      }
    } catch (error) {
      logMessage("Failed to install. Check your details.");
      setLoading(false);
    }
  };

  return (
    <Div_SetupLayout>
      <Main_Content>
        <Div_Setup>
          <Paper_Setup>
            <LYLogoIcon width="75px" height="75px" />
            <Form_Setup noValidate onSubmit={handleInstall}>
              <Title>Installation - Step {step} of 2</Title>

              {step === 1 && (
                <>
                  <Div_AppsSetup>
                    <Input
                      id="host"
                      name="host"
                      label="Database Host"
                      value={formData.host}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="standard"
                    />
                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Input
                      id="port"
                      name="port"
                      label="Port"
                      value={formData.port}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="standard"
                    />
                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Input
                      id="database"
                      name="database"
                      label="Database Name"
                      value={formData.database}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="standard"
                    />
                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Input
                      id="user"
                      name="user"
                      label="User"
                      value={formData.user}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="standard"
                    />
                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Input
                      id="password"
                      name="password"
                      label="Password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="standard"
                    />
                  </Div_AppsSetup>
                </>
              )}

              {step === 2 && (
                <>
                  <Div_AppsSetup>
                    <Input
                      id="admin_password"
                      name="admin_password"
                      label="Admin Password"
                      type="password"
                      value={formData.admin_password}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="standard"
                    />
                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Checkbox
                      id="enterprise"
                      checked={formData.enterprise}
                      onChange={handleChange}
                      label="Do you want to install enterprise features? (license is required)"
                      labelPlacement="end"
                    />

                  </Div_AppsSetup>                
                  <Div_AppsSetup>
                    <Checkbox
                      id="keycloak"
                      checked={formData.keycloak}
                      onChange={handleChange}
                      label="Do you want to install Keycloak?"
                      labelPlacement="end"
                    />

                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Checkbox
                      id="airflow"
                      checked={formData.airflow}
                      onChange={handleChange}
                      label="Do you want to install Airflow?"
                      labelPlacement="end"
                    />
                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Checkbox
                      id="gitea"
                      checked={formData.gitea}
                      onChange={handleChange}
                      label="Do you want to install Gitea?"
                      labelPlacement="end"
                    />
                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Checkbox
                      id="load_data"
                      checked={formData.load_data}
                      onChange={handleChange}
                      label="Do you want to load data (this will erase all current database)?"
                      labelPlacement="end"
                    />
                  </Div_AppsSetup>                  
                </>
              )}
              {loading && (
                <>
                  <ProgressBar progress={progress} />
                  <div css={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
                    <Spinner />
                  </div>

                </>
              )}
              <Div_Logs>
                {logs.map((log, index) => (
                  <div key={index}>{log}</div>
                ))}
              </Div_Logs>
              {step === 1 && (
                <Button_Setup fullWidth variant="contained" onClick={() => setStep(2)}>
                  Next
                </Button_Setup>
              )}

              {step === 2 && (
                <Div_DialogToolbar>
                  <Div_DialogToolbarButtons>
                    <Button_Setup fullWidth variant="contained" onClick={() => setStep(1)} disabled={loading}>
                      Previous
                    </Button_Setup>
                    <Button_Setup type="submit" fullWidth variant="contained"  disabled={loading}>
                      Install
                    </Button_Setup>
                  </Div_DialogToolbarButtons>
                </Div_DialogToolbar>
              )}
            </Form_Setup>
          </Paper_Setup>
        </Div_Setup>
      </Main_Content>
    </Div_SetupLayout>
  );
}