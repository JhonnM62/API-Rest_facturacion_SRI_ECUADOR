const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.DB_HOST;

main().catch((err) => console.log(err));

async function main() {
  try {
    await mongoose.connect(uri);
    console.log("¡Conexión exitosa a MongoDB!");
  } catch (error) {
    console.error("Error al conectar a MongoDB:", error.message);
  }
}
