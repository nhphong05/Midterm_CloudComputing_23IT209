require("dotenv").config();
const mongoose = require("mongoose");
const bookSchema = require("../models/Book");

const readURI = process.env.MONGODB_READ_URI;
const writeURI = process.env.MONGODB_WRITE_URI;
const connectionOptions = {
    dbName: process.env.MONGODB_DB_NAME || "DB_23IT209",
    authSource: "admin"
};

if (!readURI || !writeURI) {
    console.error("LỖI: Chưa đọc được MONGODB_READ_URI hoặc MONGODB_WRITE_URI trong file .env!");
}

// Luồng READ (Đọc dữ liệu)
const readConnection = mongoose.createConnection(readURI, connectionOptions);
readConnection.on("connected", () => console.log("MongoDB READ connection successful"));
readConnection.on("error", (err) => console.log("MongoDB READ error:", err.message));

// Luồng WRITE (Ghi dữ liệu)
const writeConnection = mongoose.createConnection(writeURI, connectionOptions);
writeConnection.on("connected", () => console.log("MongoDB WRITE connection successful"));
writeConnection.on("error", (err) => console.log("MongoDB WRITE error:", err.message));

// Gắn Schema vào các luồng kết nối tương ứng
const ReadBook = readConnection.model("Book", bookSchema);
const WriteBook = writeConnection.model("Book", bookSchema);

module.exports = {
    readConnection,
    writeConnection,
    ReadBook,
    WriteBook
};