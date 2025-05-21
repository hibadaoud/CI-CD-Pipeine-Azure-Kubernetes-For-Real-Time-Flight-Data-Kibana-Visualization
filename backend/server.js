// server.js
const connectDb = require("./config/dbConnection");
const createApp = require("./createApp");
require('dotenv').config();

connectDb();

const app = createApp();

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
