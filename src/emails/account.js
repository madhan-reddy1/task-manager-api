const sgMail=require('@sendgrid/mail')



sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail=(email,name)=>sgMail.send({
    from:'saikiran199803@gmail.com',
    to: email,
    subject:'Thanks for joining!!',
    text: `Welcome to the app, ${name}.Let me know how to get along with this app`
}).then(()=>{
    console.log("Done");
}).catch((e)=>{
    console.log(e);
})

const sendCancelationEmail = (email, name) => sgMail.send({
    from: 'saikiran199803@gmail.com',
    to: email,
    subject: 'Sorry to see you go!!',
    text: `Good Bye, ${name}.Let me know reason for Cancellation`
}).then(() => {
    console.log("Cancellation Done");
}).catch((e) => {
    console.log(e);
})


module.exports={
    sendWelcomeEmail,
    sendCancelationEmail
}