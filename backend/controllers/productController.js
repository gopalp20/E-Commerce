const prisma = require("../config/prisma");

const createProduct = async (req, res) => {
    try {

        const {
            name,
            description,
            price,
            stock,
            imageUrl,
            categoryId
        } = req.body;

        if (!name || !description || !price || stock == null || !categoryId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        const category = await prisma.category.findUnique({
            where: {
                id: Number(categoryId)
            }
        });

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found"
            });
        }

        const product = await prisma.product.create({
            data: {
                name,
                description,
                price,
                stock,
                imageUrl,
                vendorId: req.user.id,
                categoryId: Number(categoryId)
            }
        });

        res.status(201).json({
            success: true,
            product
        });

    } catch (error) {
        console.log(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};

const getProducts = async (req, res) => {
    try {
        const { categoryId } = req.query;

        const products = await prisma.product.findMany({
            where: categoryId
                ? { categoryId: Number(categoryId) }
                : {},
            include: {
                vendor: true,
                category: true,
            },
        });

        res.status(200).json({
            success: true,
            products,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

const getProduct = async (req, res) => {

    try {

        const product = await prisma.product.findUnique({
            where:{
                id:Number(req.params.id)
            },
            include:{
                vendor:true,
                category:true
            }
        });

        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found"
            });
        }

        res.status(200).json({
            success:true,
            product
        });

    } catch(error){

        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        });

    }

};
const updateProduct = async (req, res) => {
    try {

        const product = await prisma.product.findUnique({
            where: {
                id: Number(req.params.id)
            }
        });

        if (!product) {
            return res.status(404).json({
                success: false,
                message: "Product not found"
            });
        }

        // Only owner or admin can update
        if (
            req.user.role !== "ADMIN" &&
            product.vendorId !== req.user.id
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const {
            name,
            description,
            price,
            stock,
            imageUrl,
            categoryId
        } = req.body;

        // If category is being changed, verify it exists
        if (categoryId) {

            const category = await prisma.category.findUnique({
                where: {
                    id: Number(categoryId)
                }
            });

            if (!category) {
                return res.status(404).json({
                    success: false,
                    message: "Category not found"
                });
            }

        }

        const updatedProduct = await prisma.product.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(price !== undefined && { price }),
                ...(stock !== undefined && { stock }),
                ...(imageUrl !== undefined && { imageUrl }),
                ...(categoryId !== undefined && {
                    categoryId: Number(categoryId)
                })
            }
        });

        res.status(200).json({
            success: true,
            message: "Product updated successfully",
            product: updatedProduct
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};
const deleteProduct = async (req,res)=>{

    try{

        const product = await prisma.product.findUnique({
            where:{
                id:Number(req.params.id)
            }
        });

        if(!product){
            return res.status(404).json({
                success:false,
                message:"Product not found"
            });
        }

        if(req.user.role !== "ADMIN" && product.vendorId !== req.user.id){
            return res.status(403).json({
                success:false,
                message:"Access denied"
            });
        }

        await prisma.product.delete({
            where:{
                id:Number(req.params.id)
            }
        });

        res.status(200).json({
            success:true,
            message:"Product deleted successfully"
        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:"Internal Server Error"
        });

    }

};

module.exports = {
    createProduct,
    getProducts,
    getProduct,
    updateProduct,
    deleteProduct
};