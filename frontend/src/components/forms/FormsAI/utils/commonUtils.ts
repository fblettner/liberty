/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */
// React Import
import { IContentValue } from "@ly_utils/commonUtils";
import { useState, useEffect } from "react";

type TDocumentation = {
  title: string;
  url: string;
  content: string;
};

export const chunkDocumentation = (docs: TDocumentation[], chunkSize = 1000) => {
  const chunks = [];
  for (const doc of docs) {
    const content = doc.content;
    for (let i = 0; i < content.length; i += chunkSize) {
      const chunk = content.slice(i, i + chunkSize);
      chunks.push({
        title: doc.title,
        url: doc.url,
        content: chunk,
      });
    }
  }
  return chunks;
};

// Custom hook to debounce a value
export function useDebounce(value: IContentValue, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

