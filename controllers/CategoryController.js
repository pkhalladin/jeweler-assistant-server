class CategoryController {
    constructor(application, db) {

        application.get("/category", (request, response) => {
            db.all(
                `SELECT id, name, description, photos 
                 FROM category
                 WHERE NOT is_archived
                 ORDER BY name`, [], (error, rows) => {
                if (error) {
                    response.status(500).json(error.message);
                } else {
                    response.json(rows);
                }
            });
        });

        application.get("/category/:id", (request, response) => {
            const { id } = request.params;
            db.get(
                `SELECT id, name, description, photos
                 FROM category
                 WHERE id = ?
                 AND NOT is_archived`, [id], (error, row) => {
                if (error) {
                    response.status(500).json({ error: error.message });
                } else if (!row) {
                    response.status(404).json({ error: "Category not found" });
                } else {
                    response.json(row);
                }
            });
        });

        application.post("/category", (request, response) => {
            const { name, description, photos } = request.body;
            if (!name) {
                return response.status(400).json({ error: "Name is required" });
            }

            if (!description) {
                return response.status(400).json({ error: "Description is required" });
            }

            if (!photos) {
                return response.status(400).json({ error: "Photos is required" });
            }

            db.run("INSERT INTO category (name, description, photos) VALUES (?, ?, ?)",
                [name, description, photos], function (error) {
                    if (error) {
                        response.status(500).json({ error: error.message });
                    } else {
                        response.status(201).json({ id: this.lastID, name, description, photos });
                    }
                });
        });

        application.put("/category/:id", (request, response) => {
            const { id } = request.params;
            const { name, description, photos } = request.body;

            if (!name) {
                return response.status(400).json({ error: "Name is required" });
            }

            if (!description) {
                return response.status(400).json({ error: "Description is required" });
            }

            if (!photos) {
                return response.status(400).json({ error: "Photos is required" });
            }

            db.run(
                `UPDATE category 
                 SET name = ?, description = ?, photos = ? 
                 WHERE id = ?
                 AND NOT is_archived`,
                [name, description, photos, id], function (error) {
                    if (error) {
                        response.status(500).json({ error: error.message });
                    } else if (this.changes === 0) {
                        response.status(404).json({ error: "Category not found" });
                    } else {
                        response.json({ id, name, description, photos });
                    }
                });
        });

        application.delete("/category/:id", (request, response) => {
            const { id } = request.params;

            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                db.run(
                    `UPDATE category 
                     SET is_archived = 1
                     WHERE id = ?
                     AND NOT is_archived`, [id], function (error) {
                    if (error) {
                        response.status(500).json({ error: error.message });
                        db.run("ROLLBACK");
                    } else if (this.changes === 0) {
                        response.status(404).json({ error: "Category not found" });
                        db.run("ROLLBACK");
                    } else {
                        db.run(
                            `UPDATE item_description 
                             SET is_archived = 1
                             WHERE category_id = ?`, [id], function (error) {
                            if (error) {
                                response.status(500).json({ error: error.message });
                                db.run("ROLLBACK");
                            } else {
                                db.run("COMMIT");
                                response.status(204).end();
                            }
                        });
                    }
                });
            });
        });
    }
}

module.exports = CategoryController;
