/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// Custom Import
import { ToolsDictionary } from "@ly_services/lyDictionary";
import { ToolsQuery } from "@ly_services/lyQuery";
import { lyGetTableProperties } from "@ly_services/lyTables";
import { IAppsProps, ESessionMode, EApplications } from "@ly_types/lyApplications";
import { IChatAction, IChatMessage } from "@ly_types/lyChat";
import { CDialogContent, EDialogDetails, IDialogContent } from "@ly_types/lyDialogs";
import { EDictionaryRules, EDictionaryType } from "@ly_types/lyDictionary";
import { QueryMethod, QuerySource, ResultStatus } from "@ly_types/lyQuery";
import { EUsers, IUsersProps } from "@ly_types/lyUsers";
import Logger from "@ly_services/lyLogging";
import { EEnumHeader, EEnumValues, IEnumOption } from "@ly_types/lyEnums";
import { ELookup, ILookupOption } from "@ly_types/lyLookup";
import { ActionsType, IContentValue, IRestData } from "@ly_utils/commonUtils";
import { IModulesProps } from "@ly_types/lyModules";
import React from "react";
import { ComponentProperties, LYComponentMode, LYComponentType } from "@ly_types/lyComponents";
import { ETableHeader, IColumnsProperties, ITableRow } from "@ly_types/lyTables";
import { ENextNumber } from "@ly_types/lyNextNum";
import { ESequence } from "@ly_types/lySequence";

interface ai_response_json {
  query_id: string,
  query_type: string,
  sql_query: { [key: string]: string },
  table_id: string
}

export interface ITableAIProps {
  appsProperties: IAppsProps;
  userProperties: IUsersProps;
  modulesProperties: IModulesProps;
  sendPrompt: (conversationHistory: Array<{ role: string; content: string }>, modulesProperties: IModulesProps) => Promise<{ message: string }>;
  addMessageToHistory: (message: IChatMessage) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<boolean>>;
  handleError: (error: unknown) => void;
  userInput: string;
  isMarkdown: boolean;
}


