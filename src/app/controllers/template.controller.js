
import { ConflictResponse } from '../../core/errors.response';
import { CREATED } from '../../core/success.response';
import templateModel from '../models/template.model';
import {getTemplateService, newTemplateService} from "../../services/template.service";

const createTemplate = async (req,res) => {
  try {
     const { template_name, template_html } = req.body;
     const template = await getTemplateService({ template_name });
     if (template) throw new ConflictResponse("Exit template");
     return new CREATED({
       message: "Tạo HTML thành công!",
       metaData: await newTemplateService({ template_name, template_html }),
     }).send(res);
  } catch (error) {
      return res.status(error.status || 500).json({
        message: "Server Template error: " + error.message,
      });
  }
}
export {createTemplate}