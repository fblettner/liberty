/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import axios, { AxiosError } from 'axios';

// Custom Import
import Logger from '@ly_services/lyLogging';
import { IModulesProps } from '@ly_types/lyModules';

const api_key = ""

const estimateTokens = (text: string): number => {
  return Math.ceil(text.length / 4);
};

export const sendPrompt = async (conversationHistory: Array<{ role: string; content: string }>, modulesProperties: IModulesProps) => {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions',

      {
        model: 'gpt-4o-mini',
        messages: conversationHistory, // Send the entire conversation history
        max_tokens: 1500,
      },
      {
        headers: {
          Authorization: `Bearer ${api_key}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const messageContent = response.data.choices[0].message.content.trim();
    const newContentLength = estimateTokens(messageContent);
    let isTruncated = false
    if (newContentLength >= 1500 - 50) { // Threshold and retry limit
      isTruncated = true
    }


    return {
      message: messageContent,
      isTruncated,
    };
  } catch (error: unknown) {
    const logger = new Logger({
      transactionName: 'openai.sendPrompt',
      modulesProperties: modulesProperties,
      data: error instanceof AxiosError ? error.response?.data || error.message : 'Unknown error',
    });
    logger.logException('AI: Error fetching from OpenAI');

    return {
      message: 'Error fetching response',
      isTruncated: false,
    };
  }
}