const insertOrUpdateData = async (params: IInsertOrUpdateDataProps) => {
  const { appsProperties, userProperties, modulesProperties, sendPrompt, addMessageToHistory, setIsLoading, setError, handleError, userInput, isMarkdown, matchedTableID, matchedQueryID, response_json } = params;

  // Fetch table properties for the matched table ID
  const tableProperties = await lyGetTableProperties({
    appsProperties,
    userProperties,
    [ETableHeader.id]: matchedTableID,
    getAllColumns: true,
    modulesProperties,
  });

  // Call createRestDataFromQuery to fill parameters dynamically
  const restData = await createRestDataFromQuery({
    appsProperties,
    userProperties,
    modulesProperties,
    userInput,
    sqlQuery: response_json.sql_query,
    columns: tableProperties.columns,
  });

  // Decide the operation (INSERT or UPDATE) based on the query type
  if (restData) {
    // Format the JSON with indentation and line breaks between fields
    const formattedJson = JSON.stringify(restData, null, 2).replace(/,\n/g, ',\n');
    addMessageToHistory({
      sender: "Bot",
      message: "Inserted values are:\n ```json\n" + formattedJson + "\n```",
      type: "text",
    });
  }
  else {
    addMessageToHistory({
      sender: "Bot",
      message: "No valid data are provided. Please try again.",
      type: "text",
    });
    return;
  }

  let result;
  if (response_json.query_type === QueryMethod.insert) {
    result = await ToolsQuery.post(
      {
        source: QuerySource.Query,
        framework_pool: appsProperties[EApplications.pool],
        query: matchedQueryID, // Use the correct Query ID for INSERT
        sessionMode: appsProperties[EApplications.session],
        modulesProperties,
        jwt_token: appsProperties[EApplications.jwt_token]
      },
      JSON.stringify(restData)
    );
  } else {
    result = await ToolsQuery.put(
      {
        source: QuerySource.Query,
        framework_pool: appsProperties[EApplications.pool],
        query: matchedQueryID, // Use the correct Query ID for UPDATE
        sessionMode: appsProperties[EApplications.session],
        modulesProperties,
        jwt_token: appsProperties[EApplications.jwt_token]
      },
      JSON.stringify(restData)
    );
  }

  // Add the result to chat history
  const formattedJson = JSON.stringify(result, null, 2).replace(/,\n/g, ',\n');

  if (result.status === ResultStatus.success) {
    let dialogContent: CDialogContent = new CDialogContent();
    dialogContent.fields[ETableHeader.id] = {
      [EDialogDetails.id]: ETableHeader.id,
      [EDialogDetails.rules]: null,
      [EDialogDetails.rulesValues]: null,
      value: Number(restData[ETableHeader.id]),
      [EDialogDetails.target]: null,
      [EDialogDetails.disabled]: false,
      [EDialogDetails.required]: false,
      [EDialogDetails.visible]: true,
      [EDialogDetails.key]: false,
      [EDialogDetails.dynamic_params]: "",
      [EDialogDetails.fixed_params]: "",
      [EDialogDetails.output_params]: "",
      [EDialogDetails.cdn_id]: null,
      [EDialogDetails.cdn_dynamic_params]: null,
      [EDialogDetails.cdn_fixed_params]: null,
      [EDialogDetails.type]: "number",
    };

    dialogContent.fields[ETableHeader.dbName] = {
      [EDialogDetails.id]: ETableHeader.dbName,
      [EDialogDetails.rules]: null,
      [EDialogDetails.rulesValues]: null,
      value: restData[ETableHeader.dbName],
      [EDialogDetails.target]: null,
      [EDialogDetails.disabled]: false,
      [EDialogDetails.required]: false,
      [EDialogDetails.visible]: true,
      [EDialogDetails.key]: false,
      [EDialogDetails.dynamic_params]: "",
      [EDialogDetails.fixed_params]: "",
      [EDialogDetails.output_params]: "",
      [EDialogDetails.cdn_id]: null,
      [EDialogDetails.cdn_dynamic_params]: null,
      [EDialogDetails.cdn_fixed_params]: null,
      [EDialogDetails.type]: "string",
    };


    dialogContent.fields[ETableHeader.formLabel] = {
      [EDialogDetails.id]: ETableHeader.formLabel,
      [EDialogDetails.rules]: null,
      [EDialogDetails.rulesValues]: null,
      value: restData[ETableHeader.formLabel],
      [EDialogDetails.target]: null,
      [EDialogDetails.disabled]: false,
      [EDialogDetails.required]: false,
      [EDialogDetails.visible]: true,
      [EDialogDetails.key]: false,
      [EDialogDetails.dynamic_params]: "",
      [EDialogDetails.fixed_params]: "",
      [EDialogDetails.output_params]: "",
      [EDialogDetails.cdn_id]: null,
      [EDialogDetails.cdn_dynamic_params]: null,
      [EDialogDetails.cdn_fixed_params]: null,
      [EDialogDetails.type]: "string",
    };

    let component: ComponentProperties = {
      id: 1,
      componentMode: LYComponentMode.edit,
      type: LYComponentType.FormsAI,
      filters: [],
      showPreviousButton: false,
      label: "Reverse Table from AI",
      isChildren: false,
    }

    let action: IChatAction[] = [];
    action.push({
      id: restData[ETableHeader.id] as number,
      componentID: 2,
      label: "Reverse Table",
      type: ActionsType.button,
      dynamic_params: "",
      fixed_params: "",
      pool_params: appsProperties[EApplications.pool],
      component: component,
      dialogContent: dialogContent
    })
    action.push(
      {
        id: restData[ETableHeader.id] as number,
        componentID: 1,
        label: "Generate Queries",
        type: ActionsType.button,
        dynamic_params: "",
        fixed_params: "",
        pool_params: appsProperties[EApplications.pool],
        component: component,
        dialogContent: dialogContent

      }
    )
    action.push(
      {
        id: restData[ETableHeader.id] as number,
        componentID: 3,
        label: "Generate Dialog",
        type: ActionsType.button,
        dynamic_params: "",
        fixed_params: "",
        pool_params: appsProperties[EApplications.pool],
        component: component,
        dialogContent: dialogContent

      }
    )

    addMessageToHistory({
      sender: "Bot",
      message: "Query executed successfully, you can reverse the table, create queries and dialogs.",
      type: "action",
      action: action
    });
  } else {
    addMessageToHistory({
      sender: "Bot",
      message: "Query result is:\n ```json\n" + formattedJson + "\n```",
      type: "text",
    });
  }

}

