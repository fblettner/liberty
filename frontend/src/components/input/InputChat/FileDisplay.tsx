/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// Custom Import
import { LYCloseIcon } from "@ly_styles/icons";
import { Typography } from "@ly_components/common/Typography";
import { IconButton } from "@ly_components/common/IconButton";
import { Div_Inline } from "@ly_components/styles/Div";

interface FileDisplayProps {
    selectedFile: File | null;
    onRemoveFile: () => void;
}

export const FileDisplay = ({ selectedFile, onRemoveFile }: FileDisplayProps) => (
    selectedFile ? (
        <Div_Inline position="start">
            <Typography variant="body1" >
                {selectedFile.name}
            </Typography>
            <IconButton 
                onClick={onRemoveFile} 
                aria-label="remove file"
                icon={LYCloseIcon} 
            />
        </Div_Inline>
    ) : null
);