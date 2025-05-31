const { promises: fsPromises } = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const productModel = require('../../../models/Dashboard/product/productModel');
const categoriesModel = require('../../../models/Dashboard/product/categoryModel');
const { response } = require('express');
const subCategoriesModel = require('../../../models/Dashboard/product/subCategoryModel');
const variantsModel = require('../../../models/Dashboard/product/variantsModel');
const detailsModel = require('../../../models/Dashboard/product/detailsModel');
const additionalModel = require('../../../models/Dashboard/product/additionalModel');
require('dotenv').config();
const multer = require('multer');
const Brand = require('../../../models/Dashboard/product_config/brandModel');
const brandModel = require('../../../models/Dashboard/product/brandModel');
const { uploadMedia, uploadMultipleMedia } = require('../../../helpers/Cloudinary');
const { uploader } = require('cloudinary').v2;


// ✅ Base Upload Directory
const uploadsDir = path.join(__dirname, '../../../uploads');

// ✅ Ensure directory exists before using
const ensureDirectoryExists = async (dir) => {
    try {
        // Using fs.promises.access() to check directory existence
        try {
            await fsPromises.access(dir);
        } catch {
            // Directory doesn't exist, create it
            await fsPromises.mkdir(dir, { recursive: true });
        }
        console.log(`✅ Directory ensured: ${dir}`);
    } catch (error) {
        console.error(`❌ Error creating directory ${dir}:`, error);
        throw error; // Re-throw the error to handle it in the calling function
    }
};

// ✅ Move file to new location
const moveFile = async (sourcePath, destinationPath) => {
    try {
        // Check if source exists
        try {
            await fsPromises.access(sourcePath);
        } catch {
            console.error(`🚨 Source file not found: ${sourcePath}`);
            return;
        }

        // Move the file
        await fsPromises.rename(sourcePath, destinationPath);
        console.log(`✅ File moved: ${destinationPath}`);
    } catch (error) {
        console.error(`❌ Error moving file:`, error);
        throw error;
    }
};


// ✅ Multer Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('❌ Only image files are allowed!'), false);
        }
    }
});

