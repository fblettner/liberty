/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import

//Custom Import
import { IUsersProps } from "@ly_types/lyUsers"


interface INotificationSettings {
    userProperties: IUsersProps;
    onFieldChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const NotificationSettings = ({ userProperties, onFieldChange }: INotificationSettings) => {
    return (
        <form>
            {/* Add your Notifications settings form fields here */}
        </form>
    )

}