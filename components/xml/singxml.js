const moment    = require('moment')
const { SHA1_BASE64, CERTICATE_DIGITAL, RSA_SHA256} = require('./signature')

/* Funciones de Utilidad */

const random = () => Math.floor(Math.random() * 999000) + 990

const bigint2base64 = bigint => {
    const hexString = bigint.toString(16) // convierte el bigint a una cadena de caracteres hexadecimal
    const hexPairs = hexString.match(/\w{2}/g) // divide la cadena hexadecimal en pares de caracteres
    const utfChars = hexPairs.map(pair => String.fromCharCode(parseInt(pair, 16))) // convierte cada par hexadecimal en su correspondiente carácter UTF-8
    const utfString = utfChars.join("") // une los caracteres UTF-8 en una sola cadena
    const base64 = Buffer.from(utfString, 'binary').toString('base64') // convierte la cadena UTF-8 en base64

    const lines = base64.match(/.{1,76}/g) // divide la cadena base64 en líneas de 76 caracteres o menos
    const result = lines.join("\n") // une las líneas con un salto de línea entre ellas

    return result
}

async function xmlSing(xml,password,p12){
    
    const SING = await CERTICATE_DIGITAL(password, p12)

    /* sha1 comprobante */
    const sha1_factura = SHA1_BASE64(xml.replace('<?xml version="1.0" encoding="UTF-8"?>\n', ''))

    /* X509 HASH */
    const certificateX509_der_hash = SING.X509HASH

    /* X509 Serial Number */
    const X509SerialNumber = parseInt(SING.CERT.serialNumber, 16)

    /* KEY MODULES  */
    const modulus = bigint2base64(SING.KEY.n)

    /* X509 CERTIFICADO */
    const certificateX509 = SING.certX509

    const issuerName = SING.issuerName

    /* ************** Firma xml Signature ************** */

    const xmlns = 'xmlns:ds="http://www.w3.org/2000/09/xmldsig#" xmlns:etsi="http://uri.etsi.org/01903/v1.3.2#"'


    /* numeros involucrados en los hash: */
    const Certificate_number       = random() //1562780 en el ejemplo del SRI
    const Signature_number         = random() //620397 en el ejemplo del SRI
    const SignedProperties_number  = random() //24123 en el ejemplo del SRI

    /* numeros fuera de los hash: */

    const SignedInfo_number         = random() //814463 en el ejemplo del SRI
    const SignedPropertiesID_number = random() //157683 en el ejemplo del SRI
    const Reference_ID_number       = random() //363558 en el ejemplo del SRI
    const SignatureValue_number     = random() //398963 en el ejemplo del SRI
    const Object_number             = random() //231987 en el ejemplo del SRI



    /* SignedProperties */

    let SignedProperties = '<etsi:SignedProperties Id="Signature' + Signature_number + '-SignedProperties' + SignedProperties_number + '">'
        SignedProperties += '<etsi:SignedSignatureProperties>'
            SignedProperties += '<etsi:SigningTime>'

                SignedProperties += moment().format('YYYY-MM-DD\THH:mm:ssZ')
                
            SignedProperties += '</etsi:SigningTime>'
            SignedProperties += '<etsi:SigningCertificate>'
                SignedProperties += '<etsi:Cert>'
                    SignedProperties += '<etsi:CertDigest>'
                        SignedProperties += '<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">'
                        SignedProperties += '</ds:DigestMethod>'
                        SignedProperties += '<ds:DigestValue>'

                            SignedProperties += certificateX509_der_hash

                        SignedProperties += '</ds:DigestValue>'
                    SignedProperties += '</etsi:CertDigest>'
                    SignedProperties += '<etsi:IssuerSerial>'
                        SignedProperties += '<ds:X509IssuerName>'
                            SignedProperties += issuerName
                        SignedProperties += '</ds:X509IssuerName>'
                    SignedProperties += '<ds:X509SerialNumber>'
                    
                        SignedProperties += X509SerialNumber
                        
                    SignedProperties += '</ds:X509SerialNumber>'
                    SignedProperties += '</etsi:IssuerSerial>'
                SignedProperties += '</etsi:Cert>'
            SignedProperties += '</etsi:SigningCertificate>'
        SignedProperties += '</etsi:SignedSignatureProperties>'
        SignedProperties += '<etsi:SignedDataObjectProperties>'
            SignedProperties += '<etsi:DataObjectFormat ObjectReference="#Reference-ID-' + Reference_ID_number + '">'
                SignedProperties += '<etsi:Description>'
                    
                    SignedProperties += 'Doc'                        

                SignedProperties += '</etsi:Description>'
                SignedProperties += '<etsi:MimeType>'
                    SignedProperties += 'text/xml'
                SignedProperties += '</etsi:MimeType>'
            SignedProperties += '</etsi:DataObjectFormat>'
        SignedProperties += '</etsi:SignedDataObjectProperties>'
    SignedProperties += '</etsi:SignedProperties>' 


    const SignedProperties_para_hash = SignedProperties.replace('<etsi:SignedProperties', '<etsi:SignedProperties ' + xmlns)

    const sha1_SignedProperties = SHA1_BASE64(SignedProperties_para_hash)   
    
    /* KeyInfo */      

    let KeyInfo = '<ds:KeyInfo Id="Certificate' + Certificate_number + '">'
        KeyInfo += '\n<ds:X509Data>'
            KeyInfo += '\n<ds:X509Certificate>\n'

                //CERTIFICADO X509 CODIFICADO EN Base64 
                KeyInfo += certificateX509

            KeyInfo += '\n</ds:X509Certificate>'
        KeyInfo += '\n</ds:X509Data>'
        KeyInfo += '\n<ds:KeyValue>'
            KeyInfo += '\n<ds:RSAKeyValue>'
                KeyInfo += '\n<ds:Modulus>\n'

                    //MODULO DEL CERTIFICADO X509
                    KeyInfo += modulus

                KeyInfo += '\n</ds:Modulus>'
                KeyInfo += '\n<ds:Exponent>'
                
                    //KeyInfo += 'AQAB'
                    KeyInfo += 'AQAB'
                    
                KeyInfo += '</ds:Exponent>'
            KeyInfo += '\n</ds:RSAKeyValue>'
        KeyInfo += '\n</ds:KeyValue>'
    KeyInfo += '\n</ds:KeyInfo>'
    
    const KeyInfo_para_hash = KeyInfo.replace('<ds:KeyInfo', '<ds:KeyInfo ' + xmlns)

    const sha1_certificado = SHA1_BASE64(KeyInfo_para_hash)

    /* SignedInfo */

    let SignedInfo = '<ds:SignedInfo Id="Signature-SignedInfo' + SignedInfo_number + '">'
        SignedInfo += '\n<ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315">'
        SignedInfo += '</ds:CanonicalizationMethod>'
        SignedInfo += '\n<ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1">'
        SignedInfo += '</ds:SignatureMethod>'
        SignedInfo += '\n<ds:Reference Id="SignedPropertiesID' + SignedPropertiesID_number + '" Type="http://uri.etsi.org/01903#SignedProperties" URI="#Signature' + Signature_number + '-SignedProperties' + SignedProperties_number + '">'
            SignedInfo += '\n<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">'
            SignedInfo += '</ds:DigestMethod>'
            SignedInfo += '\n<ds:DigestValue>'

                //HASH O DIGEST DEL ELEMENTO <etsi:SignedProperties>'
                SignedInfo += sha1_SignedProperties

            SignedInfo += '</ds:DigestValue>'
        SignedInfo += '\n</ds:Reference>'
        SignedInfo += '\n<ds:Reference URI="#Certificate' + Certificate_number + '">'
            SignedInfo += '\n<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">'
            SignedInfo += '</ds:DigestMethod>'
            SignedInfo += '\n<ds:DigestValue>'

                //HASH O DIGEST DEL CERTIFICADO X509
                SignedInfo += sha1_certificado

            SignedInfo += '</ds:DigestValue>'
        SignedInfo += '\n</ds:Reference>'
        SignedInfo += '\n<ds:Reference Id="Reference-ID-' + Reference_ID_number + '" URI="#comprobante">'
            SignedInfo += '\n<ds:Transforms>'
                SignedInfo += '\n<ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature">'
                SignedInfo += '</ds:Transform>'
            SignedInfo += '\n</ds:Transforms>'
            SignedInfo += '\n<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1">'
            SignedInfo += '</ds:DigestMethod>'
            SignedInfo += '\n<ds:DigestValue>'

                //HASH O DIGEST DE TODO EL ARCHIVO XML IDENTIFICADO POR EL id="comprobante" 
                SignedInfo += sha1_factura

            SignedInfo += '</ds:DigestValue>'
        SignedInfo += '\n</ds:Reference>'
    SignedInfo += '\n</ds:SignedInfo>'

    const SignedInfo_para_firma = SignedInfo.replace('<ds:SignedInfo', '<ds:SignedInfo ' + xmlns)

    const firma_SignedInfo = RSA_SHA256(SignedInfo_para_firma,SING.PRIVATE_KEY_PEM)

    /* Construcion de la firma digital */

    let xades_bes = '<ds:Signature ' + xmlns + ' Id="Signature' + Signature_number + '">'
        xades_bes += '\n' + SignedInfo

        xades_bes += '\n<ds:SignatureValue Id="SignatureValue' + SignatureValue_number + '">\n'

            //VALOR DE LA FIRMA (ENCRIPTADO CON LA LLAVE PRIVADA DEL CERTIFICADO DIGITAL) 
            xades_bes += firma_SignedInfo

        xades_bes += '\n</ds:SignatureValue>'

        xades_bes += '\n' + KeyInfo

        xades_bes += '\n<ds:Object Id="Signature' + Signature_number + '-Object' + Object_number + '">'
            xades_bes += '<etsi:QualifyingProperties Target="#Signature' + Signature_number + '">'

                //ELEMENTO <etsi:SignedProperties>'
                xades_bes += SignedProperties

            xades_bes += '</etsi:QualifyingProperties>'
        xades_bes += '</ds:Object>'
    xades_bes += '</ds:Signature>'

    xmlFinal = xml.replace('</factura>', xades_bes + '</factura>')


    return xmlFinal
}

module.exports = {
    xmlSing
}