const createProduct = async (req, res) => {
    // console.log(req.body)
    try {
        const {
            name,
            slug,
            skuCode,
            brand,
            category,
            subcategory,
            description,
            details,
            additional,
            mrp,
            price,
            discount,
            variants,
            stockManagement,
            images,
            thumbnail,
            mainMedia,
            videos,
            forPage,
            forSection
        } = req.body;


        // // Upload images in parallel
        const [uploadedThumbnail, uploadedMain, uploadedImages, uploadVideos] = await Promise.all([
            uploadMedia(thumbnail),
            uploadMedia(mainMedia),
            uploadMultipleMedia(images),
            uploadMultipleMedia(videos)
        ]);

        console.log(uploadedImages, uploadedThumbnail, uploadedMain, uploadVideos)


        // Create the initial product without images
        const product = await productModel.create({
            name,
            slug,
            skuCode,
            price,
            mrp,
            mainDiscount: discount,
            description,
            stockManagement,
            images: uploadedImages,
            thumbnail: uploadedThumbnail,
            main: uploadedMain,
            videos: uploadVideos,
            forPage,
            forSection
        });


        let categoryId;
        if (category) {
            const addCategory = await categoriesModel.create({
                name: category,
                thumbnail: thumbnail || '',
                productId: product._id
            });
            categoryId = addCategory._id;
        } else {
            return res.status(404).json({ message: 'category not found' });
        }

        let brandId;
        if (brand) {
            const brandCategory = await brandModel.create({
                name: brand,
                productId: product._id,
                brandCategoryId: categoryId
            })
            brandId = brandCategory._id;
        } else {
            return res.status(404).json({ message: 'brand not found' });
        }

        let subcategoryId;
        if (subcategory) {
            const addSubCategory = await subCategoriesModel.create({
                name: subcategory,
                thumbnail: thumbnail || '',
                productId: product._id,
                categoryId: categoryId
            });
            subcategoryId = addSubCategory._id;
        } else {
            return res.status(404).json({ message: 'subcategory not found' });
        }

        let variantsId;
        if (variants && variants.length > 0) {
            const variantsData = await variantsModel.create({
                variants: variants.map((data) => ({
                    id: data.id || `variant_${Date.now()}`,
                    data: data.data,
                    mrp: data.mrp,
                    price: data.price,
                    stock: data.stock
                })),
                productId: product._id,
            });
            variantsId = variantsData._id;
        } else {
            return res.status(404).json({ message: 'variants not found' });
        }

        let detailsId;
        if (details && details.length > 0) {
            const detailsData = await detailsModel.create({
                details: details.map((data) => ({
                    id: data.id || `detail_${Date.now()}`,
                    title: data.title,
                    value: data.value
                })),
                productId: product._id,
            });
            detailsId = detailsData._id;
        } else {
            return res.status(404).json({ message: 'details not found' });
        }

        let additionalId;
        if (additional && additional.length > 0) {
            const additionalData = await additionalModel.create({
                additional: additional.map((data) => ({
                    id: data.id || `detail_${Date.now()}`,
                    title: data.title,
                    value: data.value
                })),
                productId: product._id,
            });
            additionalId = additionalData._id;
        } else {
            additionalId = null; // Make this optional
        }

        // Construct Ids object based on what was created
        const Ids = {
            category: categoryId,
            subcategory: subcategoryId,
            variants: variantsId,
            details: detailsId,
            brand: brandId,
            brandCategory: categoryId
        };

        // Only add additional if it exists
        if (additionalId) {
            Ids.additional = additionalId;
        }

        // Update product with the relationship IDs
        const updatedProduct = await productModel.findByIdAndUpdate(
            product._id,
            { $set: Ids },
            { new: true, runValidators: true }
        );

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Failed to update product with IDs' });
        }

        res.status(200).json({
            success: true,
            message: "Successfully Added Product",
            data: updatedProduct
        });

    } catch (error) {
        console.error(error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};


// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         // Don't create folders yet - we'll do that dynamically after product creation
//         cb(null, 'uploads/temp'); // Temporary location
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 5 * 1024 * 1024 },
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype.startsWith('image/')) {
//             cb(null, true);
//         } else {
//             cb(new Error('Only image files are allowed'), false);
//         }
//     }
// }).any(); // Use .any() to accept any field names


// // ✅ Base Upload Directory
// const uploadsDir = path.join(__dirname, '../../../uploads');

// // ✅ Ensure directory exists before using
// const ensureDirectoryExists = async (dir) => {
//     try {
//         // Using fs.promises.access() to check directory existence
//         try {
//             await fsPromises.access(dir);
//         } catch {
//             // Directory doesn't exist, create it
//             await fsPromises.mkdir(dir, { recursive: true });
//         }
//         console.log(`✅ Directory ensured: ${dir}`);
//     } catch (error) {
//         console.error(`❌ Error creating directory ${dir}:`, error);
//         throw error; // Re-throw the error to handle it in the calling function
//     }
// };

// // ✅ Move file to new location
// const moveFile = async (sourcePath, destinationPath) => {
//     try {
//         // Check if source exists
//         try {
//             await fsPromises.access(sourcePath);
//         } catch {
//             console.error(`🚨 Source file not found: ${sourcePath}`);
//             return;
//         }

//         // Move the file
//         await fsPromises.rename(sourcePath, destinationPath);
//         console.log(`✅ File moved: ${destinationPath}`);
//     } catch (error) {
//         console.error(`❌ Error moving file:`, error);
//         throw error;
//     }
// };


// // ✅ Multer Configuration
// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, uploadsDir);
//     },
//     filename: (req, file, cb) => {
//         cb(null, `${Date.now()}-${file.originalname}`);
//     },
// });

// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
//     fileFilter: (req, file, cb) => {
//         if (file.mimetype.startsWith('image/')) {
//             cb(null, true);
//         } else {
//             cb(new Error('❌ Only image files are allowed!'), false);
//         }
//     }
// });

// ✅ Controller Function: Create Product
// const createProduct = async (req, res) => {
//     try {
//         const { name, slug, skuCode, brand, category, subcategory, description, details, additional, mrp, price, discount, variants } = req.body;

//         console.log(variants)

//         // ✅ Create product in DB to get ID
//         const product = await productModel.create({
//             name, slug, skuCode, brand, price, mrp, discount, description
//         });

//         let thumbnailUrl = '';
//         let images = [];

//         if (req.files) {
//             const productDir = path.join(uploadsDir, 'product', product._id.toString());
//             const imageDir = path.join(productDir, 'images');
//             const thumbnailDir = path.join(productDir, 'thumbnail');

//             // ✅ Ensure directories exist
//             await ensureDirectoryExists(uploadsDir);
//             await ensureDirectoryExists(productDir);
//             await ensureDirectoryExists(imageDir);
//             await ensureDirectoryExists(thumbnailDir);

//             // ✅ Process Images
//             if (req.files.images) {
//                 for (const file of req.files.images) {
//                     const fileName = path.basename(file.path);
//                     const destPath = path.join(imageDir, fileName);
//                     await moveFile(file.path, destPath);
//                     images.push(`${process.env.BACKEND_URL}/uploads/product/${product._id}/images/${fileName}`);
//                 }
//             }

//             // ✅ Process Thumbnail
//             if (req.files.thumbnail && req.files.thumbnail[0]) {
//                 const thumbnailFile = req.files.thumbnail[0];
//                 const fileName = path.basename(thumbnailFile.path);
//                 const destPath = path.join(thumbnailDir, fileName);
//                 await moveFile(thumbnailFile.path, destPath);
//                 thumbnailUrl = `${process.env.BACKEND_URL}/uploads/product/${product._id}/thumbnail/${fileName}`;
//             }
//         }



//         // Update product with image URLs
//         await productModel.findByIdAndUpdate(product._id, {
//             images: images,
//             thumbnail: thumbnailUrl || null
//         });

//         // Fix your category/subcategory/other handling
//         let categoryId;
//         if (category) {
//             const addCategory = await categoriesModel.create({
//                 name: category,
//                 thumbnail: thumbnailUrl,
//                 productId: product._id
//             });
//             categoryId = addCategory._id;
//         } else {
//             return res.status(400).json({ message: 'Category is required' });
//         }

//         let subcategoryId;
//         if (subcategory) {
//             const addSubCategory = await subCategoriesModel.create({
//                 name: subcategory,
//                 thumbnail: thumbnailUrl,
//                 productId: product._id,
//                 categoryId: categoryId
//             });
//             subcategoryId = addSubCategory._id;
//         } else {
//             return res.status(400).json({ message: 'Subcategory is required' });
//         }

//         // Handle variants - FIXED THE TYPO HERE
//         let variantsId = [];
//         if (variants) {
//             let variantsArray = variants;
//             if (typeof variants === 'string') {
//                 try {
//                     variantsArray = JSON.parse(variants);
//                 } catch (e) {
//                     return res.status(400).json({ message: 'Invalid variants format' });
//                 }
//             }

//             if (Array.isArray(variantsArray) && variantsArray.length > 0) {
//                 const variantsData = variantsArray.map((data) => ({
//                     id: data.id || `variant_${Date.now()}`,
//                     data: data.data,
//                     mrp: data.mrp,
//                     price: data.price,
//                     stock: data.stock,
//                     productId: product._id,
//                 }));

//                 try {
//                     const createdVariants = await variantsModel.insertMany(variantsData);
//                     variantsId = createdVariants.map((variant) => variant._id);
//                 } catch (error) {
//                     console.error('Variants creation error:', error);
//                     // Don't return here - just continue with empty array
//                 }
//             }
//         }

//         // Handle details
//         let detailsId = [];
//         if (details) {
//             let detailsArray = details;
//             if (typeof details === 'string') {
//                 try {
//                     detailsArray = JSON.parse(details);
//                 } catch (e) {
//                     console.error('Details parse error:', e);
//                     // Continue with empty array
//                 }
//             }

//             if (Array.isArray(detailsArray) && detailsArray.length > 0) {
//                 const detailsData = detailsArray.map((data) => ({
//                     id: data.id || `detail_${Date.now()}`,
//                     title: data.title,
//                     value: data.value,
//                     productId: product._id,
//                 }));

//                 try {
//                     const createdDetails = await detailsModel.insertMany(detailsData);
//                     detailsId = createdDetails.map((detail) => detail._id);
//                 } catch (error) {
//                     console.error('Details creation error:', error);
//                 }
//             }
//         }

//         // Handle additional
//         let additionalId = [];
//         if (additional) {
//             let additionalArray = additional;
//             if (typeof additional === 'string') {
//                 try {
//                     additionalArray = JSON.parse(additional);
//                 } catch (e) {
//                     console.error('Additional parse error:', e);
//                 }
//             }

//             if (Array.isArray(additionalArray) && additionalArray.length > 0) {
//                 const additionalData = additionalArray.map((data) => ({
//                     id: data.id || `additional_${Date.now()}`,
//                     title: data.title,
//                     value: data.value,
//                     productId: product._id,
//                 }));

//                 try {
//                     const createdAdditional = await additionalModel.insertMany(additionalData);
//                     additionalId = createdAdditional.map((additional) => additional._id);
//                 } catch (error) {
//                     console.error('Additional creation error:', error);
//                 }
//             }
//         }

//         // Update product with all IDs
//         const updateData = {
//             category: categoryId,
//             subcategory: subcategoryId,
//             variants: variantsId,
//             details: detailsId,
//             additional: additionalId
//         };

//         await productModel.findByIdAndUpdate(
//             product._id,
//             { $set: updateData },
//             { new: true, runValidators: true }
//         );

//         res.status(200).json({ message: "Successfully Added Product", data: product })

//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ success: false, message: error.message });
//     }
// }


const getAllProducts = async (req, res) => {
    try {
        // Fetch products
        const products = await productModel.find()
            .populate('category')
            .populate('subcategory')
            .populate('variants')
            .populate('details')
            .populate('additional')
            .populate('brandCategory')
            .populate('brand');

        console.log('Products fetched successfully:', products);
        res.status(200).json(products);


    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch products',
            error: error.message
        });
    }
};

