// src/styles/theme.d.ts
import '@emotion/react';

declare module '@emotion/react' {
    export interface Theme {
      mixins: {
        toolbar: {
          minHeight: number;
        };
      };
  
      palette: {
        primary: { main: string };
        secondary: { main: string };
        text: { primary: string; secondary: string; disabled: string };
        background: { default: string, paper: string };
        divider: string;
        mode: string
        action: {
          hover: string;
          selected: string;
          disabled: string;
        };
        grey: {
          100: string;
          200: string;
          300: string;
          400: string;
          500: string;
          600: string;
          700: string;
          800: string;
        };
      };
      background: {
        default: string;
        loginPage: string;
      };
      backgroundShades: {
        light: {
          start: string;
          middle: string;
        },
        dark: {
          start: string;
          middle: string;
        };
      };
      color: {
        default: string;
      };
      shadows: string[];
      spacing: (factor: number) => string;
    }
  }