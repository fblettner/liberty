/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { Fragment, useMemo } from "react";

//Custom Import
import { EUsers } from "@ly_types/lyUsers"
import { InputLookup } from "@ly_components/input/InputLookup/InputLookup";
import { ESessionMode } from "@ly_types/lyApplications";
import { GlobalSettings, UIDisplayMode } from "@ly_utils/GlobalSettings";
import { OnChangeFunction } from "@ly_components/input/InputLookup/utils/commonUtils";
import { InputEnum } from "@ly_components/input/InputEnum/InputEnum";
import { LYDarkModeIcon, LYLightModeIcon, LYReactIcon } from "@ly_styles/icons";
import { Div_UISettings } from "@ly_components/styles/Div";
import { Button_UISettings } from "@ly_components/styles/Button";

interface IUISettings {
    onAutocompleteChanged: OnChangeFunction;
    darkMode?: boolean;
    inputLanguage: string | null;
    inputDashboard: string | null;
    inputTheme: string | null;
    handleButtonClick: (value: UIDisplayMode) => void;
}

export const UISettings = ({ onAutocompleteChanged, darkMode, inputLanguage, inputDashboard, inputTheme, handleButtonClick }: IUISettings) => {

    const generalData = useMemo(() => [
        { id: UIDisplayMode.dark, name: darkMode ? "Mode: Dark" : "Mode: Light", icon: darkMode ? LYDarkModeIcon : LYLightModeIcon}], [darkMode]);

    return (
        <Fragment>
            {generalData.map((item) => (
                <Div_UISettings key={item.id}>
                    <Button_UISettings 
                        key={item.id} 
                        variant="contained" 
                        endIcon={item.icon} 
                        onClick={() => { handleButtonClick(item.id) }}
                    >
                        {item.name}
                    </Button_UISettings>
                </Div_UISettings>

            ))}
            <Div_UISettings>
                <InputLookup
                    id={EUsers.language}
                    key={EUsers.language}
                    lookupID={GlobalSettings.getQuery.lookupLanguage}
                    label="Language"
                    defaultValue={inputLanguage ?? ''}
                    disabled={false}
                    onChange={onAutocompleteChanged}
                    displayWhite={true}
                    sessionMode={ESessionMode.framework}
                />
            </Div_UISettings>
            <Div_UISettings>
                <InputLookup
                    id={EUsers.dashboard}
                    key={EUsers.dashboard}
                    lookupID={GlobalSettings.getQuery.lookupDashboard}
                    label="Dashboard"
                    defaultValue={inputDashboard ?? ''}
                    disabled={false}
                    onChange={onAutocompleteChanged}
                    displayWhite={true}
                    fixed_params='COL_COMPONENT=FormsDashboard'
                    sessionMode={ESessionMode.framework}
                />
            </Div_UISettings>
            <Div_UISettings>
                <InputEnum
                    id={EUsers.theme}
                    key={EUsers.theme}
                    enumID={GlobalSettings.getQuery.enumTheme}
                    label="Theme"
                    defaultValue={inputTheme ?? ''}
                    disabled={false}
                    onChange={onAutocompleteChanged}
                    variant="standard"
                    freeSolo={true}
                    searchByLabel={false}
                    sessionMode={ESessionMode.framework}
                    overrideQueryPool={GlobalSettings.getDefaultPool}
                />
            </Div_UISettings>
        </Fragment>
    )
}

