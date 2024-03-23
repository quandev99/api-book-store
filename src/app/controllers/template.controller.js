
import { ConflictResponse } from '../../core/errors.response';
import { CREATED } from '../../core/success.response';
import templateModel from '../models/template.model';
import {getTemplateService, newTemplateService} from "../../services/template.service";

const createTemplate = async (req,res) => {
  try {
     const { template_name, template_html } = req.body;
     const hhh = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Book Store - Cảm ơn bạn đã đăng ký!</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            padding: 20px;
            border: 1px solid #ccc;
            border-radius: 5px;
            background-color: #f9f9f9;
        }
        .logo {
            text-align: center;
            margin-bottom: 20px;
        }
        .logo img {
            max-width: 150px;
            height: auto;
        }
        .content {
            text-align: center;
        }
        .content h2 {
            color: #333;
            margin-bottom: 20px;
        }
        .content p {
            color: #666;
            margin-bottom: 20px;
        }
        .button {
            display: inline-block;
            background-color: #007bff;
            color: #fff;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 5px;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <img src="https://example.com/logo.png" alt="Book Store Logo">
        </div>
        <div class="content">
            <h2>Cảm ơn bạn đã đăng ký!</h2>
            <p>Xin chào,</p>
            <p>Cảm ơn bạn đã đăng ký tài khoản trên Book Store. Chúng tôi rất vui mừng khi chào đón bạn!</p>
            <p>Nếu bạn có bất kỳ câu hỏi hoặc yêu cầu hỗ trợ nào, vui lòng liên hệ với chúng tôi.</p>
            <a href="https://example.com" class="button">Truy cập Book Store</a>
        </div>
    </div>
</body>
</html>
`;
     const template = await getTemplateService({ template_name });
     if (template) throw new ConflictResponse("Exit template");
     return new CREATED({
       message: "Tạo HTML thành công!",
       metaData: await newTemplateService({
         template_name,
         template_html: hhh,
       }),
     }).send(res);
  } catch (error) {
      return res.status(error.status || 500).json({
        message: "Server Template error: " + error.message,
      });
  }
}
export {createTemplate}