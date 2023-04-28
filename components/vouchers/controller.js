/* lib */
const fs = require("fs");
const path = require("path");

/* modulos */
const sing = require("../sing/sing");
const invoice = require("./model/invoice");
const withholdings = require("./model/withholdings");
const guides = require("./model/guides");
const { generarSecuencial } = require("./util/util");
const { VALIDATE, AUTHORIZE } = require("../webServices/controller");
const { pdfBill, pdfWithholdings, pdfGuides } = require("../pdf/controller");

const User = require("../login/src/models/User");

/* Logic */

const responseInvoice = async (data, req) => {
  try {
    /*console.log(
      "llegaron a controller xml:",
      req.userId,
      req.pfirma_digital,
      req.serial,
      req.p12File
    );*/
    const SEC = generarSecuencial(req.serial.toString());
    console.log("sec>>>", SEC);

    const [xml, key] = invoice(data, SEC);
    const singXml = await sing(xml, req.pfirma_digital, req.p12File);

    const validate = await VALIDATE(singXml);
    let { estado } = validate.RespuestaRecepcionComprobante;
    if (estado == "DEVUELTA") {
      const { mensaje } =
        validate.RespuestaRecepcionComprobante.comprobantes.comprobante
          .mensajes;
      console.log(mensaje);
    } else {
      const authorize = await AUTHORIZE(key);
      const {
        estado: status,
        fechaAutorizacion,
        ambiente,
      } = authorize.RespuestaAutorizacionComprobante.autorizaciones
        .autorizacion;

      if (status == "AUTORIZADO") {
        /*  Generar pdf */
        const send = {
          fechaAutorizacion,
          ambiente,
          serial: SEC,
        };

        await pdfBill(data, key, send);
        /* exito: guardar en la base de datos en nuevo secuencial se recomienda guardar tambien el key comprobante */

        const filter = { _id: req.userId };
        const update = { $set: { serial: SEC } };
        const result = await User.updateOne(filter, update);
        console.log(`${result.modifiedCount} documento(s) modificado(s)`);
        return singXml;
        /* exito: guardar en la base de datos en nuevo secuencial se recomienda guardar tambien el key comprobante */
      } else console.log(authorize.RespuestaAutorizacionComprobante);
    }
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const resposeWithholdings = async (data, pfirma_digital, serial, p12File) => {
  try {
    const SEC = generarSecuencial(serial.toString());

    /* logic */
    const [xml, key] = withholdings(data, SEC);

    const singXml = await sing(xml, pfirma_digital, p12File, 07);

    const validate = await VALIDATE(singXml);
    let { estado } = validate.RespuestaRecepcionComprobante;
    if (estado == "DEVUELTA") {
      const { mensaje } =
        validate.RespuestaRecepcionComprobante.comprobantes.comprobante
          .mensajes;
      console.log(mensaje);
    } else {
      const authorize = await AUTHORIZE(key);
      const {
        estado: status,
        fechaAutorizacion,
        ambiente,
      } = authorize.RespuestaAutorizacionComprobante.autorizaciones
        .autorizacion;

      if (status == "AUTORIZADO") {
        /*  Generar pdf */
        const send = {
          fechaAutorizacion,
          ambiente,
          serial: SEC,
        };

        await pdfWithholdings(data, key, send);
        /* exito: guardar en la base de datos en nuevo secuencial se recomienda guardar tambien el key comprobante */

        const filter = { _id: verifyToken.id };
        const update = { $set: { serial: SEC } };
        const result = await User.updateOne(filter, update);
        console.log(`${result.modifiedCount} documento(s) modificado(s)`);
        return singXml;
      } else
        console.log(
          authorize.RespuestaAutorizacionComprobante.autorizaciones.autorizacion
            .mensajes
        );
    }
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const resposeGuides = async (data, req) => {
  try {
    const SEC = generarSecuencial(serial.toString());
    await verifyToken(req, null, null);
    /* logic */
    const [xml, key] = guides(data, SEC);
    const singXml = await sing(xml, pfirma_digital, p12File, 06);

    const validate = await VALIDATE(singXml);
    let { estado } = validate.RespuestaRecepcionComprobante;
    if (estado == "DEVUELTA") {
      const { mensaje } =
        validate.RespuestaRecepcionComprobante.comprobantes.comprobante
          .mensajes;
      console.log(mensaje);
    } else {
      const authorize = await AUTHORIZE(key);
      const {
        estado: status,
        fechaAutorizacion,
        ambiente,
      } = authorize.RespuestaAutorizacionComprobante.autorizaciones
        .autorizacion;

      if (status == "AUTORIZADO") {
        /*  Generar pdf */
        const send = {
          fechaAutorizacion,
          ambiente,
          serial: SEC,
        };

        await pdfGuides(data, key, send);

        /* exito: guardar en la base de datos en nuevo secuencial se recomienda guardar tambien el key comprobante */

        const filter = { _id: verifyToken.id };
        const update = { $set: { serial: SEC } };
        const result = await User.updateOne(filter, update);
        console.log(`${result.modifiedCount} documento(s) modificado(s)`);
        return singXml;
      } else
        console.log(
          authorize.RespuestaAutorizacionComprobante.autorizaciones.autorizacion
            .mensajes
        );
    }
    return null;
  } catch (err) {
    console.error(err);
    return null;
  }
};

module.exports = {
  responseInvoice,
  resposeWithholdings,
  resposeGuides,
};
