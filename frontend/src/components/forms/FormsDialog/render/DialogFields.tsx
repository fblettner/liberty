/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

// React Import
import dayjs from "dayjs";

// Import Custom
import { CDialogContent, EDialogDetails, IDialogDetails } from '@ly_types/lyDialogs';
import { InputCheckbox } from '@ly_components/input/InputCheckbox';
import { InputEnum } from '@ly_components/input/InputEnum/InputEnum';
import { InputLookup } from '@ly_components/input/InputLookup/InputLookup';
import { EDictionaryRules, EDictionaryType } from '@ly_types/lyDictionary';
import { IReserveStatus } from '@ly_utils/commonUtils';
import { OnAutocompleteChangeFunction, OnCheckboxChangeFunction, OnInputChangeFunction } from '@ly_components/forms/FormsDialog/utils/commonUtils';
import { ToolsDictionary } from '@ly_services/lyDictionary';
import { InputColor } from '@ly_components/input/InputColor';
import { Input } from '@ly_components/common/Input';
import { DatePicker } from "@ly_components/input/InputDate";

interface IDialogFields {
    item: IDialogDetails;
    dialogContent: CDialogContent;
    reserveStatus: IReserveStatus;
    maxRows: number;
    onAutocompleteChange: OnAutocompleteChangeFunction;
    onInputChange: OnInputChangeFunction;
    onCheckboxChange: OnCheckboxChangeFunction;
}

