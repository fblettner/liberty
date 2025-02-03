/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Imports
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Custom Imports
import { lyGetModules } from '@ly_services/lyModules';
import { GlobalSettings, UIDisplayMode } from '@ly_utils/GlobalSettings';
import { IAppsProps, ESessionMode, EApplications } from "@ly_types/lyApplications";
import { EUsers, IUsersProps } from "@ly_types/lyUsers";
import { EModules, IModulesProps } from '@ly_types/lyModules';

// UUID generator
import { v4 as uuidv4 } from 'uuid'; // Import a UUID generator
import { IReserveStatus } from '@ly_utils/commonUtils';
import { ISnackMessage } from '@ly_types/lySnackMessages';
import { IAlertAppsMessage } from '@ly_types/lyAlertMessages';
import SocketClient from '@ly_features/socket';

interface AppState {
  loading: string;
  displayMenus: boolean;
  displayUserSettings: boolean;
  appsProperties: IAppsProps;
  userProperties: IUsersProps;
  modules: IModulesProps;
  darkMode: boolean;
  reserveStatus: IReserveStatus;
  alertMessage: IAlertAppsMessage;
  chatOpen: boolean;
  snackMessages: ISnackMessage[];
}

const initialState: AppState = {
  displayMenus: false,
  displayUserSettings: false,
  appsProperties: {
    [EApplications.id]: 0,
    [EApplications.pool]: GlobalSettings.getDefaultPool,
    [EApplications.name]: "LIBERTY",
    [EApplications.description]: "Liberty Framework",
    [EApplications.offset]: 5000,
    [EApplications.limit]: 5000,
    [EApplications.version]: GlobalSettings.getVersion,
    [EApplications.session]: ESessionMode.session,
    [EApplications.dashboard]: -1,
    [EApplications.theme]: "liberty",
    [EApplications.jwt_token]: "",
  },
  userProperties: {
    [EUsers.status]: false,
    [EUsers.id]: "",
    [EUsers.name]: "",
    [EUsers.email]: "",
    [EUsers.password]: "",
    [EUsers.admin]: "N",
    [EUsers.language]: "en",
    [EUsers.displayMode]: UIDisplayMode.dark,
    [EUsers.darkMode]: true,
    [EUsers.readonly]: "Y",
    [EUsers.dashboard]: -1,
    [EUsers.theme]: "liberty"
  },
  modules: {
    debug: { enabled: false, params: null },
    sentry: { enabled: false, params: null },
    login: { enabled: true, params: null },
    menus: { enabled: true, params: null },
    grafana: { enabled: false, params: null },
    dev: { enabled: false, params: null },
  },
  loading: 'idle',
  darkMode: true,
  reserveStatus: {
    record: "",
    user: "",
    status: false
  },
  alertMessage: {
    message: "",
    open: false
  },
  chatOpen: false,
  snackMessages: [],
};


export const appSlice = createSlice({
  name: 'app',
  initialState,

  reducers: {
    onToggleMenusDrawer: (state) => {
      state.displayMenus = !state.displayMenus
    },
    onToggleUserSettings: (state) => {
      state.displayUserSettings = !state.displayUserSettings
    },
    onAppsPropertiesChanged: (state, action: {type: string, payload: IAppsProps}) => {
      state.appsProperties = action.payload
    },
    onUserPropertiesChanged: (state, action: {type: string, payload: IUsersProps}) => {
      state.userProperties = action.payload
    },
    onSessionModeChanged: (state, action: {type: string, payload: ESessionMode}) => {
      state.appsProperties[EApplications.session] = action.payload
    },
    onDarkModeChanged: (state, action: {type: string, payload: boolean}) => {
      state.darkMode = action.payload
    },
    onReserveStatus: (state, action: {type: string, payload: IReserveStatus}) => {
      state.reserveStatus = action.payload;
    },
    onMessageChanged: (state, action: {type: string, payload: IAlertAppsMessage}) => {
      state.alertMessage = action.payload;
    },
    onChatOpenChanged: (state, action: {type: string, payload: boolean}) => {
      state.chatOpen = action.payload
    },
    onSnackMessageChanged: (state, action: {type: string, payload: ISnackMessage}) => {
      // Add the new message to the array
      state.snackMessages.push({
        id: uuidv4(),  // Add a unique ID to each message
        message: action.payload.message,
        severity: action.payload.severity,
        open: true, // Each message has its own `open` state
      });
    },
    removeSnackMessage: (state, action) => {
      // Remove the message with the matching ID
      state.snackMessages = state.snackMessages.filter((msg) => msg.id !== action.payload);
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadModules.pending, (state, action) => {
        state.loading = 'pending'
      })
      .addCase(loadModules.fulfilled, (state, action: PayloadAction<Array<Record<EModules, string>>>) => {
        let modules: IModulesProps = {
          debug: { enabled: false, params: null },
          sentry: { enabled: false, params: null },
          login: { enabled: false, params: null },
          menus: { enabled: false, params: null },
          grafana: { enabled: false, params: null },
          dev: { enabled: false, params: null },
        }
        action.payload.forEach((item) => {
          const moduleId = item[EModules.id] as keyof IModulesProps;
          if (moduleId in modules) {
            modules[moduleId] = {
              enabled: item[EModules.enabled] === "Y",
              params: item[EModules.params],
            };
          }
        });
        state.modules = modules;
        state.loading = 'succeeded';
      })
      .addCase(loadModules.rejected, (state, action) => {
        state.loading = 'rejected'
      })
  },
});



export interface IReduxState {
  app: AppState;
}

export const isMenusOpen = (state: IReduxState) => state.app.displayMenus;
export const isUserSettingsOpen = (state: IReduxState) => state.app.displayUserSettings;
export const getAppsProperties = (state: IReduxState) => state.app.appsProperties;
export const getUserProperties = (state: IReduxState) => state.app.userProperties;
export const getModules = (state: IReduxState) => state.app.modules;
export const getSessionMode = (state: IReduxState) => state.app.appsProperties[EApplications.session];
export const getDarkMode = (state: IReduxState) => state.app.darkMode;
export const getReserveStatus = (state: IReduxState) => state.app.reserveStatus;
export const getAlertMessage = (state: IReduxState) => state.app.alertMessage;
export const getChatMode = (state: IReduxState) => state.app.chatOpen;
export const getSnackMessages = (state: IReduxState) => state.app.snackMessages;

export const loadModules = createAsyncThunk('loadModules', async () => {
  let results = await lyGetModules({ pool: GlobalSettings.getDefaultPool });
  return results
})

export const {
  onAppsPropertiesChanged,
  onUserPropertiesChanged,
  onSessionModeChanged,
  onReserveStatus,
  onDarkModeChanged,
  onMessageChanged,
  onChatOpenChanged,
  onToggleMenusDrawer,
  onToggleUserSettings,
  onSnackMessageChanged,
  removeSnackMessage
} = appSlice.actions;

export default appSlice.reducer;

export const socketMiddleware = (socket: SocketClient) => (params: any) => (next: any) => async (action: any) => {
  const { dispatch, getState } = params
  const { type, payload } = action

  switch (type) {
    case 'connect':
      socket.connect('connect', payload);
      break
    case 'reserve':
      let response = await socket.emit('reserve', payload).then((data) => { return data });
      if (typeof response === 'object' && response !== null && 'status' in response) {
        dispatch(onReserveStatus({
          record: payload,
          user: "",
          status: (response.status === "OK") ? false : true
        }));
      }
      break;
    case 'release':
      socket.emit('release', payload)
      break
    case 'signout':
      socket.disconnect();
      break
    default:
      break
  }

  return next(action)
}