const nodemailer = require('nodemailer');

module.exports.sendMail = (req, res)=>{

    let transporter = nodemailer.createTransport({
        host: process.env.MAILGUN_SMTP_HOST,
        port: process.env.MAILGUN_PORT,
        secure: false, // true for 465
        auth: {
            user: process.env.MAILGUN_SENDER_USERNAME,
            pass: process.env.MAILGUN_SENDER_PASSWORD
        }
    });

    let mailOptions = {
        from: process.env.MAILGUN_SENDER,
        to: req.body.reciever,
        subject: 'Weather App Notification',
        html: "<table style ='border: 1px solid black;'>" + req.body.text + "</table>"
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    res.render("index.ejs");
}