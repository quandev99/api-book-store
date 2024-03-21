'use strict';

import templateModel from "../app/models/template.model";

const newTemplateService = async ({template_name,template_html})=>{
  try {
    const newTemp = await templateModel.create({
      template_name,
      template_html,
    });
    return newTemp;
  } catch (error) {
    throw new Error(`${error.message}`);
  }
}
const getTemplateService = async ({template_name})=>{
  const template = await templateModel.findOne({ template_name}).lean();
  return template;
}

export { newTemplateService, getTemplateService };