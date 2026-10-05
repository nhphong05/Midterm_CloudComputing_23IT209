const express = require("express");
const { ReadBook, WriteBook } = require("../config/database");

const router = express.Router();

// =========================
// GET /books - Danh sách sách (Sử dụng user READ)
// =========================
router.get("/", async (req, res) => {
    try {
        // Cập nhật đếm lượt truy cập Session (Stateless Session)
        req.session.views = (req.session.views || 0) + 1;

        const books = await ReadBook.find().sort({ createdAt: -1 }).lean();

        res.render("index", {
            books: books,
            name: "Ngo Nhat Phong",
            mssv: "23IT209",
            vatRate: 14,
            sessionViews: req.session.views
        });
    } catch (error) {
        console.error("Error reading books:", error);
        res.status(500).send("Cannot read books from database.");
    }
});

// =========================
// GET /books/add - Trang thêm sách
// =========================
router.get("/add", (req, res) => {
    res.render("add", {
        name: "Ngo Nhat Phong",
        mssv: "23IT209",
        vatRate: 14
    });
});

// =========================
// POST /books - Thêm sách mới (Sử dụng user WRITE)
// =========================
router.post("/", async (req, res) => {
    try {
        const { code, title, author, price } = req.body;

        // Kiểm tra trường bắt buộc
        if (!code || !title || !author || price === undefined || price === "") {
            return res.status(400).send("All fields are required.");
        }

        const cleanCode = code.trim();
        const cleanTitle = title.trim();
        const cleanAuthor = author.trim();
        const numericPrice = Number(price);

        if (Number.isNaN(numericPrice) || numericPrice < 0) {
            return res.status(400).send("Price must be a valid positive number.");
        }

        // Kiểm tra mã sản phẩm bắt đầu bằng 209 (theo MSSV: 23IT209)
        if (!cleanCode.startsWith("209")) {
            return res.status(400).send("Invalid product code. Product code must start with 209.");
        }

        // Tính VAT chuẩn: Số cuối MSSV = 9 => VAT = 9 + 5 = 14%
        const lastDigit = 9;
        const vatRate = lastDigit + 5;
        const vatAmount = (numericPrice * vatRate) / 100;
        const finalPrice = numericPrice + vatAmount;

        // Lưu sách mới bằng kết nối WRITE
        const newBook = new WriteBook({
            code: cleanCode,
            title: cleanTitle,
            author: cleanAuthor,
            price: numericPrice,
            vat: vatRate,
            finalPrice: finalPrice
        });

        await newBook.save();
        res.redirect("/books");

    } catch (error) {
        console.error("Error creating book:", error);

        if (error.code === 11000) {
            return res.status(400).send("Product code already exists.");
        }

        if (error.name === "MongoServerError" && error.code === 13) {
            return res.status(403).send("Database permission denied.");
        }

        res.status(500).send("Cannot create book.");
    }
});

module.exports = router;