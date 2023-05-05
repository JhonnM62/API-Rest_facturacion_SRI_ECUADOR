/* Generar el xml de la factura */
/* Modules */
const moment = require("moment-timezone");
const util = require("../util/util");

const AMBIENTE = 1;

const invoice = (data, sec) => {
  const table = [];

  const dete = moment().tz("America/Guayaquil").format("DD/MM/YYYY");
  console.log(">>>>hora", dete);
  const secuencial = sec;
  const key = util.accessKey(data, dete, secuencial);

  /* Logic */

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

  const subtotal = parseFloat(totalValue(table));
  console.log(">>>tarifa", data.tax.codigoPorcentaje);
  let tax = 0;
  let totalTax = 0;

  if (data.tax.codigoPorcentaje == 0) {
    tax = 0;
    totalTax = subtotal;
  } else if (data.tax.codigoPorcentaje == 2) {
    tax = ((subtotal * 12) / 100).toFixed(2);
    totalTax = (parseFloat(subtotal) + parseFloat(tax)).toFixed(2);
    console.log(">>>total de todo", totalTax);
  }

  /* xml  */

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
  xml += `\n<codigoPorcentaje>${data.tax.codigoPorcentaje}</codigoPorcentaje>`;
  xml += `\n<baseImponible>${parseFloat(subtotal)}</baseImponible>`;
  xml += `\n<valor>${tax}</valor>`;
  xml += `\n</totalImpuesto>`;
  xml += `\n</totalConImpuestos>`;
  xml += `\n<propina>${data.tax.propina}</propina> `;
  xml += `\n<importeTotal>${parseFloat(totalTax)}</importeTotal>`;
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
    xml += `\n<valor>${(element.total * 0.12).toFixed(2)}</valor>`;
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

  return [xml, key];
};

module.exports = invoice;
