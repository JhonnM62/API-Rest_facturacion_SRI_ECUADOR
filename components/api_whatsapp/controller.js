const axios = require('axios');
const mime = require('mime-types');
const nodemailer = require('nodemailer');
const path = require('path');



async function Enviar_PDF(url, number, email) {

    const filepath = url ;
    console.log('>>>>>>>>>>>>>>>>>>>>>>>', filepath)
    const filename = path.basename(filepath);
    console.log('este es el nombre del pdf',filename);

    try {
         // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
            user: 'arley4024@gmail.com', // generated ethereal user
            pass: 'keodcfxszvxahwbr', // generated ethereal password
        },
    });

    

    await transporter.sendMail({
        from: '"ESTA ES TU FACTURA" <arley4024@gmail.com>', // sender address
        to: email, // list of receivers
        subject: 'FACTURA TRIONICA✔', // Subject line
        text: 'Adjuntamos tu factura revisala y si algo nos comentas', // plain text body
        attachments: [
            {
                // filename and content type is derived from path
                filename: `${filename}.pdf`,
                path: filepath, // stream this file
            },
        ],
    });

    console.log('SE ENVIO CON EXITO')
    } catch (error) {
        console.log(error)
    }

;
    const mimeType = mime.lookup(filepath);
    const numero = number;
    
    try {
        const response = await axios.post('http://localhost:4000/send-pdf-whatsapp', {
            number: numero, 
            filepath: filepath,
            mimeType: mimeType,
            filename: filename

        });
        console.log(response.data); // Imprimir la respuesta de la solicitud HTTP
    } catch (error) {
        console.error(error);
    }



}
console.log(Enviar_PDF)
module.exports = Enviar_PDF;




