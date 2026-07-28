const prisma = require("../config/prisma");

// Customer applies to become vendor
const applyVendor = async (req, res) => {
    try {

        if (req.user.role !== "CUSTOMER") {
            return res.status(400).json({
                success: false,
                message: "Only customers can apply"
            });
        }

        if (req.user.vendorRequest) {
            return res.status(400).json({
                success: false,
                message: "Vendor request already submitted"
            });
        }

        await prisma.user.update({
            where: {
                id: req.user.id
            },
            data: {
                vendorRequest: true
            }
        });

        res.status(200).json({
            success: true,
            message: "Vendor request submitted successfully"
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};

// Admin views all pending requests
const getVendorRequests = async (req, res) => {

    try {

        const requests = await prisma.user.findMany({
            where: {
                vendorRequest: true,
                role: "CUSTOMER"
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true
            }
        });

        res.status(200).json({
            success: true,
            requests
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

// Admin approves vendor
const approveVendor = async (req, res) => {

    try {

        const user = await prisma.user.findUnique({
            where: {
                id: Number(req.params.id)
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (!user.vendorRequest) {
            return res.status(400).json({
                success: false,
                message: "No pending vendor request"
            });
        }

        const updatedUser = await prisma.user.update({
            where: {
                id: Number(req.params.id)
            },
            data: {
                role: "VENDOR",
                vendorRequest: false
            }
        });

        res.status(200).json({
            success: true,
            message: "Vendor approved successfully",
            user: updatedUser
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }

};

module.exports = {
    applyVendor,
    getVendorRequests,
    approveVendor
};