/* Modules */
const fs = require("fs");
const path = require("path");
const moment = require("moment");
const { xmlSing } = require("./singxml");

const AMBIENTE = 1;

const SEC = "000000633";

function generarCodigo() {
  let codigo = "";
  for (let i = 0; i < 8; i++) {
    codigo += Math.floor(Math.random() * 10);
  }
  return codigo;
}

function generarSecuencial(id) {
  // Obtener el número del secuencial a partir de la cadena de entrada
  const numero = parseInt(id.slice(-9)) + 1;

  // Convertir el número a una cadena de texto y agregar ceros a la izquierda si es necesario
  const numeroConCeros = numero.toString().padStart(9, "0");

  // Crear el secuencial concatenando la parte inicial de la cadena de entrada con el número del secuencial
  const secuencial = id.slice(0, -9) + numeroConCeros;

  return secuencial;
}

function calcularDigitoVerificador(claveAcceso) {
  let suma = 0;
  let factor = 2;

  for (let i = claveAcceso.length - 1; i >= 0; i--) {
    suma += claveAcceso[i] * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }

  const mod = suma % 11;
  const final = 11 - mod;
  const dv = final === 11 ? 0 : final === 10 ? 1 : final;

  return dv.toString();
}

function accessKey(data, dete) {
  const { comprobante, ruc } = data.details;

  let key = dete.toString().replace(/\//g, "");
  //Tipo de comprobante
  key +=
    comprobante.toString() +
    ruc.toString() +
    AMBIENTE.toString() +
    "001001" +
    generarSecuencial(SEC) +
    generarCodigo() +
    "1";

  return key + calcularDigitoVerificador(key.toString());
}

const createXMl = (data) => {
  const dete = moment().format("DD/MM/YYYY"); //fecha de emision
  const secuencial = generarSecuencial(SEC); //Genera el secuencial alatorio
  const key = accessKey(data, dete);
  const table = [];

  //Dinamico precios
  const totalValue = (obj, key = "total") => {
    let total = 0;
    obj.forEach((f) => (total += parseFloat(f[`${key}`].toString())));
    return total.toFixed(2);
  };

  //Se crea el objeto de los productos dinamicos
  data.product.forEach((d) => {
    const total =
      parseInt(d.quantity) * parseFloat(d.unit_Price) -
      parseFloat(d.discount == "" ? "0" : d.discount);
    table.push({
      code: d.code,
      quantity: d.quantity,
      description: d.description,
      additional_details: d.additional_details,
      unit_Price: d.unit_Price,
      discount: d.discount == "" ? "0.00" : d.discount,
      total: total.toFixed(2),
      iva: d.iva,
      codigos_impuestos: d.codigos_impuestos,
      tarifa: d.tarifa,
    });
  });

  let xml = '<?xml version="1.0" encoding="UTF-8"?>';
  xml += '\n<factura id="comprobante" version="1.0.0">';
  xml += `\n<infoTributaria>`;
  xml += `\n<ambiente>${AMBIENTE}</ambiente>`;
  xml += `\n<tipoEmision>1</tipoEmision>`;
  xml += `\n<razonSocial>${data.details.razonSocial}</razonSocial>`;
  xml += `\n<nombreComercial>${data.details.nombreComercial}</nombreComercial>`;
  xml += `\n<ruc>${data.details.ruc}</ruc>`;
  xml += `\n<claveAcceso>${key}</claveAcceso>`;
  xml += `\n<codDoc>01</codDoc>`;
  xml += `\n<estab>001</estab>`;
  xml += `\n<ptoEmi>001</ptoEmi>`;
  xml += `\n<secuencial>${secuencial}</secuencial>`;
  xml += `\n<dirMatriz>${data.details.direccion}</dirMatriz>`;
  xml += `\n</infoTributaria>`;
  xml += `\n<infoFactura>`;
  xml += `\n<fechaEmision>${dete.toString()}</fechaEmision>`;
  xml += `\n<dirEstablecimiento>${data.details.direccion}</dirEstablecimiento>`;
  xml += `\n<obligadoContabilidad>SI</obligadoContabilidad>`;
  xml += `\n<tipoIdentificacionComprador>${data.customer.tipoDocumento}</tipoIdentificacionComprador>`;
  xml += `\n<razonSocialComprador>${data.customer.razonSocial}</razonSocialComprador>`;
  xml += `\n<identificacionComprador>${data.customer.id}</identificacionComprador>`;
  xml += `\n<totalSinImpuestos>${parseFloat(
    totalValue(table)
  )}</totalSinImpuestos>`;
  xml += `\n<totalDescuento>${parseFloat(
    totalValue(table, "discount")
  )}</totalDescuento>`;
  xml += `\n<totalConImpuestos>`;
  xml += `\n<totalImpuesto>`;
  xml += `\n<codigo>${data.tax.codigoTax}</codigo>`;
  xml += `\n<codigoPorcentaje>${data.tax.tarifa}</codigoPorcentaje>`;
  xml += `\n<baseImponible>${parseFloat(totalValue(table))}</baseImponible>`;
  xml += `\n<valor>${data.tax.valor}</valor>`;
  xml += `\n</totalImpuesto>`;
  xml += `\n</totalConImpuestos>`;
  xml += `\n<propina>${data.tax.propina}</propina> `;
  xml += `\n<importeTotal>${parseFloat(totalValue(table))}</importeTotal>`;
  xml += `\n<moneda>${data.tax.moneda}</moneda>`;
  xml += `\n</infoFactura>`;
  xml += `\n<detalles>`;

  table.forEach((element, index) => {
    xml += `<detalle>`;
    xml += `\n<codigoPrincipal>${element.code}</codigoPrincipal>`;
    xml += `\n<descripcion>${element.description}</descripcion>`;
    xml += `\n<cantidad>${element.quantity}</cantidad>`;
    xml += `\n<precioUnitario>${parseFloat(
      element.unit_Price
    )}</precioUnitario>`;
    xml += `\n<descuento>${parseFloat(element.discount)}</descuento>`;
    xml += `\n<precioTotalSinImpuesto>${element.total}</precioTotalSinImpuesto>`;
    xml += `\n<impuestos>`;
    xml += `\n<impuesto>`;
    xml += `\n<codigo>${element.iva}</codigo>   `;
    xml += `\n<codigoPorcentaje>${element.codigos_impuestos}</codigoPorcentaje>`;
    xml += `\n<tarifa>${element.tarifa}</tarifa>`;
    xml += `\n<baseImponible>${element.total}</baseImponible>`;
    xml += `\n<valor>0.00</valor>`;
    xml += `\n</impuesto>`;
    xml += `\n</impuestos>`;
    xml += `\n</detalle>`;
  });

  xml += `\n</detalles>`;
  xml += `\n<infoAdicional>`;
  xml += `\n<campoAdicional nombre="Lugar Entrega">LUGAR DE ENTREGA DEL PRODUCTO O SERVICIO</campoAdicional>`;
  xml += `\n<campoAdicional nombre="Observaciones">OBSERVACIONES ADICIONALES</campoAdicional>`;
  xml += `\n</infoAdicional>`;
  xml += `\n</factura>`;

  return [xml, key, secuencial];
};

const singXml = async (xml) => {
  const password = "13061994";
  const p12 = fs.readFileSync(
    path.join(__dirname, `../../ANDRES_PAUL_JARAMILLO_VACA_270622123005.p12`)
  );
  const xmls = await xmlSing(xml, password, p12);
  return xmls;
};

module.exports = {
  createXMl,
  singXml,
};
