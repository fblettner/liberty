/** @jsxImportSource @emotion/react */
import { Fragment, useState } from "react";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import axios from "axios";
import { Div_AppsSetup, Div_Logs, Div_Setup, Div_SetupLayout, Main_Content, Paper_Setup } from "@ly_components/styles/Div";
import { LYLogoIcon } from "@ly_styles/icons";
import { Input } from '@ly_components/common/Input';
import { Button } from "@ly_components/common/Button";
import { Checkbox } from "@ly_components/common/Checkbox";

enum SetupStep {
  INIT = "init",
  WIZARD = "wizard",
  INSTALL = "install",
  UPGRADE = "upgrade",
  UPDATE = "update",
  RESTORE = "restore"
}


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
  const [step, setStep] = useState(SetupStep.INIT); // Track form step
  const [formData, setFormData] = useState({
    host: "pg",
    port: "5432",
    database: "liberty",
    user: "liberty",
    password: "change_on_install",
    current_password: "change_on_install",
    admin_password: "nomana",
    enterprise: false,
    keycloak: false,
    airflow: false,
    gitea: false,
    load_data: false,
    load_features: false
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

  const handleInstall = async (event: React.MouseEvent<HTMLButtonElement>) => {
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
      logMessage("Failed to install. Check your details: " + error);
      setLoading(false);
    }
  };

  const handleRestore = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLoading(true);
    setLogs([]);
    logMessage("Starting installation...");
    setProgress(20);

    try {
      let queryAPI = window.location.origin + "/api/setup/restore"
      logMessage("Restoring database...");
      setProgress(50);
      const response = await axios.post(queryAPI, JSON.stringify(formData), {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.data;
      if (data.status === "success") {
        setProgress(100);
        logMessage("Restore complete! Redirecting...");

        // 🔄 Refresh the page after a short delay (1.5s)
        setTimeout(() => {
          window.location.href = window.location.origin;
        }, 1500);
      } else {
        logMessage(`Error: ${data.items[0].message}`);
        setLoading(false);
      }
    } catch (error) {
      logMessage("Failed to restore. Check your details: " + error);
      setLoading(false);
    }
  };

  const handleUpgrade = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLoading(true);
    setLogs([]);
    logMessage("Starting upgrade...");
    setProgress(20);

    try {
      let queryAPI = window.location.origin + "/api/setup/upgrade"
      logMessage("Upgrading database...");
      setProgress(50);
      const response = await axios.post(queryAPI, JSON.stringify(formData), {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.data;
      if (data.status === "success") {
        setProgress(100);
        logMessage("Upgrade complete! Redirecting...");

        // 🔄 Refresh the page after a short delay (1.5s)
        setTimeout(() => {
          window.location.href = window.location.origin;
        }, 1500);
      } else {
        logMessage(`Error: ${data.items[0].message}`);
        setLoading(false);
      }
    } catch (error) {
      logMessage("Failed to install. Check your details: " + error);
      setLoading(false);
    }
  };

  const handlePrepare = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLoading(true);
    setLogs([]);
    logMessage("Prepare upgrade...");
    setProgress(20);

    try {
      let queryAPI = window.location.origin + "/api/setup/prepare"
      logMessage("Preparing database...");
      setProgress(50);
      const response = await axios.post(queryAPI, JSON.stringify(formData), {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.data;
      if (data.status === "success") {
        setProgress(100);
        logMessage("Preparation complete! You can create a revision...");
        setLoading(false);
      } else {
        logMessage(`Error: ${data.items[0].message}`);
        setLoading(false);
      }
    } catch (error) {
      logMessage("Failed to prepare. Check your details: " + error);
      setLoading(false);
    }
  };

  const handleRevision = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLoading(true);
    setLogs([]);
    logMessage("Create a revision...");
    setProgress(20);

    try {
      let queryAPI = window.location.origin + "/api/setup/revision?message=upgrade"
      logMessage("Creating a revision for the database...");
      setProgress(50);
      const response = await axios.post(queryAPI, {}, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.data;
      if (data.status === "success") {
        setProgress(100);
        logMessage("Revision complete! You can start the upgrade...");
        setLoading(false);
      } else {
        logMessage(`Error: ${data.items[0].message}`);
        setLoading(false);
      }
    } catch (error) {
      logMessage("Failed to create a revision. Check your details: " + error);
      setLoading(false);
    }
  };

  const handleUpdate = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setLoading(true);
    setLogs([]);
    logMessage("Starting update...");
    setProgress(20);

    try {
      let queryAPI = window.location.origin + "/api/setup/update"
      logMessage("Updating database...");
      setProgress(50);
      const response = await axios.post(queryAPI, JSON.stringify(formData), {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const data = await response.data;
      if (data.status === "success") {
        setProgress(100);
        logMessage("Update complete! Redirecting...");

        // 🔄 Refresh the page after a short delay (1.5s)
        setTimeout(() => {
          window.location.href = window.location.origin;
        }, 1500);
      } else {
        logMessage(`Error: ${data.items[0].message}`);
        setLoading(false);
      }
    } catch (error) {
      logMessage("Failed to install. Check your details: " + error);
      setLoading(false);
    }
  };

  return (
    <Div_SetupLayout>
      <Main_Content>
        <Div_Setup>
          <Paper_Setup>
            <LYLogoIcon width="75px" height="75px" />
            <Form_Setup noValidate >
              {step !== SetupStep.INIT && step !== SetupStep.WIZARD &&
                <Div_AppsSetup>
                  <Button_Setup variant="contained" onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); setStep(SetupStep.WIZARD) }} disabled={loading}>
                    Previous
                  </Button_Setup>
                </Div_AppsSetup>
              }
              {step === SetupStep.WIZARD &&
                <Div_AppsSetup>
                  <Button_Setup variant="contained" onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); setStep(SetupStep.INIT) }} disabled={loading}>
                    Previous
                  </Button_Setup>
                </Div_AppsSetup>
              }
              {step === SetupStep.INIT && (
                <>
                  <Title>Setup - Step 1 of 2</Title>
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
                      id="current_password"
                      name="current_password"
                      label="Current Database Password"
                      type="password"
                      value={formData.current_password}
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
                      label="New Database Password"
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

              {step === SetupStep.RESTORE && (
                <>
                  <Title>Restore clean database</Title>
                  <Div_AppsSetup>
                    <Checkbox
                      id="enterprise"
                      checked={formData.enterprise}
                      onChange={handleChange}
                      label="Do you want to restore enterprise features?"
                      labelPlacement="end"
                    />

                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Checkbox
                      id="keycloak"
                      checked={formData.keycloak}
                      onChange={handleChange}
                      label="Do you want to restore Keycloak?"
                      labelPlacement="end"
                    />

                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Checkbox
                      id="airflow"
                      checked={formData.airflow}
                      onChange={handleChange}
                      label="Do you want to restore Airflow?"
                      labelPlacement="end"
                    />
                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Checkbox
                      id="gitea"
                      checked={formData.gitea}
                      onChange={handleChange}
                      label="Do you want to restore Gitea?"
                      labelPlacement="end"
                    />
                  </Div_AppsSetup>
                  <Button_Setup fullWidth variant="contained" disabled={loading} onClick={handleRestore}>
                    Start Restore
                  </Button_Setup>
                </>
              )}


              {step === SetupStep.INSTALL && (
                <>
                  <Title>Install a new platform</Title>
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
                  <Button_Setup fullWidth variant="contained" disabled={loading} onClick={handleInstall}>
                    Start Installation
                  </Button_Setup>
                </>
              )}

              {step === SetupStep.UPDATE && (
                <>
                  <Title>Update current installation</Title>
                  <Div_AppsSetup>
                    <Checkbox
                      id="enterprise"
                      checked={formData.enterprise}
                      onChange={handleChange}
                      label="Are you using enterprise features?"
                      labelPlacement="end"
                    />

                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Checkbox
                      id="keycloak"
                      checked={formData.keycloak}
                      onChange={handleChange}
                      label="Are you using Keycloak?"
                      labelPlacement="end"
                    />

                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Checkbox
                      id="airflow"
                      checked={formData.airflow}
                      onChange={handleChange}
                      label="Are you using Airflow?"
                      labelPlacement="end"
                    />
                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Checkbox
                      id="gitea"
                      checked={formData.gitea}
                      onChange={handleChange}
                      label="Are you using Gitea?"
                      labelPlacement="end"
                    />
                  </Div_AppsSetup>
                  <Button_Setup fullWidth variant="contained" disabled={loading} onClick={handleUpdate}>
                    Start Update
                  </Button_Setup>
                </>
              )}
              {step === SetupStep.UPGRADE && (
                <>
                  <Title>Upgrade current installation</Title>
                  <Div_AppsSetup>
                    <Checkbox
                      id="enterprise"
                      checked={formData.enterprise}
                      onChange={handleChange}
                      label="Are you using enterprise features?"
                      labelPlacement="end"
                    />

                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Checkbox
                      id="keycloak"
                      checked={formData.keycloak}
                      onChange={handleChange}
                      label="Are you using Keycloak?"
                      labelPlacement="end"
                    />

                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Checkbox
                      id="airflow"
                      checked={formData.airflow}
                      onChange={handleChange}
                      label="Are you using Airflow?"
                      labelPlacement="end"
                    />
                  </Div_AppsSetup>
                  <Div_AppsSetup>
                    <Checkbox
                      id="gitea"
                      checked={formData.gitea}
                      onChange={handleChange}
                      label="Are you using Gitea?"
                      labelPlacement="end"
                    />
                  </Div_AppsSetup>
                  <Button_Setup fullWidth variant="contained" disabled={loading} onClick={handlePrepare}>
                    Prepare Upgrade
                  </Button_Setup>
                  <Button_Setup fullWidth variant="contained" disabled={loading} onClick={handleRevision}>
                    Create a revision
                  </Button_Setup>
                  <Button_Setup fullWidth variant="contained" disabled={loading} onClick={handleUpgrade}>
                    Start Upgrade
                  </Button_Setup>
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
              {step === SetupStep.INIT && (
                <Button_Setup fullWidth variant="contained" onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); setStep(SetupStep.WIZARD) }}>
                  Next
                </Button_Setup>
              )}

              {step === SetupStep.WIZARD && (
                <Fragment>
                  <Title>Setup - Step 2 of 2</Title>
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
                  <Button_Setup fullWidth variant="contained" disabled={loading} onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); setStep(SetupStep.UPDATE) }}>
                    Update Settings
                  </Button_Setup>
                  <Button_Setup fullWidth variant="contained" disabled={loading} onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); setStep(SetupStep.INSTALL) }}>
                    Install
                  </Button_Setup>
                  <Button_Setup fullWidth variant="contained" disabled={loading} onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); setStep(SetupStep.UPGRADE) }}>
                    Upgrade
                  </Button_Setup>
                  <Button_Setup fullWidth variant="contained" disabled={loading} onClick={(event: React.MouseEvent<HTMLButtonElement>) => { event.preventDefault(); setStep(SetupStep.RESTORE) }}>
                    Restore Clean Database
                  </Button_Setup>
                </Fragment>
              )}
            </Form_Setup>
          </Paper_Setup>
        </Div_Setup>
      </Main_Content>
    </Div_SetupLayout >
  );
}