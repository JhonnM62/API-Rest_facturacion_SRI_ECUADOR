//Modules
const fs = require("fs");
const path = require("path");
const pdf = require("puppeteer");
const hbs = require("handlebars");
const moment = require("moment");
const Enviar_PDF = require("../api_whatsapp/controller");

const pdfBill = async ({ product, details, customer, tax }, cod, inf) => {
  //Name del pdf
  const pdfName = cod + "_doc.pdf";

  //productos
  const table = [];

  //Calcula el valor total de cualquier propiedad numerica
  const totalValue = (obj, key = "total") => {
    let total = 0;
    obj.forEach((f) => (total += parseFloat(f[`${key}`].toString())));
    return total.toFixed(2);
  };

  //Se crea el objeto de los productos dinamicos
  product.forEach((d) => {
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
    });
  });

  //Calculos necesarios para la factura
  let subtotal = totalValue(table);
  let tax1 = 0;
  let totalTax = parseFloat(subtotal);
  console.log(">>>tax", tax.codigoPorcentaje);
  if (tax.codigoPorcentaje == 0) {
    tax1 = 0;
    totalTax = parseFloat(subtotal);
  } else if (tax.codigoPorcentaje == 2) {
    tax1 = ((subtotal * 12) / 100).toFixed(2);
    console.log("tax1", tax1);
    totalTax = parseFloat(subtotal) + parseFloat(tax1);
  }

  //Informacion para generacion del pdf
  const pdf = {
    product: table,
    pdfName: pdfName,
    path: `./docs/${pdfName}`,
    template: "bill",
    cod,
    details,
    customer,
    inf,
    subtotal,
    tax: tax1,
    totalTax: totalTax.toFixed(2),
  };

  await generateInvoiceHtml(pdf);
};

const pdfWithholdings = async ({ impuestos, details, customer }, cod, inf) => {
  //Name del pdf
  const pdfName = cod + "_doc.pdf";

  //productos
  const table = [];

  //Se crea el objeto de los productos dinamicos
  impuestos.forEach((d) => {
    table.push({
      code: d.retener,
      date_emi: moment(inf.fechaAutorizacion).format("DD/MM/YYYY").toString(),
      fiscal: details.periodo_fiscal,
      imponible: d.base_imponible,
      porcentaje: d.porcentaje,
      total: parseFloat((d.base_imponible * d.porcentaje) / 100).toFixed(2),
    });
  });

  //Informacion para generacion del pdf
  const pdf = {
    product: table,
    pdfName: pdfName,
    path: `./docs/${pdfName}`,
    template: "withholdings",
    cod,
    details,
    customer,
    inf,
  };

  await generateInvoiceHtml(pdf);
};

const pdfGuides = async ({ destinatarios, details, customer }, cod, inf) => {
  //Name del pdf
  const pdfName = cod + "_doc.pdf";

  //Informacion para generacion del pdf
  const pdf = {
    product: destinatarios,
    pdfName: pdfName,
    path: `./docs/${pdfName}`,
    template: "guides",
    cod,
    details,
    customer,
    inf,
  };

  await generateInvoiceHtml(pdf);
};

const generateInvoiceHtml = async ({
  pdfName,
  product,
  template,
  path,
  cod,
  details,
  customer,
  inf,
  subtotal,
  tax,
  totalTax,
}) => {
  console.log(`generating pdf: ${pdfName} ...`);

  const browser = await pdf.launch();
  const page = await browser.newPage();

  // generate the pdf
  await page.setContent(
    htmlView(
      template,
      product,
      cod,
      details,
      customer,
      inf,
      subtotal,
      tax,
      totalTax
    )
  );

  //CONFIG
  await page.emulateMediaType("screen");
  await page.pdf({
    path: path,
    format: "A4",
    printBackground: true,
  });

  console.log("done");
  await browser.close();
  //api whatsapp
  const resp = await Enviar_PDF(path, customer.number, customer.email);
  console.log("RESPUESTA PDF: ", resp);
};

const htmlView = (
  template,
  data,
  key,
  details,
  customer,
  inf,
  subtotal,
  tax,
  totalTax
) => {
  const html = fs.readFileSync(
    path.join(__dirname, `../../templates/${template}.hbs`),
    "utf-8"
  );

  const info = {
    products: data,
    key,
    ruc: details.ruc,
    date: moment().format("DD/MM/YYYY"),
    dateAut: inf.fechaAutorizacion,
    serial: inf.serial,
    ambiente: inf.ambiente,
    customer,
    details,
    subtotal,
    tax,
    totalTax,
  };

  return hbs.compile(html)(info);
};

module.exports = {
  pdfBill,
  pdfWithholdings,
  pdfGuides,
};
