const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    host: 'smtp.qq.com',
    port: 465,
    auth: {
        user: '1935358563@qq.com',
        pass: '*********'
    }
    // 以下 为谷歌服务配置
    // service: 'gmail',
    // auth: {
    //     user: '*****@gmail.com',
    //     pass: 'password'
    // }
})

module.exports = function sendEmail(mail) {
    transporter.sendMail(mail, function(error, info) {
        if (error) {
            return console.log(error);
        }
        console.log('mail sent: ', info.response)
    })
}