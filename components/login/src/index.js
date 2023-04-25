const app =require ("./app.js");
require("./database.js");
const { PORT } =require ("./config.js");


app.listen(PORT);
console.log("Server on port", app.get("port"));