// READ single product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await Product.findById(id)
            .populate('category')
            .populate('subcategory')
            .populate('details')
            .populate('variants')
            .populate('additional');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error('Error fetching product by ID:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
};

// READ single product by slug
const getProductBySlug = async (req, res) => {
    try {
        const { slug } = req.params;

        const product = await Product.findOne({ slug })
            .populate('category')
            .populate('subcategory')
            .populate('details')
            .populate('variants')
            .populate('additional');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.status(200).json({
            success: true,
            product
        });

    } catch (error) {
        console.error('Error fetching product by slug:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch product',
            error: error.message
        });
    }
};

// // UPDATE product
// const updateProduct = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const { name, slug, skuCode, brand, category, subcategory, description, details, additional, mrp, price, discount, stockManagement, variants, images, thumbnail, status, main, forPage, forSection } = req.body;
//         let thumbnailUrl = '';

//         // Find product
//         const product = await productModel.findById(id)
//             .populate('category')
//             .populate('subcategory')
//             .populate('variants')
//             .populate('details')
//             .populate('additional')
//             .populate('brandCategory')
//             .populate('brand');

//         if (!product) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Product not found'
//             });
//         }

//         // Upload images in parallel
//         const [uploadedThumbnail, uploadedMain, uploadedImages] = await Promise.all([
//             uploadImage(thumbnail || product.thumbnail),
//             uploadImage(main || product.main),
//             uploadMultipleImages(images.length ? images : product.images)
//         ]);

