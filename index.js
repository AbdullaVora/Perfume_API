const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/database');
const loginRoute = require("./routers/auth/userRoute")
const forgotRouter = require("./routers/auth/forgotRoute")
const categoryRoute = require("./routers/Dashboard/product_config/categoryRoute")
const variantsRoute = require("./routers/Dashboard/product_config/variantsRoute")
const brandRoute = require("./routers/Dashboard/product_config/brandRoute")
const sliderRoute = require("./routers/Dashboard/banner_config/sliderRoute")
const bannerRoute = require("./routers/Dashboard/banner_config/bannerRoute")
const couponRoute = require("./routers/Dashboard/banner_config/couponRoute")
const orderStatusRoute = require("./routers/Dashboard/orders_config/orderStatusRoute");
const ordersRoute = require("./routers/Dashboard/orders_config/allOrdersRoute");
const paymentMethodRoute = require("./routers/Dashboard/website_config/paymentMethodRoute");
const shippinPartnerRoute = require("./routers/Dashboard/website_config/shipingPartnerRoute");
const socialLinksRoute = require("./routers/Dashboard/website_config/socialLinksRoute");
const productRoute = require("./routers/Dashboard/product/productRoute")
const addToCartRoute = require("./routers/ECommerce/addToCartRouter");
const WishRoute = require("./routers/ECommerce/wishRouter")
const inquiryRoute = require("./routers/ECommerce/inquiryRouter")
const subAdminRoute = require("./routers/Dashboard/SubAdmin/subAdmiRouter")
const EmailSentRoute = require("./routers/Dashboard/EmailSent/EmailSentRouter")
const AddressRoute = require("./routers/ECommerce/addressRouter")

// Middleware to parse JSON requests
app.use(express.json({ limit: "300mb" }));
app.use(express.urlencoded({ extended: true, limit: "300mb" }));

const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://192.168.10.11:3000",
            "https://superadmin-qmet.onrender.com",
            "https://fur-stpre-next-js.vercel.app",
            "https://super-admin-xi.vercel.app",
            "https://fur-stpre-next-7zstxuy2t-abdullavoras-projects.vercel.app",
            "https://perfume-web-kappa.vercel.app",
            "https://perfume-5grqmwvd5-abdullavoras-projects.vercel.app",
            "https://perfume-admin-lqmtolplk-abdullavoras-projects.vercel.app",
            "https://perfume-admin-xi.vercel.app"
        ];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true); // Allow the request
        } else {
            callback(new Error("Not allowed by CORS")); // Block the request
        }
    },
    methods: "GET,POST,PUT,DELETE",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true // Allow credentials if using cookies or authentication headers
};


app.use(cors(corsOptions));

// Enhanced static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, filePath) => {
        res.set('Cache-Control', 'public, max-age=31536000');
        res.set('Access-Control-Allow-Origin', '*'); // Or use specific domain
        res.set('Access-Control-Allow-Credentials', 'true');

        // Handle filenames with spaces
        if (filePath.includes(' ')) {
            res.set('Content-Disposition', `inline; filename="${path.basename(filePath)}"`);
        }
    }
}));

app.get('/', (req, res) => {
    res.send('Welcome To My FurStore API!! Server Running.....');
});

app.use("/api/auth", loginRoute)
app.use("/api/auth", forgotRouter)

app.use("/api/dashboard", EmailSentRoute)
app.use("/api/dashboard", categoryRoute)
app.use("/api/dashboard", variantsRoute)
app.use("/api/dashboard", brandRoute)
app.use("/api/dashboard", sliderRoute)
app.use("/api/dashboard", bannerRoute)
app.use("/api/dashboard", couponRoute)
app.use("/api/dashboard", orderStatusRoute)
app.use("/api/dashboard", ordersRoute)
app.use("/api/dashboard", paymentMethodRoute)
app.use("/api/dashboard", shippinPartnerRoute)
app.use("/api/dashboard", socialLinksRoute)
app.use("/api/dashboard", productRoute)

app.use("/api/dashboard", subAdminRoute)

app.use("/api/e-commerce", addToCartRoute)
app.use("/api/e-commerce", WishRoute)
app.use("/api/e-commerce", inquiryRoute)

app.use("/api/address", AddressRoute)

// Start the server
app.listen(PORT, (err) => {
    if (err) console.error(err);
    else connectDB(); console.log(`Server is running on http://localhost:${PORT}`);
});
