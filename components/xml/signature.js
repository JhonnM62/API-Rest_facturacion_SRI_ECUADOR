const crypto            = require('crypto')
const forge             = require('node-forge')

const SHA1_BASE64 = value => {
	const md = forge.md.sha1.create()
    md.update(value)
    return  Buffer.from(md.digest().toHex(), 'hex').toString('base64')
}

const RSA_SHA256 = (value,privateKey) =>{
    const signer = crypto.createSign('RSA-SHA1')
    signer.update(value)
    const signature = signer.sign(privateKey, 'base64').match(/.{1,76}/g).join("\n")
    return signature
}

const CERTICATE_DIGITAL = (password,sinature) =>{

	return new Promise ((resolve, reject) =>{
		try{
			const arrayUint8 = new Uint8Array(sinature)
			const p12B64     = forge.util.binary.base64.encode(arrayUint8)
			const p12Der     = forge.util.decode64(p12B64)
			const p12Asn1    = forge.asn1.fromDer(p12Der)
			const p12 	     = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password)

			const bags    = p12.getBags({ bagType: forge.pki.oids.certBag })
			const certBag = bags[forge.pki.oids.certBag][0]
			const cert 	  = certBag.cert

			const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })
			const keyBag  = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0]
			const key 	  = keyBag.key

			const certPem 		= forge.pki.certificateToPem(cert)
			const privateKeyPem = forge.pki.privateKeyToPem(key)
			const publicKeyPem  = forge.pki.publicKeyToPem(cert.publicKey)

			const X509DER  = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()
			const X509HASH = SHA1_BASE64(X509DER)


			/* X509 CERTIFICADO */
			let certX509 = certPem
			certX509     = certX509.substring(certX509.indexOf('\n'))
			certX509     = certX509.substring(0, certX509.indexOf('\n-----END CERTIFICATE-----'))
			certX509     = certX509.replace(/\r?\n|\r/g, '').replace(/([^\0]{76})/g, '$1\n')

			/* Name de la firma */
			const issuerName = cert.issuer.attributes[3].shortName + '=' + cert.issuer.attributes[3].value + ',' +
			cert.issuer.attributes[2].shortName + '=' +cert.issuer.attributes[2].value + ',' +
			cert.issuer.attributes[1].shortName + '=' +cert.issuer.attributes[1].value + ',' +
			cert.issuer.attributes[0].shortName + '=' +cert.issuer.attributes[0].value

	
			resolve({
				CERT_PEM 		: certPem,
				PRIVATE_KEY_PEM : privateKeyPem,
				PUBLIC_KEY_PEM	: publicKeyPem,
				CERT : cert,
				KEY  : key,
				X509DER,
				X509HASH,
				certX509,
				issuerName
				
			})
		}catch(err){
			reject(err)
		}
	})

}

module.exports = {
	CERTICATE_DIGITAL,
	SHA1_BASE64,
	RSA_SHA256
}

