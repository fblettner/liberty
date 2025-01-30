/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import axios, { AxiosError } from 'axios';
import OpenAI from 'openai';

// Custom Import
import Logger from '@ly_services/lyLogging';
import { IModulesProps } from '@ly_types/lyModules';


const apiKey = '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';
// Set up OpenAI API configuration with your API key
const openai = new OpenAI({
  apiKey: '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',
  dangerouslyAllowBrowser: true
});

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
          Authorization: `Bearer ${apiKey}`,
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

// Function to generate an image from a prompt
export const generateImageFromPrompt = async (prompt: string, modulesProperties: IModulesProps): Promise<string> => {
  try {
    const response = await openai.images.generate({
      prompt: prompt,
      n: 1, // Number of images to generate
      size: "1024x1024", // Size of the generated image
    });

    const imageUrl = response.data[0]?.url; // Optional chaining to handle undefined

    if (!imageUrl) {
      throw new Error('Image URL is undefined');
    }

    return imageUrl; // Return the image URL
  } catch (error) {
    const logger = new Logger({
      transactionName: "openai.generateImageFromPrompt",
      modulesProperties: modulesProperties,
      data: error
    });
    logger.logException("AI: Error generating image:");
    throw new Error('Image generation failed');
  }
};