//         const productUpdate = await productModel.findByIdAndUpdate(id, {
//             name, slug, skuCode, price, mrp, mainDiscount: discount, description, stockManagement, images: uploadedImages, thumbnail: uploadedThumbnail, status, main: uploadedMain, forPage, forSection
//         })

//         // // Handle image uploads
//         // if (req.files) {
//         //     const productDir = path.join('uploads', 'product', product._id.toString());
//         //     const imageDir = path.join(productDir, 'images');
//         //     const thumbnailDir = path.join(productDir, 'thumbnail');

//         //     // Ensure directories exist
//         //     createDirectoryIfNotExists(imageDir);
//         //     createDirectoryIfNotExists(thumbnailDir);

//         //     let images = [];

//         //     // Process images
//         //     if (req.files.images && req.files.images.length > 0) {
//         //         for (let i = 0; i < req.files.images.length; i++) {
//         //             const image = req.files.images[i];
//         //             const imageName = `image_${i}_${Date.now()}${path.extname(image.originalname)}`;
//         //             const imagePath = path.join(imageDir, imageName);

//         //             // Save image file
//         //             fs.writeFileSync(imagePath, image.buffer);

//         //             // Add to product's images array
//         //             images.push(`${process.env.BACKEND_URL}/uploads/product/${product._id}/images/${imageName}`);
//         //         }
//         //     }

//         //     // Process thumbnail
//         //     if (req.files.thumbnail && req.files.thumbnail.length > 0) {
//         //         const thumbnail = req.files.thumbnail[0];
//         //         const thumbnailName = `thumbnail_${Date.now()}${path.extname(thumbnail.originalname)}`;
//         //         const thumbnailPath = path.join(thumbnailDir, thumbnailName);

//         //         // Save thumbnail file
//         //         fs.writeFileSync(thumbnailPath, thumbnail.buffer);

//         //         thumbnailUrl = `${process.env.BACKEND_URL}/uploads/product/${product._id}/thumbnail/${thumbnailName}`;
//         //     }

//         //     // Update product with image URLs
//         //     const updateImages = await productModel.findByIdAndUpdate((await product)._id, {
//         //         images: images,
//         //         thumbnail: thumbnailUrl
//         //     })
//         // }

//         let brandId;
//         if (brand) {
//             const brandCategory = await brandModel.findByIdAndUpdate(product.brand._id, {
//                 name: brand,
//                 brandCategoryId: product.brandCategory._id,
//                 productId: product._id
//             })
//             brandId = brandCategory._id;
//         } else {
//             return res.status(404).json({ message: 'brand not found' });
//         }

