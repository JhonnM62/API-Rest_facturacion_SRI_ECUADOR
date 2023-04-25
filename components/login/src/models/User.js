const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      unique: true,
    },
    pfirma_digital: {
      type: String,
      required: true,
    },
    serial: {
      type: String,
      required: true,
    },
    p12File: {
      type: Buffer, // o type: String si prefieres almacenar la ruta del archivo en vez del archivo mismo
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

//productSchema.statics.encryptPassword = async (password) => {
//const salt = await bcrypt.genSalt(10);
//return await bcrypt.hash(password, salt);
//};

/*productSchema.statics.comparePassword = async (password, receivedPassword) => {
  return await bcrypt.compare(password, receivedPassword)
}*/
productSchema.statics.comparePassword = (pfirma_digital, receivedPassword) => {
  return pfirma_digital === receivedPassword;
};

productSchema.pre("save", async function (next) {
  const user = this;
  if (!user.isModified("pfirma_digital")) {
    return next();
  }
  //const hash = await bcrypt.hash(user.password, 10);
  //user.password = hash;
  // si hay un archivo .p12 en la petición, procesarlo
  if (user.p12File && user.p12File instanceof Buffer) {
    return next();
  }

  next();
});

module.exports = mongoose.model("User", productSchema);
