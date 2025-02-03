/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
import '@emotion/react';
import styled from '@emotion/styled';
import { Input } from '@ly_components/common/Input';

export const Input_White = styled(Input)(({ theme }) => ({
    '& input, & label': {
      color: theme.color.default,
    },
  }));