const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
app.use(express.json());


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Database connection error:", err));


const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
  },

  productCode: {
    type: String,
    required: true,
    unique: true,
  },

  category: {
    type: String,
    enum: ["Electronics", "Clothing", "Food", "Furniture"],
  },

  supplierName: {
    type: String,
    required: true,
  },

  quantityInStock: {
    type: Number,
    min: 0,
  },

  reorderLevel: {
    type: Number,
    min: 1,
  },

  unitPrice: {
    type: Number,
    min: 0,
  },

  manufactureDate: {
    type: Date,
  },

  productType: {
    type: String,
    enum: ["Perishable", "Non-Perishable"],
  },

  status: {
    type: String,
    enum: ["Available", "Out of Stock"],
    default: "Available",
  },
});

const Product = mongoose.model("Product", productSchema);

app.post("/products", async (req, res, next) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
});

app.get("/products", async (req, res, next) => {
  try {
    const products = await Product.find()
    res.status(200).json(products)
  } catch (err) {
    next(err)
  }
})

app.get("/products/search", async (req, res, next) => {
  try {
    const name = req.query.name

    const products = await Product.find({
      productName: { $regex: name, $options: "i" }
    })

    res.status(200).json(products)
  } catch (err) {
    next(err)
  }
})

app.get("/products/category", async (req, res, next) => {
  try {
    const category = req.query.cat

    const products = await Product.find({ category })

    res.status(200).json(products)
  } catch (err) {
    next(err)
  }
})

app.get("/products/:id", async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: "Product not found" })
    }

    res.status(200).json(product)
  } catch (err) {
    next(err)
  }
})

app.put("/products/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (err) {
    next(err);
  }
});

app.delete("/products/:id", async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
});

app.get("/products/search", async (req, res, next) => {
  try {
    const name = req.query.name;

    const products = await Product.find({
      productName: { $regex: name, $options: "i" },
    });

    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
});

app.get("/products/category", async (req, res, next) => {
  try {
    const category = req.query.cat;

    const products = await Product.find({ category });

    res.status(200).json(products);
  } catch (err) {
    next(err);
  }
});


app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    return res.status(400).json({ error: err.message });
  }

  res.status(500).json({ error: "Server Error" });
});


app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});