//         let categoryId;
//         if (category) {
//             const addCategory = await categoriesModel.findByIdAndUpdate(product.category._id, {
//                 name: category,
//                 thumbnail: thumbnailUrl,
//                 productId: product._id
//             })
//             categoryId = addCategory._id;
//         } else {
//             res.status(404).json({ message: 'category not found' });
//         }

//         let subcategoryId;
//         if (subcategory) {
//             const addSubCategory = await subCategoriesModel.findByIdAndUpdate(product.subcategory._id, {
//                 name: subcategory,
//                 thumbnail: thumbnailUrl,
//                 productId: product._id,
//                 categoryId: categoryId
//             })
//             subcategoryId = addSubCategory._id;
//         } else {
//             res.status(404).json({ message: 'subcategory not found' });
//         }

//         let variantsId;
//         if (variants) {
//             console.log(variants)
//             const variantsData = await variantsModel.findByIdAndUpdate(product.variants._id, {
//                 variants: variants.map((data) => ({
//                     id: data.id || `variant_${Date.now()}`,
//                     data: data.data,
//                     mrp: data.mrp,
//                     price: data.price,
//                     stock: data.stock
//                 })),
//                 productId: product._id,
//             })
//             variantsId = variantsData._id;
//         } else {
//             res.status(404).json({ message: 'variants not found' });
//         }

//         let detailsId;
//         if (details) {
//             const detailsData = await detailsModel.findByIdAndUpdate(product.details._id, {
//                 details: details.map((data) => ({
//                     id: data.id || `detail_${Date.now()}`,
//                     title: data.title,
//                     value: data.value
//                 })),
//                 productId: product._id,
//             })
//             detailsId = detailsData._id
//         } else {
//             res.status(404).json({ message: 'details not found' });
//         }

//         let additionalId;
//         if (additional) {
//             const additionalData = await additionalModel.findByIdAndUpdate(product.additional._id, {
//                 additional: additional.map((data) => ({
//                     id: data.id || `detail_${Date.now()}`,
//                     title: data.title,
//                     value: data.value
//                 })),
//                 productId: product._id,
//             })
//             additionalId = additionalData._id
//         }

//         if (categoryId && subcategoryId && variantsId && detailsId && additionalId) {
//             const Ids = {}
//             Ids.category = categoryId,
//                 Ids.subcategory = subcategoryId,
//                 Ids.variants = variantsId,
//                 Ids.details = detailsId,
//                 Ids.additional = additionalId,
//                 Ids.brand = brandId;

//             const updateIds = await productModel.findByIdAndUpdate(product._id, { $set: Ids }, { new: true, runValidators: true });
//         } else {
//             res.status(404).json({ message: 'Failed to added IDs' });
//         }

//         res.status(200).json({ message: "Successfully Updated Product", product })


//     } catch (error) {
//         console.error('Error updating product:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to update product',
//             error: error.message
//         });
//     }
// };

