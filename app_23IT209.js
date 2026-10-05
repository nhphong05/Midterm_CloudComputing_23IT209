require("dotenv").config();

const express = require("express");
const path = require("path");
const session = require("express-session");
const MongoStore = require("connect-mongo");

const bookRoutes = require("./routes/bookRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// ========================================
// MIDDLEWARE
// ========================================
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ========================================
// STATELESS SESSION (LƯU TẬP TRUNG XUỐNG CLOUD MONGO ATLAS)
// ========================================
const mongoStoreOptions = {
    mongoUrl: process.env.MONGODB_WRITE_URI,
    collectionName: "sessions",
    ttl: 14 * 24 * 60 * 60
};

app.use(
    session({
        secret: process.env.SESSION_SECRET || "super_secret_key_23IT209",
        resave: false,
        saveUninitialized: false,
        store: (MongoStore.create || MongoStore.default.create)({
            mongoUrl: process.env.MONGODB_WRITE_URI,
            collectionName: "sessions",
            ttl: 14 * 24 * 60 * 60
        }),
        cookie: { maxAge: 1000 * 60 * 60 * 24 }
    })
);
// ========================================
// VIEW ENGINE (HANDLEBARS)
// ========================================
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

// ========================================
// ROUTES
// ========================================
app.get("/", (req, res) => res.redirect("/books"));
app.use("/books", bookRoutes);

app.use((req, res) => res.status(404).send("Page not found."));

// ========================================
// START SERVER
// ========================================
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});