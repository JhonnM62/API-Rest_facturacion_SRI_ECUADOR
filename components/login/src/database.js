const mongoose = require('mongoose');

const user = 'jhonnym62';
const password = 'WQiuRumQwQOvg3JA';
const dbname ='SRI_FAC';
const uri = `mongodb+srv://${user}:${password}@cluster0.mnysxnv.mongodb.net/${dbname}?retryWrites=true&w=majority`;

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect(uri);
  console.log('¡Conexión exitosa a MongoDB!');
}