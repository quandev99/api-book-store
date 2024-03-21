const replacePlaceHolder = (template, params) =>{
  Object.keys(params).forEach(key => {
    const placeholder = `{{${key}}}`; // {{verifyKey}}
    template = template.replace(new RegExp(placeholder,'g'), params[key]);
  })
  return template
}
export { replacePlaceHolder,}