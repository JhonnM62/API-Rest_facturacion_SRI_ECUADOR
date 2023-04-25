/*
    * Ambiente:
    ** Desarrollo=> {
        VALIDATE    : https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl,
        AUTHORIZE   : https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl

    }

    ** Producion => {
        VALIDATE    : https://cel.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl,
        AUTHORIZE   : https://cel.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl
    }

*/

const URL_VALIDATE = 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/RecepcionComprobantesOffline?wsdl'
const URL_AUTHORIZE = 'https://celcer.sri.gob.ec/comprobantes-electronicos-ws/AutorizacionComprobantesOffline?wsdl'


module.exports = {
    URL:{
        VALIDATE: URL_VALIDATE,
        AUTHORIZE: URL_AUTHORIZE
    }
}