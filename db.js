// config/db.js
const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "e-com-tenthouse",
});

db.connect((err) => {
  if (err) console.log(err);
  else console.log("MySQL Connected ✅");
});

module.exports = db;