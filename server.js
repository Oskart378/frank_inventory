const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://osacarloopez85:Mweed606@cluster0.kwhm6.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('Failed to connect to MongoDB', err);
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Define Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    quantity: Number,
    total: Number
});

const Product = mongoose.model('Product', productSchema);

// Routes
app.get('/products', async (req, res) => {
    const products = await Product.find();
    res.json(products);
});

app.post('/products', async (req, res) => {
    const { name, price, quantity } = req.body;
    const total = price * quantity;
    const newProduct = new Product({ name, price, quantity, total });
    await newProduct.save();
    res.json(newProduct);
});

app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    res.sendStatus(204);
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
