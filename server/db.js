// server/db.js
const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

// Cargar variables de entorno
dotenv.config();

// URL de conexión a MongoDB (desde variable de entorno)
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/conversor-monedas";

// Cliente MongoDB
const client = new MongoClient(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Función para conectar con la base de datos
async function connectDB() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB correctamente");
    return client.db("conversor-monedas");
  } catch (error) {
    console.error("Error conectando a MongoDB:", error);
    process.exit(1);
  }
}

// Función para desconectar
async function disconnectDB() {
  try {
    await client.close();
    console.log("Desconectado de MongoDB");
  } catch (error) {
    console.error("Error al desconectar de MongoDB:", error);
  }
}

// Exportar funciones y cliente
module.exports = {
  connectDB,
  disconnectDB,
  client,
};
