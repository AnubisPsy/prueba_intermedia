// server/index.js
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./db");
const { ObjectId } = require("mongodb");

// Crear la aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

let db;

// Conectar a MongoDB antes de iniciar el servidor
async function startServer() {
  db = await connectDB();

  // Ruta para obtener historial de conversiones
  app.get("/api/history", async (req, res) => {
    try {
      const historyCollection = db.collection("history");
      const history = await historyCollection
        .find({})
        .sort({ date: -1 })
        .limit(100)
        .toArray();

      res.json(history);
    } catch (error) {
      console.error("Error al obtener historial:", error);
      res.status(500).json({ error: "Error al obtener historial" });
    }
  });

  // Ruta para guardar nueva conversión
  app.post("/api/history", async (req, res) => {
    try {
      const historyCollection = db.collection("history");
      const newConversion = {
        ...req.body,
        date: new Date(req.body.date), // Convertir a objeto Date
      };

      const result = await historyCollection.insertOne(newConversion);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error al guardar conversión:", error);
      res.status(500).json({ error: "Error al guardar conversión" });
    }
  });

  // Ruta para obtener favoritos
  app.get("/api/favorites", async (req, res) => {
    try {
      const favoritesCollection = db.collection("favorites");
      const favorites = await favoritesCollection.find({}).toArray();

      res.json(favorites);
    } catch (error) {
      console.error("Error al obtener favoritos:", error);
      res.status(500).json({ error: "Error al obtener favoritos" });
    }
  });

  // Ruta para guardar nuevo favorito
  app.post("/api/favorites", async (req, res) => {
    try {
      const favoritesCollection = db.collection("favorites");

      // Verificar si ya existe
      const existingFavorite = await favoritesCollection.findOne({
        from: req.body.from,
        to: req.body.to,
      });

      if (existingFavorite) {
        return res
          .status(400)
          .json({ error: "Esta conversión ya está guardada como favorita" });
      }

      const result = await favoritesCollection.insertOne(req.body);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error al guardar favorito:", error);
      res.status(500).json({ error: "Error al guardar favorito" });
    }
  });

  // Ruta para eliminar favorito
  app.delete("/api/favorites/:id", async (req, res) => {
    try {
      const favoritesCollection = db.collection("favorites");
      const result = await favoritesCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });

      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Favorito no encontrado" });
      }

      res.status(200).json({ message: "Favorito eliminado correctamente" });
    } catch (error) {
      console.error("Error al eliminar favorito:", error);
      res.status(500).json({ error: "Error al eliminar favorito" });
    }
  });

  // Iniciar el servidor
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en http://localhost:${PORT}`);
  });
}

// Iniciar el servidor
startServer().catch(console.error);
