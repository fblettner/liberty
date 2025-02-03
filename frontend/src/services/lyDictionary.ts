/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

import { IEnumProps } from "@ly_types/lyEnums";
import { ILookupProps } from "@ly_types/lyLookup";
import { lyGetEnums } from "@ly_services/lyEnums";
import { lyGetLookup } from "@ly_services/lyLookup";
import { ISequenceProps } from "@ly_types/lySequence";
import { lyGetSequence } from "@ly_services/lySequence";
import { INextNumberProps } from "@ly_types/lyNextNum";
import { lyGetNextNumber } from "@ly_services/lyNextNum";

export class ToolsDictionary {

  public static getNextNumber = async (props: INextNumberProps) => {
    let nn = await lyGetNextNumber(props);
    return nn;
  }

  public static getSequence = async (props: ISequenceProps) => {
    let sequence = await lyGetSequence(props);
    return sequence;
  }

  public static getEnums = async (props: IEnumProps) => {
    let enums = await lyGetEnums(props);
    return enums;
  }

  public static getLookup = async (props: ILookupProps) => {
    let lookup = await lyGetLookup(props);
    return lookup;
  }

  public static JdeToDate = (jde: number): Date|null => {
    if (jde === 0)
      return null;
    const year = Math.floor(jde / 1000) + 1900;
    const dayOfYear = jde % 1000;
    const date = new Date(year, 0, dayOfYear);
    return date;
  };

  public static DateToJde = (iso: string): string => {
    const date = new Date(iso);
    const year = date.getFullYear() - 1900;
    const startOfYear = new Date(date.getFullYear(), 0, 0);
    const dayOfYear = Math.floor(
      (date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)
    );
    return `${year * 1000 + dayOfYear}`;
  };
}




