class ItemController {
    constructor(application, db) {

        application.get("/item", (request, response) => {
            db.all(`SELECT i.id,d.name,d.description,i.item_description_id,i.price,i.notice,d.photos
                 FROM item i
                 JOIN item_description d on d.id=i.item_description_id
                 WHERE NOT i.is_archived                      
                 ORDER BY d.name`, [], (error, rows) => {
                if (error) {
                    response.status(500).json(error.message);
                } else {
                    response.json(rows);
                }
            });
        });

        application.get("/item/:id", (request, response) => {
            const { id } = request.params;
            db.get(`SELECT i.id,d.name,d.description,i.item_description_id,i.price,i.notice,d.photos
                 FROM item i
                 JOIN item_description d on d.id=i.item_description_id
                 WHERE i.id = ?
                 AND NOT i.is_archived`, [id], (error, row) => {
                if (error) {
                    response.status(500).json({ error: error.message });
                } else if (!row) {
                    response.status(404).json({ error: "Item not found" });
                } else {
                    response.json(row);
                }
            });
        });

        application.post("/item", (request, response) => {
            const { item_description_id, price, notice } = request.body;
            if (!item_description_id) {
                return response.status(400).json({ error: " item_description_id is required" });
            }
            if (!price) {
                return response.status(400).json({ error: "price is required" });
            }

            db.run(`INSERT INTO item (item_description_id,price,notice) VALUES (?, ?, ?)`,
                [item_description_id, price, notice], function (error) {
                    if (error) {
                        response.status(500).json({ error: error.message });
                    } else {
                        response.status(201).json({ id: this.lastID, item_description_id, price, notice });
                    }
                });
        });

        application.put("/item/:id", (request, response) => {
            const { id } = request.params;
            const { item_description_id, price, notice } = request.body;

            if (!item_description_id) {
                return response.status(400).json({ error: "item_description_id is required" });
            }

            if (!price) {
                return response.status(400).json({ error: "price is required" });
            }

            db.run(`UPDATE item SET item_description_id=?, price=?, notice=?
                    WHERE id = ?
                    AND NOT is_archived`,
                [item_description_id, price, notice, id], function (error) {
                    if (error) {
                        response.status(500).json({ error: error.message });
                    } else if (this.changes === 0) {
                        response.status(404).json({ error: "Item not found" });
                    } else {
                        response.json({ item_description_id, price, notice });
                    }
                });
        });

        application.delete("/item/:id", (request, response) => {
            const { id } = request.params;
            db.run(`
                UPDATE item
                SET is_archived = 1 
                WHERE id = ? 
                AND NOT is_archived`,
                [id], function (error) {
                    if (error) {
                        response.status(500).json({ error: error.message });
                    } else if (this.changes === 0) {
                        response.status(404).json({ error: "Item not found" });
                    } else {
                        response.status(204).end();
                    }
                });
        });
    }
}
module.exports = ItemController;
