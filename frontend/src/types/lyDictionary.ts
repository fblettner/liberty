/*
 * Copyright (c) 2022 NOMANA-IT and/or its affiliates.
 * All rights reserved. Use is subject to license terms.
 * *
 */

export enum EDictionaryRules {
  enum = "ENUM",
  lookup = "LOOKUP",
  password = "PASSWORD",
  sequence = "SEQUENCE",
  nextNumber = "NN",
  sysdate = "SYSDATE",
  boolean = "BOOLEAN",
  login = "LOGIN",
  default = "DEFAULT",
  password_oracle = "PASSWORD_ORACLE",
  current_date = "CURRENT_DATE",
  jde_date = "JDEDATE",
  color = "COLOR",
}

export enum EDictionaryType {
  date = "date",
  boolean = "boolean",
  number = "number",
  text = "text",
  textarea = "textarea",
  jdedate = "jdedate"
}

export enum EDictionary {
  id = "DD_ID",
  label = "DD_LABEL",
  type = "DD_TYPE",
  rules = "DD_RULES",
  rules_values = "DD_RULES_VALUES",
  default = "DD_DEFAULT",
}

