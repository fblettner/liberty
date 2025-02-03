/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import { IChatMessage } from '@ly_types/lyChat';
import { sendPrompt } from '@ly_features/openai';
import { IModulesProps } from '@ly_types/lyModules';
import { handleQueryIntent, handleTableDescription } from '@ly_components/forms/FormsAI/utils/tableUtils';
import { handleComponentAnalysis } from '@ly_components/forms/FormsAI/utils/componentUtils';
import { chunkDocumentation } from '@ly_components/forms/FormsAI/utils/commonUtils';
import { IAppsProps } from '@ly_types/lyApplications';
import { IUsersProps } from '@ly_types/lyUsers';
import documentation from "@ly_components/forms/FormsAI/liberty_documentation.json"; 
import Logger from "@ly_services/lyLogging";
import React from 'react';

// Helper function to read file content
const readFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target?.result as string); // Return the file content as a string
    };
    reader.onerror = (error) => reject(error);
    reader.readAsText(file); // Read the file as text
  });
};

export const handleSendMessage = async (
  appsProperties: IAppsProps,
  userProperties: IUsersProps,
  modulesProperties: IModulesProps,
  message: string,
  selectedFile: File | null,
  chatHistory: IChatMessage[],
  addMessageToHistory: (message: IChatMessage) => void,
  setUserInput: (input: string) => void,
  setSelectedFile: (file: File | null) => void,
  scrollToBottom: () => void,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setIsTruncated: React.Dispatch<React.SetStateAction<boolean>>
) => {
  if (!message.trim() && !selectedFile) return;

  setIsLoading(true); // Start loading spinner

  try {
    let messageToSend = message.trim();

    // If a file is selected, read its content
    if (selectedFile) {
      const fileContent = await readFile(selectedFile);
      messageToSend += `\n\nFile content: ${fileContent}`;

      const userMessage: IChatMessage = {
        sender: "User",
        message: `${message.trim()}\n\nFile sent: ${selectedFile.name}`,
        type: "text",
        fileName: selectedFile.name,
      };

      addMessageToHistory(userMessage);
    } else {
      const userMessage: IChatMessage = {
        sender: "User",
        message,
        type: "text",
      };
      addMessageToHistory(userMessage);
    }

    // Clear user input and file after sending
    setUserInput("");
    setSelectedFile(null);

    // Prepare the chat history for AI
    const chatHistoryForAI = prepareChatHistoryForBot(chatHistory, messageToSend);

    // Send the user's input to OpenAI for intent detection
    const intentPrompt = `
    You are an intelligent assistant that understands user requests in multiple languages, including English and French. 
    If the user asks how to, you should first provide the answer based on the provided documentation content.
    Analyze the user's input and determine their intent. Respond with the following JSON format without extra text:
    {
      "intent": "describe_table" | "documentation" | "analyze_component" | "query_handling" | "unknown",
      "parameters": {
        "table": <table if applicable, null otherwise>,
        "component": <component name if applicable, null otherwise>,
        "language": <language if applicable, "english" otherwise>,
        "query": <query or CRUD operation if applicable, null otherwise>
      }
    }
    
    User input: "${messageToSend}"
  `;

    const intentResponse = await sendPrompt(
      [
        ...chatHistoryForAI,
        { role: "system", content: intentPrompt },
      ],
      modulesProperties
    );
    const parsedIntent = JSON.parse(intentResponse.message);

        // Handle specific intents
    if (parsedIntent.intent === "query_handling" && parsedIntent.parameters.query) {
      const params = {
        appsProperties,
        userProperties,
        modulesProperties,
        sendPrompt,
        addMessageToHistory,
        setIsLoading,
        setError: () => {},
        handleError: () => {},
        userInput: messageToSend,
        isMarkdown: false,
      };

      await handleQueryIntent(params);
      return;
    }

    // Intent-specific logic
    if (parsedIntent.intent === "describe_table" && parsedIntent.parameters.table) {
      const userInput = parsedIntent.parameters;
      const isMarkdownRequest = messageToSend.toLowerCase().includes("markdown");

      addMessageToHistory({
        sender: "Bot",
        message: `Fetching details for Table: ${userInput.table}...`,
        type: "text",
      });

      const params = {
        appsProperties,
        userProperties,
        modulesProperties,
        sendPrompt,
        addMessageToHistory,
        setIsLoading,
        setError: () => {},
        handleError: () => {},
        userInput: messageToSend,
        isMarkdown: isMarkdownRequest,
      };
      await handleTableDescription(params);
      return;
    }

    if (parsedIntent.intent === "analyze_component" && parsedIntent.parameters.component) {
      const isMarkdownRequest = messageToSend.toLowerCase().includes("markdown");
      const component = parsedIntent.parameters.component;

      const params = {
        appsProperties,
        userProperties,
        modulesProperties,
        sendPrompt,
        addMessageToHistory,
        setIsLoading,
        setError: () => {},
        handleError: () => {},
        content: component,
        isMarkdown: isMarkdownRequest,
      };

      await handleComponentAnalysis(params);
      return;
    }

    if (parsedIntent.intent === "documentation") {
      const chunks = chunkDocumentation(documentation);

      const documentationPrompt = `
        You are a documentation assistant. A user has asked the following question:

        "${messageToSend}"

        Use the provided documentation content to find and answer the question. Focus on the most relevant sections and always give the source URL.

        Documentation:
        ${chunks
          .map(
            (chunk, index) =>
              `Chunk ${index + 1}:\nTitle: ${chunk.title}\nURL: ${chunk.url}\nContent: ${chunk.content}\n`
          )
          .join("\n\n")}
      `;

      const botResponse = await sendPrompt(
        [
          ...chatHistoryForAI,
          {
            role: "system",
            content: "You are a documentation assistant that provides answers based on provided documentation content.",
          },
          {
            role: "user",
            content: documentationPrompt,
          },
        ],
        modulesProperties
      );
      
      addMessageToHistory({
        sender: "Bot",
        message: botResponse.message,
        type: "text",
      });
      setIsTruncated(botResponse.isTruncated); // Set truncation state

      return;
    }

    const botResponse = await sendPrompt(
      [
        ...chatHistoryForAI,
        {
          role: "user",
          content: messageToSend,
        },
      ],
      modulesProperties
    );
    addMessageToHistory({
      sender: "Bot",
      message: botResponse.message,
      type: "text",
    });


  } catch (error) {
    const logger = new Logger({
      transactionName: "lyChat.handleSendMessage",
      modulesProperties: modulesProperties,
      data: error
    });
    logger.logException("handleSendMessage: Failed to send message to AI");

    console.error(error);
    addMessageToHistory({
      sender: "Bot",
      message: `An error occurred while processing your request. Please try again.`,
      type: "text",
    });
  } finally {
    scrollToBottom(); // Ensure it scrolls to the bottom after sending
    setIsLoading(false); // Stop loading spinner
  }
};

// Helper function to prepare chat history for AI
const prepareChatHistoryForBot = (chatHistory: IChatMessage[], message: string) => {
  return [
    ...chatHistory.map((chat) => ({
      role: chat.sender === 'User' ? 'user' : 'assistant',
      content: chat.message,
    })),
    { role: 'user', content: message },
  ];
};