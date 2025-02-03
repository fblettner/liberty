/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

// Custom Import
import { FormsTable } from "@ly_components/forms/FormsTable/FormsTable";
import { ComponentProperties, LYComponentDisplayMode, LYComponentViewMode } from "@ly_types/lyComponents";

export interface IFormsGrid {
    componentProperties: ComponentProperties;
}

export function FormsGrid({componentProperties }: IFormsGrid) {
    return (
        <FormsTable
            componentProperties={componentProperties}
            displayMode={LYComponentDisplayMode.component}
            viewMode={LYComponentViewMode.grid}
            viewGrid={true}
            readonly={false}
        />
    )
}