/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { configureStore, ThunkAction, Action } from "@reduxjs/toolkit"

// Custom Import
import { appSlice, socketMiddleware } from "@ly_features/global"
import SocketClient from "@ly_features/socket"

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
  },
  middleware: (gDM) => gDM().concat(socketMiddleware(new SocketClient()))

})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
