const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SendGridApi)



const sendWelcomeMail = (email,name)=>{
    sgMail.send({
    to:email,
    from : 'sahitsrivyshnav1999@gmail.com',
    subject:'from sendgrid',
    text:`Hi ${name} , welcome to task-manager app`
})
}
const sendFeedbackMail = (email,name)=>{
    sgMail.send({
    to:email,
    from : 'sahitsrivyshnav1999@gmail.com',
    subject:'from sendgrid',
    text:`Hi ${name} ,we've heard that you decativated your account can give a feedback to improve application`
})
}
module.exports ={
    sendWelcomeMail,
    sendFeedbackMail
}