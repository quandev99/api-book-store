import moment from "moment";

const replacePlaceHolder = (template, params) => {
  Object.keys(params).forEach((key) => {
    const placeholder = `{{${key}}}`; // {{verifyKey}}
    template = template.replace(new RegExp(placeholder, "g"), params[key]);
  });
  return template;
};
const isExpired = (expiresAt) => {
  return moment().isAfter(moment(expiresAt));
};
export { replacePlaceHolder, isExpired };
