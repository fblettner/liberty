/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { useSelector } from 'react-redux';

// Custom Import
import { isMenusOpen } from '@ly_features/global';
import { Div } from '@ly_components/styles/Div';

export const AppsFooter = () => {

  const isOpen = useSelector(isMenusOpen);

  return (
    <Div>
    </Div>
  );
};