const getDataFromTable = async (params: IInsertOrUpdateDataProps) => {
  const { appsProperties, userProperties, modulesProperties, sendPrompt, addMessageToHistory, setIsLoading, setError, handleError, userInput, isMarkdown, matchedTableID, matchedQueryID, response_json } = params;

  // Fetch table properties for the matched table ID
  const tableProperties = await lyGetTableProperties({
    appsProperties,
    userProperties,
    [ETableHeader.id]: matchedTableID,
    getAllColumns: true,
    modulesProperties,
  });

  let result;
  result = await ToolsQuery.get(
    {
      source: QuerySource.Query,
      framework_pool: appsProperties[EApplications.pool],
      query: matchedQueryID, // Use the correct Query ID for INSERT
      sessionMode: appsProperties[EApplications.session],
      modulesProperties,
      jwt_token: appsProperties[EApplications.jwt_token]
    }
  );

  if (result.status === ResultStatus.success) {
    if (result.items.length === 0) {



      addMessageToHistory({
        sender: "Bot",
        message: "No data found for the table.",
        type: "text",
      });
      return;
    } else {
      // Add the result to chat history
      const formattedJson = JSON.stringify(result, null, 2).replace(/,\n/g, ',\n');

      // Step 1: Ask AI to summarize relevant values
      const followUpPrompt = `
    You are an AI assistant analyzing query results. A user has made the following request:
    "${userInput}"
    The user has executed a query with the following result:
    ${formattedJson}

    Instructions:
    1. Extract the most relevant values from the result for the user.
    2. Provide a concise summary in plain text, highlighting key data or insights from the result, if user ask for details, provide a detailed response with the relevant values.
    3. Ensure the response is user-friendly and avoids excessive technical details.
    `;
      setIsLoading(true)
      const aiResponse = await sendPrompt(
        [
          {
            role: "system",
            content: followUpPrompt,
          },
          {
            role: "user",
            content: "Please summarize or provide detailed results based on the user request.",
          },
        ],
        modulesProperties
      );
      setIsLoading(false)
      // Step 2: Display the AI response in chat history
      addMessageToHistory({
        sender: "Bot",
        message: aiResponse.message.trim(),
        type: "text",
      });
    }
  } else {
    addMessageToHistory({
      sender: "Bot",
      message: "Query execution failed. Please try again.",
      type: "text",
    });
    return;
  }
}


