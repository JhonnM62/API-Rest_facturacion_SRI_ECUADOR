/* Generar el xml de la guiaRemision */
/* Modules */
const moment = require('moment')
const util   = require('../util/util')

const AMBIENTE = 1

const invoice = (data,sec) =>{

    const dete       = moment().format('DD/MM/YYYY') 
    const secuencial = sec 
    const key        = util.accessKey(data, dete,secuencial)

    /* xml  */

    let xml = '<?xml version="1.0" encoding="UTF-8"?>'
    xml +='\n<guiaRemision id="comprobante" version="1.0.0">'
        xml +=`\n<infoTributaria>`
            xml +=`\n<ambiente>${AMBIENTE}</ambiente>`
            xml +=`\n<tipoEmision>1</tipoEmision>`
            xml +=`\n<razonSocial>${data.details.razonSocial}</razonSocial>`
            xml +=`\n<nombreComercial>${data.details.nombreComercial}</nombreComercial>`
            xml +=`\n<ruc>${data.details.ruc}</ruc>`
            xml +=`\n<claveAcceso>${key}</claveAcceso>`
            xml +=`\n<codDoc>06</codDoc>`
            xml +=`\n<estab>001</estab>`
            xml +=`\n<ptoEmi>001</ptoEmi>`
            xml +=`\n<secuencial>${secuencial}</secuencial>`
            xml +=`\n<dirMatriz>${data.details.direccion}</dirMatriz>`
        xml +=`\n</infoTributaria>`
        xml +=`\n<infoGuiaRemision>`
            xml +=`\n<dirEstablecimiento>${data.details.direccion}</dirEstablecimiento>`
            xml +=`\n<dirPartida>${data.details.envio}</dirPartida>`
            xml +=`\n<razonSocialTransportista>${data.customer.razonSocial}</razonSocialTransportista>`
            xml +=`\n<tipoIdentificacionTransportista>${data.customer.tipoDocumento}</tipoIdentificacionTransportista>`
            xml +=`\n<rucTransportista>${data.customer.ruc}</rucTransportista>`
            xml +=`\n<obligadoContabilidad>SI</obligadoContabilidad>`
            xml +=`\n<fechaIniTransporte>${data.customer.fechaIniTransporte}</fechaIniTransporte>`
            xml +=`\n<fechaFinTransporte>${data.customer.fechaFinTransporte}</fechaFinTransporte>`
            xml +=`\n<placa>${data.customer.placa}</placa>`
        xml +=`\n</infoGuiaRemision>`
        xml +=`\n<destinatarios>`
        data.destinatarios.forEach((element, index) => {
            xml +=`<destinatario>`
                xml += `\n<identificacionDestinatario>${element.id}</identificacionDestinatario>`
                xml += `\n<razonSocialDestinatario>${element.razonSocial}</razonSocialDestinatario>`
                xml += `\n<dirDestinatario>${element.direccion}</dirDestinatario>`
                xml += `\n<motivoTraslado>${element.traslado}</motivoTraslado>`
                xml +=`\n<detalles>`
                element.detalles.forEach(f => {
                    xml +=`<detalle>`
                        xml +=`\n<codigoInterno>${f.code}</codigoInterno>`
                        xml +=`\n<descripcion>${f.description}</descripcion>`
                        xml +=`\n<cantidad>${f.quantity}</cantidad>`
                    xml +=`\n</detalle>`
                })
                xml +=`\n</detalles>`
            xml +=`\n</destinatario>`
        })

        xml +=`\n</destinatarios>`

        xml +=`\n<infoAdicional>`
            xml +=`\n<campoAdicional nombre="Lugar Entrega">LUGAR DE ENTREGA DEL PRODUCTO O SERVICIO</campoAdicional>`
            xml +=`\n<campoAdicional nombre="Observaciones">OBSERVACIONES ADICIONALES</campoAdicional>`
        xml +=`\n</infoAdicional>`
    xml +=`\n</guiaRemision>`

    return [
        xml,
        key
    ]
}



module.exports = invoice
