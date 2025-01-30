/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { t } from "i18next";

//Custom Import
import { EUsers, IUsersProps } from "@ly_types/lyUsers"
import { Div_UISettings } from "@ly_components/styles/Div";
import { Input } from "@ly_components/common/Input";
import { Fragment } from "react/jsx-runtime";

interface IUserSettings {
    userProperties: IUsersProps;
    onFieldChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UserSettings = ({ userProperties, onFieldChange }: IUserSettings) => {
    return (
        <Fragment>
            <Div_UISettings>
                <Input
                    variant="standard"
                    defaultValue={userProperties[EUsers.id]}
                    required
                    fullWidth
                    id={EUsers.id}
                    label={t("login.userid")}
                    name="user"
                    autoComplete="user"
                    disabled={true}
                    onChange={onFieldChange}
                />
            </Div_UISettings>
            <Div_UISettings>
                <Input
                    variant="standard"
                    defaultValue={userProperties[EUsers.name]}
                    required
                    fullWidth
                    id={EUsers.name}
                    label={t("login.username")}
                    name="user"
                    autoComplete="user"
                    autoFocus
                    onChange={onFieldChange}
                />
            </Div_UISettings>
            <Div_UISettings>
                <Input
                    variant="standard"
                    defaultValue={userProperties[EUsers.email]}
                    required
                    fullWidth
                    id={EUsers.email}
                    label={t("login.email")}
                    name="email"
                    autoComplete="email"
                    onChange={onFieldChange}
                />
            </Div_UISettings>
            <Div_UISettings>
                <Input
                    variant="standard"
                    required
                    fullWidth
                    id={EUsers.password}
                    label={t("login.password")}
                    type="password"
                    autoComplete="off"
                    onChange={onFieldChange}
                />
            </Div_UISettings>
            <Div_UISettings>
                <Input
                    variant="standard"
                    required
                    fullWidth
                    id={EUsers.password_confirm}
                    label={t("login.confirm_password")}
                    type="password"
                    autoComplete="off"
                    onChange={onFieldChange}
                />
            </Div_UISettings>
        </Fragment>
    )

}