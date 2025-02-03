/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 */
// React Import
import {
    functionalUpdate,
    makeStateUpdater,
    OnChangeFn,
    RowData,
    Table,
    TableFeature,
    Updater,
} from '@tanstack/react-table';


// define types for our new feature's custom state
export type DensityState = 'sm' | 'md' | 'lg'
export interface DensityTableState {
    density: DensityState
}

// define types for our new feature's table options
export interface DensityOptions {
    enableDensity?: boolean
    onDensityChange?: OnChangeFn<DensityState>
}

// Define types for our new feature's table APIs
export interface DensityInstance {
    setDensity: (updater: Updater<DensityState>) => void
    toggleDensity: (value?: DensityState) => void
}

// Use declaration merging to add our new feature APIs and state types to TanStack Table's existing types.
declare module '@tanstack/react-table' { // or whatever framework adapter you are using
    interface TableState extends DensityTableState { }
    interface TableOptionsResolved<TData extends RowData>
        extends DensityOptions { }
    interface Table<TData extends RowData> extends DensityInstance  { }
}

export const DensityFeature: TableFeature<RowData> = { 
    // define the new feature's initial state
    getInitialState: (state): DensityTableState => {
        return {
            density: 'sm',
            ...state,
        }
    },

    // define the new feature's default options
    getDefaultOptions: (table): DensityOptions => {
        return {
            enableDensity: true,
            onDensityChange: makeStateUpdater('density', table),
        } as DensityOptions
    },

    // define the new feature's table instance methods
    createTable: (table): void => {
        table.setDensity = updater => {
            const safeUpdater: Updater<DensityState> = old => {
                let newState = functionalUpdate(updater, old)
                return newState
            }
            return table.options.onDensityChange?.(safeUpdater)
        }
        table.toggleDensity = value => {
            table.setDensity(old => {
                if (value) return value
                return old === 'sm' ? 'md' : old === 'md' ? 'lg' : 'sm' //cycle through the 3 options
            })
        }
    },
}

