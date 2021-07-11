/**
 * Copyright (c) 2021 The Readme-Workflows organisation and Contributors
 */
/* eslint-disable no-unused-vars */
const fs = require("fs");

const { CUSTOM_REPLACER_FILE, TIMEZONE } = require("./config");
const customReplacer = require("./customReplacer");
const replacers = require("./replacers.json");

/**
 * @param {string} templateContent Template file content
 */
module.exports = (templateContent) => {
  replacers.forEach((item) => {
    templateContent = templateContent
      .split(item.search)
      .join(item.eval ? eval(item.replace) : item.replace);
  });

  let customData;

  if (!CUSTOM_REPLACER_FILE.toLocaleLowerCase().endsWith(".json")) {
    return {
      result: false,
      str: "CUSTOM_REPLACER_FILE needs to be a json",
    };
  }

  try {
    customData = fs.readFileSync(CUSTOM_REPLACER_FILE, "utf-8");
  } catch (err) {
    return {
      result: true,
      str: templateContent,
    };
  }

  try {
    customData = JSON.parse(customData);
  } catch (e) {
    return {
      result: false,
      str: `Couldn't parse the file: ${CUSTOM_REPLACER_FILE}. Make sure it is parsable with JSON.parse()`,
    };
  }

  if (customData.forEach) {
    customData.forEach((data) => {
      let tempReplace = customReplacer(templateContent, data);
      if (tempReplace.result) {
        templateContent = tempReplace.str;
      } else {
        return tempReplace;
      }
    });
  } else {
    let tempReplace = customReplacer(templateContent, customData);
    if (tempReplace.result) {
      templateContent = tempReplace.str;
    } else {
      return tempReplace;
    }
  }

  return { result: true, str: templateContent };
};
