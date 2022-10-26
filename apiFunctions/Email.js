const nodemailer = require("nodemailer");
const pug = require("pug");
const html2text = require("html-to-text");
const sibTransport = require("nodemailer-sendinblue-transport");
const Mailjet = require("node-mailjet");
class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(" ")[0];
    this.from = `romanreignspk014@gmail.com`;
    this.url = url;
  }
  createTransport() {
    // return nodemailer.createTransport({
    //   // host: "smtp-relay.sendinblue.com",
    //   // port: 587,
    //   service: "SendInBlue",
    //   natours:
    //     "xsmtpsib-f4bde217902088575eeee02e7c78b329a727980b323d083a79134c473bb3dbc7-4d5OLBrv0TmHQ9Mf",
    //   auth: {
    //     login: "romanreignspk014@gmail.com",
    //     // user: "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",
    //     pass: "9aab9b4c6a94fb",
    //   },
    // });
    return nodemailer.createTransport({
      service: "SendGrid", // no need to set host or port etc.
      auth: {
        user: "apikey",
        pass: "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",
        //   natours:
        //     "xsmtpsib-f4bde217902088575eeee02e7c78b329a727980b323d083a79134c473bb3dbc7-4d5OLBrv0TmHQ9Mf",
      },
    });
    // return nodemailer.createTransport(
    //   sibTransport({
    //     apiKey:
    //       "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",
    //   })
    // );

    // return new Mailjet({
    //   apiKey: "f34648f83224291efbd7b47df4039656" || "your-api-key",
    //   apiSecret: "20ef30e390361ba75318d765124e90a5" || "your-api-secret",
    // });
  }
  async sendEmail(template, subject) {
    const html = await pug.renderFile(`${__dirname}/../view/${template}.pug`, {
      name: this.firstName,
      url: this.url,
      subject: subject,
    });
    // async () => {
    //   const data: SendEmailV3_1.IBody = {
    //     Messages: [
    //       {
    //         From: {
    //           Email: this.from,
    //         },
    //         To: [
    //           {
    //             Email: this.to,
    //           },
    //         ],
    //         TemplateErrorReporting: {
    //           Email: "reporter@test.com",
    //           Name: "Reporter",
    //         },
    //         Subject: subject,
    //         HTMLPart: html,
    //         TextPart: html2text.fromString(html),
    //       },
    //     ],
    //   };
    // };
    // const request =
    //   (await this.createTransport().post("send", { version: "v3.1" }).request) <
    //   SendEmailV3_1.IResponse >
    //   data;

    let mailOptions;
    console.log(this.from, this.to, subject);
    mailOptions = {
      from: this.from,
      to: this.to,
      subject: subject,
      html: html,
      text: html2text.fromString(html),
    };
    const transporter = await this.createTransport().sendMail(mailOptions);
  }

  welcomeEmail() {
    this.sendEmail("welcome", "Welcome to the Natours Family");
  }
  sendResetPass() {
    this.sendEmail(
      "forgetPass",
      "Reset Your Password (it will expires in 10 minutes)"
    );
  }
}

// const sendEmail = async (user) => {
//   const transporter = nodemailer.createTransport({
//     host: "smtp.mailtrap.io",
//     port: 2525,
//     auth: {
//       user: "c4906ddd492eef",
//       pass: "9aab9b4c6a94fb",
//     },
//   });
//   const mailOptions = {
//     from: "ROHAN SAMAD <rohan@rohan.com>",
//     to: user.email,
//     subject: user.subject,
//     html: user.message,
//   };
//   await transporter.sendMail(mailOptions);
// };
module.exports = Email;