export const DialogFields = ({ item, dialogContent, reserveStatus, maxRows, onAutocompleteChange, onInputChange, onCheckboxChange }: IDialogFields) => {
    let field = item[EDialogDetails.target] ?? item[EDialogDetails.dictionaryID];

    switch (item[EDialogDetails.rules]) {
        case EDictionaryRules.color:
            return (
                <InputColor
                    id={field}
                    label={item[EDialogDetails.label]}
                    onChange={onInputChange}
                    value={dialogContent.fields[field].value as string ?? ""}
                    disabled={dialogContent.fields[field][EDialogDetails.disabled] || reserveStatus.status}
                >
                </InputColor>
            )
        case EDictionaryRules.enum:
            return (
                <InputEnum
                    id={field}
                    key={field}
                    enumID={parseInt(item[EDialogDetails.rulesValues])}
                    label={item[EDialogDetails.label]}
                    defaultValue={dialogContent.fields[field].value as string}
                    disabled={dialogContent.fields[field][EDialogDetails.disabled] || reserveStatus.status}
                    variant="standard"
                    onChange={onAutocompleteChange}
                    freeSolo={false}
                    searchByLabel={false}
                />
            )
        case EDictionaryRules.lookup:
            return (
                <InputLookup
                    id={field}
                    key={field}
                    lookupID={parseInt(item[EDialogDetails.rulesValues])}
                    label={item[EDialogDetails.label]}
                    data={dialogContent.fields}
                    defaultValue={dialogContent.fields[field].value as string ?? null}
                    disabled={dialogContent.fields[field][EDialogDetails.disabled] || reserveStatus.status}
                    onChange={onAutocompleteChange}
                    dynamic_params={item[EDialogDetails.dynamic_params]}
                    fixed_params={item[EDialogDetails.fixed_params]}
                    overrideQueryPool={(item[EDialogDetails.pool_params] === null)
                        ? undefined
                        : (dialogContent.fields[item[EDialogDetails.pool_params]] !== undefined)
                            ? dialogContent.fields[item[EDialogDetails.pool_params]].value as string
                            : item[EDialogDetails.pool_params]}
                />
            )
        case EDictionaryRules.password:
            return (
                <Input
                    id={field}
                    autoComplete="off"
                    value={dialogContent.fields[field].value as string ?? ""}
                    disabled={dialogContent.fields[field][EDialogDetails.disabled] || reserveStatus.status}
                    onChange={onInputChange}
                    type="password"
                    label={item[EDialogDetails.label]}
                    variant="standard"
                    fullWidth />
            )
        case EDictionaryRules.password_oracle:
            return (
                <Input
                    id={field}
                    autoComplete={field}
                    value={dialogContent.fields[field].value as string ?? ""}
                    disabled={dialogContent.fields[field][EDialogDetails.disabled] || reserveStatus.status}
                    onChange={onInputChange}
                    type="password"
                    label={item[EDialogDetails.label]}
                    variant="standard"
                    fullWidth />
            )
        default:
            switch (item[EDialogDetails.type]) {
                case EDictionaryType.number:
                    return (
                        <Input
                            id={field}
                            value={dialogContent.fields[field].value as number ?? 0}
                            disabled={dialogContent.fields[field][EDialogDetails.disabled] || reserveStatus.status}
                            onChange={onInputChange}
                            type="number"
                            label={item[EDialogDetails.label]}
                            variant="standard"
                            showClearButton
                            onClear={() => onInputChange({ target: { id: field, value: "" } } as React.ChangeEvent<HTMLInputElement>)}
                            fullWidth />
                    )
                case EDictionaryType.jdedate:
                    return (
                        <DatePicker
                            id={field}
                            // Initialize the picker with the current cell value
                            value={
                                dialogContent.fields[field].value
                                    ? dayjs(ToolsDictionary.JdeToDate(dialogContent.fields[field].value as number))
                                    : null
                            }
                            disabled={dialogContent.fields[field][EDialogDetails.disabled] || reserveStatus.status}
                            onChange={(selectedDate: any) => {
                                const formattedDate = selectedDate ? selectedDate.format("YYYY-MM-DD") : null;
                                const jdeDate = formattedDate ? ToolsDictionary.DateToJde(formattedDate) : null;

                                // Call the onChange with the converted JDE date
                                onInputChange({
                                    target: { id: field, value: jdeDate },
                                } as React.ChangeEvent<HTMLInputElement>);
                            }}
                        />
                    )
                case EDictionaryType.date:
                    return (
                        <DatePicker
                            // Initialize the picker with the current cell value
                            id={field}
                            value={
                                dialogContent.fields[field].value
                                    ? dayjs(dialogContent.fields[field].value as string)
                                    : null
                            }
                            disabled={dialogContent.fields[field][EDialogDetails.disabled] || reserveStatus.status}
                            onChange={(selectedDate: any) => {
                                const formattedDate = selectedDate ? selectedDate.format("YYYY-MM-DD") : null;

                                // Call the onChange with the formatted date
                                onInputChange({
                                    target: { id: field, value: formattedDate },
                                } as React.ChangeEvent<HTMLInputElement>);
                            }}
                        />


                    )
                case EDictionaryType.textarea:
                    return (
                        <Input
                            id={field}
                            value={dialogContent.fields[field].value as string ?? ""}
                            disabled={dialogContent.fields[field][EDialogDetails.disabled] || reserveStatus.status}
                            onChange={onInputChange}
                            multiline
                            rows={(dialogContent.fields[field].value ? maxRows: 1)}
                            label={item[EDialogDetails.label]}
                            variant="standard"
                            showClearButton
                            onClear={() => onInputChange({ target: { id: field, value: "" } } as React.ChangeEvent<HTMLInputElement>)}
                            fullWidth />
                    )
                case EDictionaryType.boolean:
                    return (
                        <InputCheckbox
                            id={field}
                            key={field}
                            label={item[EDialogDetails.label]}
                            defaultValue={dialogContent.fields[field].value as boolean}
                            disabled={dialogContent.fields[field][EDialogDetails.disabled] || reserveStatus.status}
                            onChange={onCheckboxChange}
                        />
                    )
                default:
                    return (
                        <Input
                            id={field}
                            value={dialogContent.fields[field].value as string ?? ""}
                            disabled={dialogContent.fields[field][EDialogDetails.disabled] || reserveStatus.status}
                            onChange={onInputChange}
                            multiline={item[EDialogDetails.type] === "textarea"}
                            label={item[EDialogDetails.label]}
                            variant="standard"
                            showClearButton
                            onClear={() => onInputChange({ target: { id: field, value: "" } } as React.ChangeEvent<HTMLInputElement>)}
                            fullWidth />
                    )
            }
    }

}