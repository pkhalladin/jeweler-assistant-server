class ItemDescriptionController {
    constructor(application, db) {

        application.get("/item_description", (request, response) => {
            db.all(`SELECT id,category_id,name,description,price,photos
                 FROM item_description d
                 WHERE NOT is_archived                      
                 ORDER BY name`, [], (error, rows) => {
                if (error) {
                    response.status(500).json(error.message);
                } else {
                    response.json(rows);
                }
            });
        });

        application.get("/item_description/:id", (request, response) => {
            const { id } = request.params;
            db.get(`SELECT id,category_id,name,description,price,photos
                 FROM item_description d
                 WHERE d.id = ?
                 AND NOT is_archived`, [id], (error, row) => {
                if (error) {
                    response.status(500).json({ error: error.message });
                } else if (!row) {
                    response.status(404).json({ error: "Item not found" });
                } else {
                    response.json(row);
                }
            });
        });

        application.post("/item_description", (request, response) => {
            const { category_id, name, description, price, photos } = request.body;
            if (!category_id) {
                return response.status(400).json({ error: "category is required" });
            }
            if (!name) {
                return response.status(400).json({ error: "Name is required" });
            }
            if (!description) {
                return response.status(400).json({ error: "Description is required" });
            }
            if (!price) {
                return response.status(400).json({ error: "price is required" });
            }
            if (!photos) {
                return response.status(400).json({ error: "Photos is required" });
            }
            db.run(`INSERT INTO item_description (category_id,name,description,price,photos) VALUES (?, ?, ?,?,?)`,
                [category_id, name, description, price, photos], function (error) {
                    if (error) {
                        response.status(500).json({ error: error.message });
                    } else {
                        response.status(201).json({ id: this.lastID, category: category_id, name, description, price, photos });
                    }
                });
        });

        application.put("/item_description/:id", (request, response) => {
            const { id } = request.params;
            const { category_id, name, description, price, photos } = request.body;
            if (!category_id) {
                return response.status(400).json({ error: "category is required" });
            }
            if (!name) {
                return response.status(400).json({ error: "Name is required" });
            }

            if (!description) {
                return response.status(400).json({ error: "Description is required" });
            }
            if (!price) {
                return response.status(400).json({ error: "price is required" });
            }

            if (!photos) {
                return response.status(400).json({ error: "Photos is required" });
            }

            db.run(`UPDATE item_description SET category_id=?, name =?, description =?,price=?, photos =?
                 AND NOT is_archived WHERE id = ?`,
                [category_id, name, description, price, photos, id], function (error) {
                    if (error) {
                        response.status(500).json({ error: error.message });
                    } else if (this.changes === 0) {
                        response.status(404).json({ error: "item not found" });
                    } else {
                        response.json({ id, name, description, price, photos });
                    }
                });
        });

        application.delete("/item_description/:id", (request, response) => {
            const { id } = request.params;
            db.run(`UPDATE item_description
            SET is_archived=1 
            WHERE id = ? AND NOT is_archived`,
                [id], function (error) {
                    if (error) {
                        response.status(500).json({ error: error.message });
                    } else if (this.changes === 0) {
                        response.status(404).json({ error: "Category_id not found" });
                    } else {
                        response.status(204).end();
                    }
                });
        });
    }
}
module.exports = ItemDescriptionController;
