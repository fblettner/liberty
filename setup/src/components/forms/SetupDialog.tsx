/** @jsxImportSource @emotion/react */
import { useState } from "react";
import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import axios from "axios";
import { Div_AppsLayout } from "@ly_components/styles/Div";

// Styles
const Container = styled.div`
  display: flex;
  min-height: 100vh;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  padding: 20px;
`;

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  font-size: 1.5rem;
  margin-bottom: 16px;
`;

const Input = styled.input`
  width: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 1rem;
  
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  background: #007bff;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 10px;
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const LogContainer = styled.div`
  margin-top: 10px;
  padding: 10px;
  background: #eaeaea;
  border-radius: 6px;
  font-size: 0.9rem;
  max-height: 100px;
  overflow-y: auto;
`;

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
  const [formData, setFormData] = useState({
    host: "localhost",
    port: "5433",
    database: "liberty",
    user: "liberty",
    password: "change_on_install",
  });

  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const logMessage = (message: string) => {
    setLogs((prevLogs) => [...prevLogs, message]);
  };

  const handleInstall = async () => {
    setLoading(true);
    setLogs([]);
    logMessage("Starting installation...");
    setProgress(20);

    try {
      let queryAPI = window.location.href + "api/setup/install"
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
            window.location.reload();
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
    <Div_AppsLayout>
      <Card>
        <Title>Installation</Title>

        <Input name="host" placeholder="Database Host" value={formData.host} onChange={handleChange} />
        <Input name="port" placeholder="Port" value={formData.port} onChange={handleChange} />
        <Input name="database" placeholder="Database Name" value={formData.database} onChange={handleChange} />
        <Input name="user" placeholder="User" value={formData.user} onChange={handleChange} />
        <Input name="password" placeholder="Password" type="password" value={formData.password} onChange={handleChange} />

        {loading && (
          <>
            <ProgressBar progress={progress} />
            <div css={{ display: "flex", justifyContent: "center", marginTop: "10px" }}>
              <Spinner />
            </div>
          </>
        )}

        <LogContainer>
          {logs.map((log, index) => (
            <div key={index}>{log}</div>
          ))}
        </LogContainer>

        <Button onClick={handleInstall} disabled={loading}>
          Proceed
        </Button>
      </Card>
    </Div_AppsLayout>
  );
}