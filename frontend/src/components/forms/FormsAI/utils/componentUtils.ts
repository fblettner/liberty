/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { IAppsProps } from "@ly_types/lyApplications";
import { IChatMessage } from "@ly_types/lyChat";
import { IModulesProps } from "@ly_types/lyModules";
import { QueryRoute } from "@ly_types/lyQuery";
import { IUsersProps } from "@ly_types/lyUsers";
import React from "react";

export interface IComponentAnalysisProps {
    appsProperties: IAppsProps;
    userProperties: IUsersProps;
    modulesProperties: IModulesProps;
    send_to_ai:  (query: QueryRoute, conversationHistory: Array<{ role: string; content: string }>, modulesProperties: IModulesProps) => Promise<{ message: string }>;
    addMessageToHistory: (message: IChatMessage) => void;
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;  
    setError: React.Dispatch<React.SetStateAction<boolean>>;
    handleError: (error: unknown) => void;
    content: string, 
    isMarkdown: boolean;
    }

export const handleComponentAnalysis = async (params: IComponentAnalysisProps) => {
    const { appsProperties, userProperties, modulesProperties, send_to_ai, addMessageToHistory, setIsLoading, setError, handleError, content, isMarkdown } = params;
    setIsLoading(true);
    setError(false); // Reset error before starting
  
    try {
      const analysisPrompt = `
        You are an intelligent assistant that can analyze React components.
        
        Analyze the following React TSX component:
        
        ${content}
        
        Tasks:
        - Describe the purpose of the component.
        - List the props it accepts (if any).
        - Identify any state variables and their purpose.
        - Suggest how to call functions defined within the component.
        - Provide a summary of its functionality.
  
        Output the analysis in a structured, user-friendly format.
      `;
  
      const analysisResponse = await send_to_ai(QueryRoute.ai_prompt,
        [
          {
            role: "system",
            content: "Analyze the provided React TSX component and respond with clear, structured insights.",
          },
          {
            role: "user",
            content: analysisPrompt,
          },
        ],
        modulesProperties
      );
  
      // Add OpenAI's response to chat history
      addMessageToHistory({
        sender: "Bot",
        message: analysisResponse.message,
        type: "text",
      });
    } catch (error) {
      if (error instanceof Error) {
        handleError(error); // Safe access
      } else {
        handleError(new Error("Unknown error occurred"));
      }
    } finally {
      setIsLoading(false);
    }
  };