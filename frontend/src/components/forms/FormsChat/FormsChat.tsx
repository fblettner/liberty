/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { useCallback } from 'react';

// Custom Import
import { IChatMessage } from '@ly_types/lyChat';
import { MarkDown } from '@ly_components/common/MarkDown';
import { InputAction } from '@ly_components/input/InputAction';
import { ActionsType } from '@ly_utils/commonUtils';
import { IActionsStatus } from '@ly_types/lyActions';
import { Typography } from '@ly_components/common/Typography';
import { Div_ChatActions, Div, DivFormsChat } from '@ly_components/styles/Div';
import { Paper_FormsChat } from '@ly_components/styles/Paper';

interface IFormsChatProps {
  chat: IChatMessage;
  addMessageToHistory: (message: IChatMessage) => void;
};

export const FormsChat = ({ chat, addMessageToHistory }: IFormsChatProps) => {

  const onActionEnd = useCallback((event: IActionsStatus) => {
    addMessageToHistory({
      sender: "Bot",
      message: event.message,
      type: "text",
    });
  }, []);



  if (!chat) return null; // Prevents runtime errors
  return (
    <DivFormsChat sender={chat.sender}>
      <Paper_FormsChat chat={chat} >
        {chat.type === 'action' && chat.action ? (
          <Div>
            <MarkDown markdown={chat.message} />
            {chat.action.map((action, index) => (
              <Div_ChatActions key={index}>
                <InputAction
                  id={action.id}
                  actionID={action.componentID}
                  type={ActionsType.button}
                  dialogContent={action.dialogContent}
                  dynamic_params={action.dynamic_params}
                  fixed_params={action.fixed_params}
                  label={action.label}
                  status={onActionEnd}
                  disabled={false}
                  component={action.component}
                />
              </Div_ChatActions>
            ))}
          </Div>
        )
          : chat.fileName ? (
            <Typography variant="body1" fontStyle='italic' >
              File sent successfully: {chat.fileName}
            </Typography>
          ) : (
            <MarkDown markdown={chat.message} />
          )}
      </Paper_FormsChat>
    </DivFormsChat>
  );
}