const db = require("../../config/db.js");


const addProduct = async (req, res) => {

    const { name, description, price, category_id, variants, tag_ids, imageUrls } = req.body
    if (!name || !price || !category_id) return res.status(204).json({ message: "Missing Fields" })
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction()
        const [result] = await connection.execute(`
            INSERT INTO products
            (name, description, price, category_id) 
            VALUES (?,?,?,?)`,
            [name, description, price, category_id]
        )
        const productId = result.insertId


        if (variants?.length) {
            for (const variant of variants) {
                await connection.execute(`
                INSERT INTO product_variants
                (product_id, color, size, stock)
                VALUES(?, ?, ?, ?)`,
                    [productId, variant.color, variant.size, variant.stock]
                )
            }
        }

        if (tag_ids?.length) {
            for (const tagId of tag_ids) {
                await connection.execute(
                    `INSERT INTO product_tags
                    (product_id, tag_id)
                    VALUES (?, ?)`,
                    [productId, tagId]
                );
            }
        }

        if (imageUrls?.length) {
            for (const url of imageUrls) {
                await connection.execute(
                    `INSERT INTO product_images
                    (product_id, image_url)
                    VALUES (?, ?)`,
                    [productId, url]
                );
            }
        }


        await connection.commit();
        connection.release();

        return res.status(201).json({
            message: "Product created successfully",
            productId
        });
    } catch (error) {
        await connection.rollback();
        connection.release();

        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}




const deleteProduct = async (req, res) => {
    const { id } = req.params;

    try {
        const [product] = await db.query(
            'SELECT id FROM products WHERE id = ?',
            [id]
        );

        if (product.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // check if product has been ordered — cannot delete
        const [ordered] = await db.query(
            'SELECT id FROM order_items WHERE product_id = ? LIMIT 1',
            [id]
        );

        if (ordered.length > 0) {
            return res.status(409).json({
                message: 'Cannot delete a product that has existing orders. Consider updating stock to 0 instead.'
            });
        }

        // cascades will handle: product_images, product_tags, product_variants
        await db.query('DELETE FROM products WHERE id = ?', [id]);

        return res.status(200).json({ message: 'Product deleted successfully' });

    } catch (err) {
        console.error('DELETE /admin/products/:id →', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const updateStock = async (req, res) => {
    const { id } = req.params; // product id
    const { variant_id, stock } = req.body;

    if (variant_id === undefined || stock === undefined) {
        return res.status(400).json({ message: 'variant_id and stock are required' });
    }

    if (!Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({ message: 'stock must be a non-negative integer' });
    }

    try {
        const [variant] = await db.query(
            'SELECT id FROM product_variants WHERE id = ? AND product_id = ?',
            [variant_id, id]
        );

        if (variant.length === 0) {
            return res.status(404).json({ message: 'Variant not found for this product' });
        }

        await db.query(
            'UPDATE product_variants SET stock = ? WHERE id = ? AND product_id = ?',
            [stock, variant_id, id]
        );

        return res.status(200).json({ message: 'Stock updated successfully' });

    } catch (err) {
        console.error('PATCH /admin/products/:id/stock →', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


const VALID_STATUSES = [
    'pending',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
];

const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    // validate status value
    if (!status) {
        return res.status(400).json({ message: 'status is required' });
    }

    if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
            message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`
        });
    }

    try {
        // check order exists
        const [order] = await db.query(
            'SELECT id, status FROM orders WHERE id = ?',
            [id]
        );

        if (order.length === 0) {
            return res.status(404).json({ message: 'Order not found' });
        }

        const currentStatus = order[0].status;

        // prevent going backwards illogically
        const statusFlow = {
            pending: ['confirmed', 'cancelled'],
            confirmed: ['shipped', 'cancelled'],
            shipped: ['delivered', 'cancelled'],
            delivered: ['refunded'],
            cancelled: [],
            refunded: []
        };

        if (!statusFlow[currentStatus].includes(status)) {
            return res.status(409).json({
                message: `Cannot transition order from '${currentStatus}' to '${status}'`
            });
        }

        await db.query(
            'UPDATE orders SET status = ? WHERE id = ?',
            [status, id]
        );

        return res.status(200).json({
            message: `Order status updated to '${status}'`
        });

    } catch (err) {
        console.error('PATCH /admin/orders/:id/status →', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { addProduct, updateStock, deleteProduct, updateOrderStatus };