const updateProduct = async (req, res) => {
    console.log(req.body)
    try {
        const { id } = req.params;
        const {
            name, slug, skuCode, brand, category, subcategory,
            description, details, additional, mrp, price, discount,
            stockManagement, variants, images = [], thumbnail, status,
            mainMedia, videos, forPage, forSection
        } = req.body;

        // Find product
        const product = await productModel.findById(id)
            .populate('category')
            .populate('subcategory')
            .populate('variants')
            .populate('details')
            .populate('additional')
            .populate('brandCategory')
            .populate('brand');

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Handle image uploads with proper fallbacks
        // const [uploadedThumbnail, uploadedMain, uploadedImages, uploadVideos] = await Promise.all([
        //     thumbnail ? uploadMedia(thumbnail) : Promise.resolve(product.thumbnail),
        //     main ? uploadMedia(mainMedia) : Promise.resolve(product.main),
        //     images.length > 0 ? uploadMultipleMedia(images) : Promise.resolve(product.images),
        //     videos.length > 0 ? uploadMultipleMedia(videos) : Promise.resolve(product.videos)
        // ]);

        console.log("images", images)
        const [uploadedThumbnail, uploadedMain, uploadedImages, uploadVideos] = await Promise.all([
            uploadMedia(thumbnail),
            uploadMedia(mainMedia),
            uploadMultipleMedia(images),
            uploadMultipleMedia(videos)
        ]);


        console.log(uploadedImages, uploadedThumbnail, uploadedMain, uploadVideos)


        // Base product update
        const updateData = {
            name: name || product.name,
            slug: slug || product.slug,
            skuCode: skuCode || product.skuCode,
            price: price !== undefined ? price : product.price,
            mrp: mrp !== undefined ? mrp : product.mrp,
            mainDiscount: discount !== undefined ? discount : product.mainDiscount,
            description: description || product.description,
            stockManagement: stockManagement !== undefined ? stockManagement : product.stockManagement,
            images: uploadedImages,
            videos: uploadVideos,
            thumbnail: uploadedThumbnail,
            status: status !== undefined ? status : product.status,
            main: uploadedMain,
            forPage: forPage || product.forPage,
            forSection: forSection || product.forSection
        };

        // Update the main product document
        const updatedProduct = await productModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        // Update related documents in parallel
        const updatePromises = [];

        if (brand && product.brand) {
            updatePromises.push(
                brandModel.findByIdAndUpdate(product.brand._id, {
                    name: brand,
                    brandCategoryId: product.brandCategory?._id,
                    productId: product._id
                })
            );
        }

        if (category && product.category) {
            updatePromises.push(
                categoriesModel.findByIdAndUpdate(product.category._id, {
                    name: category,
                    thumbnail: uploadedThumbnail,
                    productId: product._id
                })
            );
        }

        if (subcategory && product.subcategory) {
            updatePromises.push(
                subCategoriesModel.findByIdAndUpdate(product.subcategory._id, {
                    name: subcategory,
                    thumbnail: uploadedThumbnail,
                    productId: product._id,
                    categoryId: product.category?._id
                })
            );
        }

        // In your updateProduct controller, modify the variants section:

        if (variants && product.variants) {
            // Normalize variants into an array
            let variantsArray = [];

            if (Array.isArray(variants)) {
                variantsArray = variants;
            } else if (Array.isArray(variants.variants)) {
                variantsArray = variants.variants;
            }

            updatePromises.push(
                variantsModel.findByIdAndUpdate(
                    product.variants._id,
                    {
                        variants: variantsArray.map((data) => ({
                            id: data.id || `variant_${Date.now()}`,
                            data: Array.isArray(data.data) ? data.data : [],
                            mrp: data.mrp !== undefined ? data.mrp : 0,
                            price: data.price !== undefined ? data.price : 0,
                            stock: data.stock !== undefined ? data.stock : 0
                        })),
                        productId: product._id,
                    },
                    { new: true }
                )
            );
        }


        if (details && product.details) {
            const detailsArray = Array.isArray(details) ? details : [];
            updatePromises.push(
                detailsModel.findByIdAndUpdate(product.details._id, {
                    details: detailsArray.map((data) => ({
                        id: data.id || `detail_${Date.now()}`,
                        title: data.title || '',
                        value: data.value || ''
                    })),
                    productId: product._id,
                })
            );
        }

        if (additional && product.additional) {
            const additionalArray = Array.isArray(additional) ? additional : [];

            updatePromises.push(
                additionalModel.findByIdAndUpdate(product.additional._id, {
                    additional: additionalArray.map((data) => ({
                        id: data.id || `detail_${Date.now()}`,
                        title: data.title || '',
                        value: data.value || ''
                    })),
                    productId: product._id,
                })
            );
        }

        // Wait for all updates to complete
        await Promise.all(updatePromises);

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update product',
            error: error.message
        });
    }
};

// DELETE product
// const deleteProduct = async (req, res) => {
//     try {
//         const { id } = req.params;

//         // Find product
//         const product = await productModel.findById(id)
//             .populate('category')
//             .populate('subcategory')
//             .populate('variants')
//             .populate('details')
//             .populate('additional')
//             .populate('brandCategory')
//             .populate('brand');


//         if (!product) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Product not found'
//             });
//         }

//         // Delete related documents properly
//         if (product.category) {
//             await categoriesModel.findByIdAndDelete(product.category._id);
//         }

//         if (product.subcategory) {
//             await subCategoriesModel.findByIdAndDelete(product.subcategory._id);
//         }

//         if (product.variants) {
//             await variantsModel.findByIdAndDelete(product.variants._id);
//         }

//         if (product.details) {
//             await detailsModel.findByIdAndDelete(product.details._id);
//         }

//         if (product.additional) {
//             await additionalModel.findByIdAndDelete(product.additional._id);
//         }

//         if (product.brand) {
//             await brandModel.findByIdAndDelete(product.brand._id);
//         }

//         // // Delete associated files
//         // const productDir = path.join('uploads', 'product', product._id.toString());
//         // if (fs.existsSync(productDir)) {
//         //     fs.rmSync(productDir, { recursive: true, force: true });
//         // }

//         // Delete the product itself
//         await productModel.findByIdAndDelete(id);

