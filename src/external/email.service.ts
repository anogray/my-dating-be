import { ConfigurationService } from 'src/config/config.service';
import { MailerService } from '@nestjs-modules/mailer';
import * as nodemailer from 'nodemailer';

export class EmailService {
  constructor(
    private configService: ConfigurationService,
    private readonly mailerService: MailerService,
    private transporter: nodemailer.Transporter
  ) {
    this.transporter = nodemailer.createTransport(
      {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: 'tammytim12@gmail.com',
          pass: 'zxvbeqtkhbwevagz'
        },
      },
    );
  }

  async sendEmail(emailTo: string) {
    try {
      console.log({emailTo})
      const otp = Math.floor(Math.random() * 9000) + 1000;

      const message = {
        from: 'test@test.com',
        to: emailTo,
        subject: 'Otp for dating registration',
        html: `<b>Otp : ${otp}</b>`,
      };
      await this.transporter.sendMail({
        to: emailTo,
        from: 'bbncr97@gmail.com', // sender address
        subject: 'Otp for dating registration',
        html: `<b>Otp : ${otp}</b>`
      });

      return otp;

    } catch (err) {
      console.log('sendEmail Err', err);
    }
  }
}