export const handleTableDescription = async (params: ITableAIProps) => {
  const {
    appsProperties,
    userProperties,
    modulesProperties,
    sendPrompt,
    addMessageToHistory,
    setIsLoading,
    setError,
    handleError,
    userInput,
    isMarkdown,
  } = params;

  setIsLoading(true);
  setError(false); // Reset error before starting

  try {
    // Fetch the list of tables (ID, name, and description)
    const rest = await ToolsQuery.get({
      source: QuerySource.Query,
      framework_pool: appsProperties[EApplications.pool],
      query: 10, // Assuming query ID 10 corresponds to fetching table metadata
      sessionMode: ESessionMode.framework,
      language: userProperties[EUsers.language],
      modulesProperties,
      jwt_token: appsProperties[EApplications.jwt_token]
    });

    const tableList = rest.items; // Assuming rest.items contains the table metadata
    if (!tableList || tableList.length === 0) {
      addMessageToHistory({
        sender: "Bot",
        message: "No tables found in the system.",
        type: "text",
      });
      return;
    }

    // Use AI to determine the correct table ID based on user input
    const followUpPrompt = `
        You are an intelligent assistant helping the user describe a table.
        
        The user provided the following input: "${userInput}"
        
        The system provides the following tables:
        ${tableList
        .map(
          (table: ITableRow) =>
            `Table ID: ${table.TBL_ID}, Name: ${table.TBL_DB_NAME || ""}, Description: ${table.TBL_LABEL || ""}`
        )
        .join("\n")}
        
        If the user's input matches one table, return the table ID as JSON: {"table_id": "<table_id>"}.
        If no match is found, return: {"table_id": "unknown"}.
        If multiple matches are found, return a unordered plain-text list of the matching tables in the format provided above.
    `;

    const botResponse = await sendPrompt(
      [
        {
          role: "system",
          content: followUpPrompt,
        },
        {
          role: "user",
          content: `Find the table ID for the input: "${userInput}"`,
        },
      ],
      modulesProperties
    );

    const parsedResponse = botResponse.message.trim();

    // Try parsing JSON response
    try {
      const responseData = JSON.parse(parsedResponse);
      const matchedTableID = Number(responseData.table_id);

      if (!isNaN(matchedTableID)) {
        // Single match found
        addMessageToHistory({
          sender: "Bot",
          message: `Matched Table ID: ${matchedTableID}. Fetching details...`,
          type: "text",
        });

        // Fetch table properties for the matched table ID
        const tableProperties = await lyGetTableProperties({
          appsProperties,
          userProperties,
          [ETableHeader.id]: matchedTableID,
          getAllColumns: true,
          modulesProperties,
        });

        // Generate detailed descriptions for each column
        const fieldsDescription = tableProperties.columns
          .map(
            (col: IColumnsProperties) =>
              `Field Name: **${col.header}** (${col.accessorKey})\nData Type: ${col.type || "unknown"}\nDescription: Generate a relevant description"
              }\n${col.required ? "**[Required]**" : ""}`
          )
          .join("\n\n");

        // Generate the output format
        const description = isMarkdown
          ? `
            \`\`\`markdown
            # Table ID: ${matchedTableID}
            # Table Description: ${tableProperties.tableProperties.tableDescription}
            
            ## Fields
            
            ${fieldsDescription}
            
            ## Notes
            This documentation is auto-generated for Table ID: ${matchedTableID}.
            \`\`\`
          `
          : `
            Table ID: ${matchedTableID}
            Table Description: ${tableProperties.tableProperties.tableDescription}
            
            Fields:
            ${fieldsDescription}
            
            Notes:
            This documentation is auto-generated for Table ID: ${matchedTableID}.
          `;

        // Construct the prompt for OpenAI
        const displayPrompt = `
          You are assisting the user to describe a table. you must provide the table description in user language: ${userInput}.
          ${isMarkdown
            ? "Provide the table description in markdown format with detailed field descriptions."
            : "Provide the table description in a detailed, structured format with detailed field descriptions."
          }
          ${description}
        `;

        const finalBotResponse = await sendPrompt(
          [
            {
              role: "system",
              content: displayPrompt,
            },
            {
              role: "user",
              content: `Describe the table ${matchedTableID}${isMarkdown ? " in markdown" : ""}.`,
            },
          ],
          modulesProperties
        );

        // Add OpenAI's response to chat history
        const botMessage: IChatMessage = {
          sender: "Bot",
          message: finalBotResponse.message,
          type: "text",
        };

        addMessageToHistory(botMessage);
      } else {
        // Handle unexpected JSON format
        throw new Error("Unexpected JSON format.");
      }
    } catch (error) {
      // Handle plain-text responses (multiple matches)
      if (parsedResponse.startsWith("- Table ID")) {
        addMessageToHistory({
          sender: "Bot",
          message: `Multiple matches found:\n\n${parsedResponse}`,
          type: "text",
        });
      } else {
        // Handle unknown responses
        addMessageToHistory({
          sender: "Bot",
          message: `Could not process the AI response: ${parsedResponse}`,
          type: "text",
        });
      }
    }
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


export const handleQueryIntent = async (params: ITableAIProps) => {
  const {
    appsProperties,
    userProperties,
    modulesProperties,
    sendPrompt,
    addMessageToHistory,
    setIsLoading,
    setError,
    handleError,
    userInput,
  } = params;

  setIsLoading(true);
  setError(false); // Reset error before starting

  try {
    // Fetch table metadata
    let rest = await ToolsQuery.get({
      source: QuerySource.Query,
      framework_pool: appsProperties[EApplications.pool],
      query: 10, // Query ID 10 for fetching table metadata
      sessionMode: ESessionMode.framework,
      language: userProperties[EUsers.language],
      modulesProperties,
      jwt_token: appsProperties[EApplications.jwt_token]
    });

    const tableList = rest.items;
    if (!tableList || tableList.length === 0) {
      addMessageToHistory({
        sender: "Bot",
        message: "No tables found in the system.",
        type: "text",
      });
      return;
    }

    // Fetch stored queries
    rest = await ToolsQuery.get({
      source: QuerySource.Query,
      framework_pool: appsProperties[EApplications.pool],
      query: 3, // Query ID 3 for fetching stored queries
      sessionMode: ESessionMode.framework,
      language: userProperties[EUsers.language],
      modulesProperties,
      jwt_token: appsProperties[EApplications.jwt_token]
    });

    const queryList = rest.items;
    if (!queryList || queryList.length === 0) {
      addMessageToHistory({
        sender: "Bot",
        message: "No stored queries found in the system.",
        type: "text",
      });
      return;
    }

    const followUpPrompt = `
    You are an AI assistant that understands SQL queries and database operations. A user has made the following request:
    "${userInput}"
    
    The system has the following tables:
    ${tableList.map(
      (table: ITableRow) =>
        `- Table ID: ${table.TBL_ID}, Name: ${table.TBL_DB_NAME || "No Name"}, Description: ${table.TBL_LABEL || "No Description"}`
    ).join("\n")}
    
    The system also has the following stored queries:
    ${queryList.map(
      (q: ITableRow) => `- Query ID: ${q.QUERY_ID}, Type: ${q.QUERY_CRUD}, SQL: ${q.QUERY_SQLQUERY || "No SQL"}`
    ).join("\n")}
    
    ### Instructions:
    1. **Analyze the user's input** to identify the table mentioned.
    2. **Cross-reference** the identified table with the list of stored queries to find the most relevant query.
    3. **Extract the correct table_id and query_id:**
        - **table_id** refers to the ID of the table in the system (e.g., from the list of tables provided).
        - **query_id** refers to the ID of the relevant query associated with the table.
    4. Determine the required CRUD operation (INSERT, UPDATE, etc.) based on the user's intent and the "Type" field in the query.
    5. Respond strictly in the following format **without deviating** and with all fields from sql_query:
    
    #### Response Format:
    Provide a detailed explanation followed by the JSON block:
    ---
    
    Explanation:
    Based on your input, the relevant table mentioned is "<table_name>" with id "<table_id>". You will perform a <CRUD operation> on this table.
    
    \`\`\`json
    {
      "table_id": "<table_id> of the relevant table",
      "query_id": "<query_id> of the most relevant query",
      "sql_query": {
        "<parameter_name_1>": "<value or null>",
        "<parameter_name_2>": "<value or null>",
        ...
      },
      "query_type": "<CRUD operation>"
    }
    \`\`\`
    
    6. Ensure that the "table_id" matches the ID from the table list and **not the query_id**.
    7. Do not include additional text or deviate from the format.
    `;

    const botResponse = await sendPrompt(
      [
        {
          role: "system",
          content: followUpPrompt,
        },
        {
          role: "user",
          content: userInput,
        },
      ],
      modulesProperties
    );

    // Log bot response
    let response_json;
    const jsonMatch = botResponse.message.match(/```json([\s\S]*?)```/);
    if (jsonMatch && jsonMatch[1]) {
      response_json = JSON.parse(jsonMatch[1].trim()); // Parse only the JSON part
    } else {
      throw new Error("JSON block not found in the response.");
    }

    // Display the human-readable part of the message
    const humanMessage = botResponse.message.trim().replace(/```json([\s\S]*?)```/, "").trim();
    addMessageToHistory({
      sender: "Bot",
      message: humanMessage,
      type: "text",
    });

    if (!response_json.table_id || !response_json.query_id) {
      throw new Error("AI did not return a valid table ID or query ID.");
    }
    const matchedTableID = Number(response_json.table_id);
    const matchedQueryID = Number(response_json.query_id);

    if (isNaN(matchedTableID)) {
      throw new Error("Invalid table ID returned by AI.");
    }

    if (isNaN(matchedQueryID)) {
      throw new Error("Invalid query ID returned by AI.");
    }

    const params = {
      appsProperties,
      userProperties,
      modulesProperties,
      sendPrompt,
      addMessageToHistory,
      setIsLoading,
      setError,
      handleError,
      userInput,
      isMarkdown: false,
      matchedTableID,
      matchedQueryID,
      response_json,
    }
    switch (response_json.query_type) {
      case QueryMethod.insert:
      case QueryMethod.update:
        insertOrUpdateData(params);
        break;
      case QueryMethod.select:
        getDataFromTable(params);
        break;
    }

  } catch (error) {
    handleError(error); // Handle errors gracefully
    addMessageToHistory({
      sender: "Bot",
      message: "An error occurred while processing your request. Please try again.",
      type: "text",
    });
  } finally {
    setIsLoading(false);
  }
};

export interface IInsertOrUpdateDataProps {
  appsProperties: IAppsProps;
  userProperties: IUsersProps;
  modulesProperties: IModulesProps;
  sendPrompt: (conversationHistory: Array<{ role: string; content: string }>, modulesProperties: IModulesProps) => Promise<{ message: string }>;
  addMessageToHistory: (message: IChatMessage) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setError: React.Dispatch<React.SetStateAction<boolean>>;
  handleError: (error: unknown) => void;
  userInput: string,
  isMarkdown: boolean;
  matchedTableID: number;
  matchedQueryID: number;
  response_json: ai_response_json
}

export interface IOriginalObject {
  [key: string]:  string | number | boolean | Date | null ;
}

export interface ITransformedObject {
  [key: string]: { value: string | number | boolean | Date | null | unknown };
}

export function convertRowtoContent(originalObject: IOriginalObject) {
  const transformedObject: ITransformedObject = {};

  // Loop through each key in the original object
  for (const key in originalObject) {
      // Dynamically set each key in the transformed object
      transformedObject[key] = { value: originalObject[key] };
  }

  return transformedObject;
}

export const createRestDataFromQuery = async (params: {
  appsProperties: IAppsProps;
  userProperties: IUsersProps;
  modulesProperties: IModulesProps;
  userInput: string; // User-provided data for the query
  sqlQuery: { [key: string]: string }; // Enhanced JSON response from AI
  columns: IColumnsProperties[];
}) => {
  const {
    appsProperties,
    userProperties,
    modulesProperties,
    userInput,
    sqlQuery,
    columns,
  } = params;

  let restData: IRestData = {};

  try {
    // Step 1: Process AI-provided values from `sqlQuery`
    const sqlQueryKeys = Object.keys(sqlQuery);

    await Promise.all(
      sqlQueryKeys.map(async (param) => {
        const aiProvidedValue = sqlQuery[param];
        if (aiProvidedValue !== null) {
          // Use the AI-provided value if available
          restData[param] = aiProvidedValue;
        }

        // Handle dynamic generation based on column rules
        const column = columns?.find((col) => col.accessorKey === param);
        if (column !== undefined) {
          const columnRule = column.rules;
          switch (columnRule) {
            case EDictionaryRules.lookup:
              if (aiProvidedValue !== null && aiProvidedValue !== undefined) {
                let data = Object.keys(sqlQuery).reduce((acc, key) => {
                  acc[key] = { value: sqlQuery[key] };
                  return acc;
                }, {} as Record<string, { value: IContentValue }>);

                const results = await ToolsDictionary.getLookup({
                  appsProperties,
                  userProperties,
                  [ELookup.id]: parseInt(column.rulesValues),
                  data: data,
                  dynamic_params: column.dynamic_params,
                  fixed_params: column.fixed_params,
                  getAllValues: false,
                  modulesProperties,
                  value: aiProvidedValue,
                });
                if (results.status === ResultStatus.success && results.data !== undefined && results.data !== null && results.data.length > 0) {
                  const dd_id = results.header[ELookup.dd_id] as keyof ILookupOption;
                  const dd_label = results.header[ELookup.dd_label] as keyof ILookupOption;
                  restData[param + "_LABEL"] = results.data[0][dd_label];
                  if (column.output_params !== undefined && column.output_params !== null) {
                    // Parse the output_params (e.g., SY=SY;RT=RT)
                    const params = column.output_params.split(';');
                    params.forEach((param: string) => {
                      const [inputKey, outputKey] = param.split('=');
                      if (inputKey && outputKey && inputKey in results.data[0]) {
                        restData[outputKey] = results.data[0][inputKey as keyof ILookupOption];
                      }
                    });
                  }
                }
              } else
                restData[param] = aiProvidedValue;
              break;

            case EDictionaryRules.enum:
              if (aiProvidedValue !== null && aiProvidedValue !== undefined) {
                const results = await ToolsDictionary.getEnums({
                  appsProperties: appsProperties,
                  userProperties: userProperties,
                  [EEnumHeader.id]: parseInt(column.rulesValues),
                  modulesProperties
                });
                if (results.status === ResultStatus.success && results.data !== undefined && results.data !== null && results.data.length > 0) {
                  const enumLabel = results.data.find((enumData: IEnumOption) => enumData[EEnumValues.value] === aiProvidedValue)
                  restData[param + "_LABEL"] = enumLabel[EEnumValues.label];
                }
              } else
                restData[param] = aiProvidedValue;
              break;

            case EDictionaryRules.sequence:
              const sequence = await ToolsDictionary.getSequence({
                appsProperties,
                [ESequence.id]: parseInt(column?.rulesValues),
                data: convertRowtoContent(sqlQuery) as IDialogContent,
                dynamic_params: column?.dynamic_params,
                fixed_params: column?.fixed_params,
                modulesProperties,
              });
              restData[param] = sequence;
              break;

            case EDictionaryRules.nextNumber:
              const nextNumber = await ToolsDictionary.getNextNumber({
                appsProperties,
                userProperties,
                [ENextNumber.id]: column?.rulesValues,
                modulesProperties,
              });
              restData[param] = nextNumber;
              break;

            case EDictionaryRules.boolean:
              restData[param] = aiProvidedValue ?? "N"; // Default boolean value
              break;

            case EDictionaryRules.login:
              restData[param] = userProperties[EUsers.id]; // Current user ID
              break;

            case EDictionaryRules.sysdate:
            case EDictionaryRules.current_date:
              if (column?.type === EDictionaryType.jdedate) {
                restData[param] = ToolsDictionary.DateToJde(new Date().toISOString());
              } else {
                restData[param] = new Date().toISOString();
              }
              break;
            case EDictionaryRules.default:
              restData[param] = aiProvidedValue ?? column.rulesValues;
              break;
            default:
              if (column === undefined)
                restData[param] = aiProvidedValue;
              else
                restData[param] = aiProvidedValue ?? column.default;
          }
        }
      })
    );
    return restData; // Return the populated restData object
  } catch (error) {
    const logger = new Logger({
      transactionName: "tableUtils.handleQueryIntent",
      modulesProperties: modulesProperties,
      data: restData
    });
    logger.logException("createRestDataFromQuery: Error creating restData");
    throw error; // Handle errors upstream
  }
};