//         res.status(200).json({
//             success: true,
//             message: 'Product and associated data deleted successfully'
//         });

//     } catch (error) {
//         console.error('Error deleting product:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to delete product',
//             error: error.message
//         });
//     }
// };


const getPublicIdFromUrl = (url) => {
    try {
        const urlObj = new URL(url);
        const parts = urlObj.pathname.split('/');

        const versionIndex = parts.findIndex(p => /^v\d+/.test(p)); // finds v1746707471
        const publicIdParts = parts.slice(versionIndex + 1); // ['products', 'gglxtwhcelccccgko1re.jpg']
        const publicId = publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // remove .jpg, .png, etc.

        return publicId; // e.g. 'products/gglxtwhcelccccgko1re'
    } catch (err) {
        console.warn('Invalid Cloudinary URL:', url);
        return null;
    }
};


const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await productModel.findById(id)
            .populate('category')
            .populate('subcategory')
            .populate('variants')
            .populate('details')
            .populate('additional')
            .populate('brandCategory')
            .populate('brand');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        // 🔥 Delete Cloudinary images
        const allImageUrls = [
            product.thumbnail,
            product.main,
            ...(Array.isArray(product.images) ? product.images : [])
        ].filter(url => url && url.includes('res.cloudinary.com'));

        for (const imageUrl of allImageUrls) {
            const publicId = getPublicIdFromUrl(imageUrl);
            if (publicId) {
                console.log(publicId)
                try {
                    await uploader.destroy(publicId, { resource_type: 'image' });
                } catch (err) {
                    console.warn(`Failed to delete image ${publicId}:`, err.message);
                }
            }
        }

        // Delete related documents
        if (product.category) await categoriesModel.findByIdAndDelete(product.category._id);
        if (product.subcategory) await subCategoriesModel.findByIdAndDelete(product.subcategory._id);
        if (product.variants) await variantsModel.findByIdAndDelete(product.variants._id);
        if (product.details) await detailsModel.findByIdAndDelete(product.details._id);
        if (product.additional) await additionalModel.findByIdAndDelete(product.additional._id);
        if (product.brand) await brandModel.findByIdAndDelete(product.brand._id);

        await productModel.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Product, images, and associated data deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete product',
            error: error.message
        });
    }
};


// GET categories
const getAllCategories = async (req, res) => {
    try {
        const categories = await Categories.find({}).sort({ name: 1 });

        res.status(200).json({
            success: true,
            categories
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch categories',
            error: error.message
        });
    }
};

// GET subcategories by category
const getSubcategoriesByCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;

        const subcategories = await Subcategories.find({ categoryId })
            .sort({ name: 1 });

        res.status(200).json({
            success: true,
            subcategories
        });

    } catch (error) {
        console.error('Error fetching subcategories:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch subcategories',
            error: error.message
        });
    }
};

// CREATE a new category
const createCategory = async (req, res) => {
    try {
        const { name, productId } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Category name is required'
            });
        }

        let thumbnail = '';

        // Handle thumbnail upload
        if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
            const categoryDir = path.join('uploads', 'categories');
            createDirectoryIfNotExists(categoryDir);

            const thumbnailFile = req.files.thumbnail[0];
            const thumbnailName = `category_${Date.now()}${path.extname(thumbnailFile.originalname)}`;
            const thumbnailPath = path.join(categoryDir, thumbnailName);

            fs.writeFileSync(thumbnailPath, thumbnailFile.buffer);
            thumbnail = `${process.env.BACKEND_URL}/uploads/categories/${thumbnailName}`;
        }

        const category = new Categories({
            name,
            productId: productId || null,
            thumbnail,
            updatedAt: Date.now()
        });

        await category.save();

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            category
        });

    } catch (error) {
        console.error('Error creating category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create category',
            error: error.message
        });
    }
};

// CREATE a new subcategory
const createSubcategory = async (req, res) => {
    try {
        const { name, categoryId, productId } = req.body;

        if (!name || !categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Subcategory name and category ID are required'
            });
        }

        // Verify category exists
        const category = await Categories.findById(categoryId);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        let thumbnail = '';

        // Handle thumbnail upload
        if (req.files && req.files.thumbnail && req.files.thumbnail.length > 0) {
            const subcategoryDir = path.join('uploads', 'subcategories');
            createDirectoryIfNotExists(subcategoryDir);

            const thumbnailFile = req.files.thumbnail[0];
            const thumbnailName = `subcategory_${Date.now()}${path.extname(thumbnailFile.originalname)}`;
            const thumbnailPath = path.join(subcategoryDir, thumbnailName);

            fs.writeFileSync(thumbnailPath, thumbnailFile.buffer);
            thumbnail = `${process.env.BACKEND_URL}/uploads/subcategories/${thumbnailName}`;
        }

        const subcategory = new Subcategories({
            name,
            categoryId,
            productId: productId || null,
            thumbnail,
            updatedAt: Date.now()
        });

        await subcategory.save();

        res.status(201).json({
            success: true,
            message: 'Subcategory created successfully',
            subcategory
        });

    } catch (error) {
        console.error('Error creating subcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create subcategory',
            error: error.message
        });
    }
};

