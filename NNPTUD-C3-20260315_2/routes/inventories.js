var express = require('express');
var router = express.Router();
let inventoryModel = require('../schemas/inventories');
let productModel = require('../schemas/products');

// Get all inventories
router.get('/', async function (req, res, next) {
    try {
        let result = await inventoryModel.find().populate('product');
        res.send(result);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Get inventory by ID (with product join)
router.get('/:id', async function (req, res, next) {
    try {
        let result = await inventoryModel.findById(req.params.id).populate('product');
        if (result) {
            res.send(result);
        } else {
            res.status(404).send({ message: "Inventory ID NOT FOUND" });
        }
    } catch (error) {
        res.status(404).send({ message: error.message });
    }
});

// Add_stock ({product, quantity}) - POST
router.post('/add-stock', async function (req, res, next) {
    try {
        const { product, quantity } = req.body;
        if (!product || quantity === undefined) {
            return res.status(400).send({ message: "Product ID and quantity are required" });
        }
        
        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) {
            return res.status(404).send({ message: "Inventory for this product not found" });
        }
        
        inventory.stock += Number(quantity);
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Remove_stock ({product, quantity}) - POST
router.post('/remove-stock', async function (req, res, next) {
    try {
        const { product, quantity } = req.body;
        if (!product || quantity === undefined) {
            return res.status(400).send({ message: "Product ID and quantity are required" });
        }
        
        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) {
            return res.status(404).send({ message: "Inventory for this product not found" });
        }
        
        if (inventory.stock < quantity) {
            return res.status(400).send({ message: "Not enough stock" });
        }
        
        inventory.stock -= Number(quantity);
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// reservation ({product, quantity}) - POST (giảm stock và tăng reserved)
router.post('/reservation', async function (req, res, next) {
    try {
        const { product, quantity } = req.body;
        if (!product || quantity === undefined) {
            return res.status(400).send({ message: "Product ID and quantity are required" });
        }
        
        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) {
            return res.status(404).send({ message: "Inventory for this product not found" });
        }
        
        if (inventory.stock < quantity) {
            return res.status(400).send({ message: "Not enough stock to reserve" });
        }
        
        inventory.stock -= Number(quantity);
        inventory.reserved += Number(quantity);
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// sold ({product, quantity}) - POST (giảm reservation và tăng soldCount)
router.post('/sold', async function (req, res, next) {
    try {
        const { product, quantity } = req.body;
        if (!product || quantity === undefined) {
            return res.status(400).send({ message: "Product ID and quantity are required" });
        }
        
        let inventory = await inventoryModel.findOne({ product: product });
        if (!inventory) {
            return res.status(404).send({ message: "Inventory for this product not found" });
        }
        
        if (inventory.reserved < quantity) {
            return res.status(400).send({ message: "Not enough reserved stock to sell" });
        }
        
        inventory.reserved -= Number(quantity);
        inventory.soldCount += Number(quantity);
        await inventory.save();
        res.send(inventory);
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

module.exports = router;
