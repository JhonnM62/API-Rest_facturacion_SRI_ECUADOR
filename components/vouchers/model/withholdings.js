/* Generar el xml de la factura */
/* Modules */
const moment = require('moment')
const util   = require('../util/util')

const AMBIENTE = 1

const withholdings = (data,sec) =>{

    const dete       = moment().format('DD/MM/YYYY') 
    const secuencial = sec 
    const key        = util.accessKey(data, dete,secuencial)

    /* xml  */

    let xml = '<?xml version="1.0" encoding="UTF-8"?>'
    xml +='\n<comprobanteRetencion id="comprobante" version="1.0.0">'
        xml +=`\n<infoTributaria>`
            xml +=`\n<ambiente>${AMBIENTE}</ambiente>`
            xml +=`\n<tipoEmision>1</tipoEmision>`
            xml +=`\n<razonSocial>${data.details.razonSocial}</razonSocial>`
            xml +=`\n<nombreComercial>${data.details.nombreComercial}</nombreComercial>`
            xml +=`\n<ruc>${data.details.ruc}</ruc>`
            xml +=`\n<claveAcceso>${key}</claveAcceso>`
            xml +=`\n<codDoc>07</codDoc>`
            xml +=`\n<estab>001</estab>`
            xml +=`\n<ptoEmi>001</ptoEmi>`
            xml +=`\n<secuencial>${secuencial}</secuencial>`
            xml +=`\n<dirMatriz>${data.details.direccion}</dirMatriz>`
        xml +=`\n</infoTributaria>`
        xml +=`\n<infoCompRetencion>`
            xml +=`\n<fechaEmision>${dete.toString()}</fechaEmision>`
            xml +=`\n<dirEstablecimiento>${data.details.direccion}</dirEstablecimiento>`
            xml +=`\n<obligadoContabilidad>SI</obligadoContabilidad>`
            xml +=`\n<tipoIdentificacionSujetoRetenido>${data.customer.tipoDocumento}</tipoIdentificacionSujetoRetenido>`
            xml +=`\n<razonSocialSujetoRetenido>${data.customer.razonSocial}</razonSocialSujetoRetenido>`
            xml +=`\n<identificacionSujetoRetenido>${data.customer.id}</identificacionSujetoRetenido>`
            xml +=`\n<periodoFiscal>${data.details.periodo_fiscal}</periodoFiscal>`
        xml +=`\n</infoCompRetencion>`
        xml +=`\n<impuestos>`

        data.impuestos.forEach((element, index) => {
            xml +=`<impuesto>`
                xml +=`\n<codigo>${element.retener}</codigo>`
                xml +=`\n<codigoRetencion>${element.codigos_impuestos}</codigoRetencion>`
                xml +=`\n<baseImponible>${element.base_imponible}</baseImponible>`
                xml +=`\n<porcentajeRetener>${element.porcentaje}</porcentajeRetener>`
                xml +=`\n<valorRetenido>${parseFloat((element.base_imponible * element.porcentaje_value)/100)}</valorRetenido>`
            xml +=`\n</impuesto>`
        })

        xml +=`\n</impuestos>`
        xml +=`\n<infoAdicional>`
            xml +=`\n<campoAdicional nombre="Lugar Entrega">LUGAR DE ENTREGA DEL PRODUCTO O SERVICIO</campoAdicional>`
            xml +=`\n<campoAdicional nombre="Observaciones">OBSERVACIONES ADICIONALES</campoAdicional>`
        xml +=`\n</infoAdicional>`
    xml +=`\n</comprobanteRetencion>`

    return [
        xml,
        key
    ]
}



module.exports = withholdings