// GET featured products
const getFeaturedProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Strategy: Get products with highest discount
        const featuredProducts = await Product.find({ discount: { $gt: 0 } })
            .populate('category', 'name thumbnail')
            .populate('subcategory', 'name thumbnail')
            .limit(parseInt(limit))
            .sort({ discount: -1, createdAt: -1 });

        res.status(200).json({
            success: true,
            products: featuredProducts
        });

    } catch (error) {
        console.error('Error fetching featured products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured products',
            error: error.message
        });
    }
};

// GET newest products
const getNewestProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get most recently added products
        const newestProducts = await Product.find()
            .populate('category', 'name thumbnail')
            .populate('subcategory', 'name thumbnail')
            .limit(parseInt(limit))
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            products: newestProducts
        });

    } catch (error) {
        console.error('Error fetching newest products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch newest products',
            error: error.message
        });
    }
};

// GET best selling products
const getBestSellingProducts = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // This would typically require sales/order data
        // For now, we'll simulate by using a random selection of products
        // In a real application, you would query based on order quantities

        const products = await Product.aggregate([
            { $sample: { size: parseInt(limit) } }
        ]);

        // Populate the sample with category and subcategory
        const populatedProducts = await Product.populate(products, [
            { path: 'category', select: 'name thumbnail' },
            { path: 'subcategory', select: 'name thumbnail' }
        ]);

        res.status(200).json({
            success: true,
            products: populatedProducts
        });

    } catch (error) {
        console.error('Error fetching best selling products:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch best selling products',
            error: error.message
        });
    }
};

// GET unique brands
const getAllBrands = async (req, res) => {
    try {
        const brands = await Product.aggregate([
            { $group: { _id: "$brand" } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, brand: "$_id" } }
        ]);

        res.status(200).json({
            success: true,
            brands: brands.map(item => item.brand)
        });

    } catch (error) {
        console.error('Error fetching brands:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch brands',
            error: error.message
        });
    }
};

// DELETE category
const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if category exists
        const category = await Categories.findById(id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Check if category is used by any products
        const productsUsingCategory = await Product.countDocuments({ category: id });
        if (productsUsingCategory > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete category. It is being used by ${productsUsingCategory} products.`
            });
        }

        // Delete associated subcategories
        await Subcategories.deleteMany({ categoryId: id });

        // Delete category thumbnail if exists
        if (category.thumbnail) {
            const thumbnailPath = category.thumbnail.replace(process.env.BACKEND_URL, '').trim();
            if (fs.existsSync(path.join(process.cwd(), thumbnailPath))) {
                fs.unlinkSync(path.join(process.cwd(), thumbnailPath));
            }
        }

        // Delete category
        await Categories.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Category and associated subcategories deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete category',
            error: error.message
        });
    }
};

// DELETE subcategory
const deleteSubcategory = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if subcategory exists
        const subcategory = await Subcategories.findById(id);
        if (!subcategory) {
            return res.status(404).json({
                success: false,
                message: 'Subcategory not found'
            });
        }

        // Check if subcategory is used by any products
        const productsUsingSubcategory = await Product.countDocuments({ subcategory: id });
        if (productsUsingSubcategory > 0) {
            return res.status(400).json({
                success: false,
                message: `Cannot delete subcategory. It is being used by ${productsUsingSubcategory} products.`
            });
        }

        // Delete subcategory thumbnail if exists
        if (subcategory.thumbnail) {
            const thumbnailPath = subcategory.thumbnail.replace(process.env.BACKEND_URL, '').trim();
            if (fs.existsSync(path.join(process.cwd(), thumbnailPath))) {
                fs.unlinkSync(path.join(process.cwd(), thumbnailPath));
            }
        }

        // Delete subcategory
        await Subcategories.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: 'Subcategory deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting subcategory:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete subcategory',
            error: error.message
        });
    }
};

module.exports = { createProduct, getAllProducts, getProductById, getProductBySlug, updateProduct, deleteProduct, upload, getAllCategories };