/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
// React Import
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";


// Custom import
import { getSnackMessages, removeSnackMessage } from "@ly_features/global";
import { ISnackMessage } from "@ly_types/lySnackMessages";
import { Stack_SnackMessage } from "@ly_components/styles/Stack";
import { Alert } from "@ly_components/common/Alert";

export const SnackMessage = () => {
    const snackMessages = useSelector(getSnackMessages);
    const dispatch = useDispatch();
  
    const handleSnackbarClose = (id: string) => {
      dispatch(removeSnackMessage(id));  // Remove the message after it's closed
    };
  
    useEffect(() => {
      snackMessages.forEach((snack: ISnackMessage) => {
        const timer = setTimeout(() => {
          handleSnackbarClose(snack.id);  // Automatically close after 6 seconds
        }, 6000);
        return () => clearTimeout(timer);  // Clear timer on unmount or update
      });
    }, [snackMessages]);
  
    return (
      <Stack_SnackMessage>
        {snackMessages.slice().reverse().map((snack: ISnackMessage) => (  // Reverse the array
          <Alert
            key={snack.id}
            variant={snack.severity}
            onClose={() => handleSnackbarClose(snack.id)}
            dismissible
          >
            {snack.message}
          </Alert>
        ))}
      </Stack_SnackMessage>
    );
  };