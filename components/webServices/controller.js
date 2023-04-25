/* modules */
const soap    = require('soap')
const { URL } = require('./routes')


const soapValidate = xml =>{

    const send = { xml: Buffer.from(xml).toString('base64') }

    return new Promise((resolve, reject) => {
        soap.createClient(URL.VALIDATE, (err, client) =>{
            if(err)
                reject(err)
            else{
                client.validarComprobante(send, (err,result) =>{
                    if(err)
                        reject(err)
                    else
                        resolve(result)
                })
            }
        })
    })
}

const soapAuthorization = key =>{

    const send = { claveAccesoComprobante:key.toString() }

    return new Promise((resolve, reject) => {
        soap.createClient(URL.AUTHORIZE, (err, client) =>{
            if(err)
                reject(err)
            else{
                client.autorizacionComprobante(send, (err,result) =>{
                    if(err)
                        reject(err)
                    else
                        resolve(result)
                })
            }
        })
    })
}


module.exports = {
    VALIDATE    : soapValidate,
    AUTHORIZE   : soapAuthorization
}