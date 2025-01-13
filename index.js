const express = require("express");
const application = express();

application.use(express.json());

application.get("/ping", (request, response) => {
    return response.json({
        message: "pong"
    });
});

const PORT = process.env.PORT || 3001;
application.listen(PORT, () => {
    console.log(`Server started at port ${PORT}...`);
});
