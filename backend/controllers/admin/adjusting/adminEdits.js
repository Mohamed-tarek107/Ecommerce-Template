const db = require("../../config/db.js");


const addProduct = async (req,res) => {
    
    const { name, description, price, category_id, variants, tag_ids, imageUrls } = req.body
    if (!name || !price || !category_id) return res.status(204).json({ message: "Missing Fields"})
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
        for(const variant of variants){
                await connection.execute(`
                INSERT INTO product_variants
                (product_id, color, size, stock)
                VALUES(?, ?, ?, ?)`,
                [productId, variant.color, variant.size, variant.stock]
            )
        }
    }

        if (tag_ids?.length){
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

module.exports = { addProduct };