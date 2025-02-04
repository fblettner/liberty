/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import axios, { AxiosError } from 'axios';

// Custom Import
import Logger from '@ly_services/lyLogging';
import { IModulesProps } from '@ly_types/lyModules';
import { GlobalSettings } from '@ly_utils/GlobalSettings';
import { QueryRoute } from '@ly_types/lyQuery';


export const sendPrompt = async (conversationHistory: Array<{ role: string; content: string }>, modulesProperties: IModulesProps) => {
  try {
    const response = await axios.post(GlobalSettings.getBackendURL + QueryRoute.prompt,
      {history: conversationHistory},
    );

    return {
      message: response.data.message,
      isTruncated: response.data.is_truncated,
    };
  } catch (error: unknown) {
    const logger = new Logger({
      transactionName: 'AI.sendPrompt',
      modulesProperties: modulesProperties,
      data: error instanceof AxiosError ? error.response?.data || error.message : 'Unknown error',
    });
    logger.logException('AI: Error fetching response');

    return {
      message: 'Error fetching response',
      isTruncated: false,
    };
  }
}

