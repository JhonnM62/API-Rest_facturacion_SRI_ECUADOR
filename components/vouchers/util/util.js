const AMBIENTE = 1

const generarCodigo = () => {
    let codigo = '';
    for (let i = 0; i < 8; i++) codigo += Math.floor(Math.random() * 10)
    return codigo;
}

const generarSecuencial = id => {
    const numero = parseInt(id.slice(-9)) + 1
    const numeroConCeros = numero.toString().padStart(9, '0')
    return id.slice(0, -9) + numeroConCeros
}

const calcularDigitoVerificador = claveAcceso => {
    let suma = 0;
    let factor = 2;

    for (let i = claveAcceso.length - 1; i >= 0; i--) {
        suma += claveAcceso[i] * factor;
        factor = factor === 7 ? 2 : factor + 1;
    }

    const mod = suma % 11
    const final = 11 - mod
    const dv = final === 11 ? 0 : final === 10 ? 1 : final

    return dv.toString();
}

function accessKey(data, dete, sec) {

    const { comprobante, ruc } = data.details

    let key = dete.toString().replace(/\//g, '')
    //Tipo de comprobante
    key +=
        comprobante.toString() + ruc.toString() +
        AMBIENTE.toString() + '001001' +
        sec + generarCodigo() + '1'

    return key + calcularDigitoVerificador(key.toString())
}

module.exports = {
    generarSecuencial,
    calcularDigitoVerificador,
    accessKey
}



