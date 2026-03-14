import asyncHandler from "express-async-handler";
import Razorpay from "razorpay";
import crypto from "crypto";
import CustomError from "../utils/CustomError.js";
import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } from "../config/index.js";

//! Place Order COD: /api/order/cod

export const placeOrderCOD = asyncHandler(async (req, res, next) => {
    const { items, address } = req.body;

    if (!address || !items || items.length === 0) {
        return next(new CustomError(400, "Invalid order data"));
    }

    // Calculate Amount Using Items
    let amount = 0;

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            return next(
                new CustomError(404, `Product not found: ${item.product}`)
            );
        }

        amount += product.offerPrice * item.quantity;
    }

    // Add 2% tax
    const tax = Math.floor(amount * 0.02);
    amount += tax;

    const newOrder = await Order.create({
        userId: req.user._id,
        items,
        amount,
        address,
        paymentType: "COD",
    });

    res.status(201).json({
        success: true,
        message: "Order Placed Successfully",
        newOrder,
    });
});

//! Place Order Razorpay: /api/order/razorpay

export const placeOrderRazorpay = asyncHandler(async (req, res, next) => {
    const { items, address } = req.body;

    if (!address || !items || items.length === 0) {
        return next(new CustomError(400, "Invalid order data"));
    }

    // Calculate Amount Using Items
    let amount = 0;

    for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
            return next(
                new CustomError(404, `Product not found: ${item.product}`)
            );
        }
        amount += product.offerPrice * item.quantity;
    }

    // Add 2% tax
    const tax = Math.floor(amount * 0.02);
    amount += tax;

    const newOrder = await Order.create({
        userId: req.user._id,
        items,
        amount,
        address,
        paymentType: "Online",
    });

    // Razorpay Gateway Initialize
    const razorpayInstance = new Razorpay({
        key_id: RAZORPAY_KEY_ID,
        key_secret: RAZORPAY_KEY_SECRET,
    });

    const options = {
        amount: Math.floor(amount * 100), // amount in smallest currency unit (paise)
        currency: "INR",
        receipt: newOrder._id.toString(),
    };

    const order = await razorpayInstance.orders.create(options);

    res.status(201).json({
        success: true,
        order,
    });
});

//! Verify Razorpay Payment: /api/order/verifyRazorpay

export const verifyRazorpay = asyncHandler(async (req, res, next) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
        // Find order by receipt generated in placeOrderRazorpay
        // Actually, we need the order ID which we saved as receipt
        // Let's get the order details from Razorpay to find the receipt
        const razorpayInstance = new Razorpay({
            key_id: RAZORPAY_KEY_ID,
            key_secret: RAZORPAY_KEY_SECRET,
        });
        
        const rzOrder = await razorpayInstance.orders.fetch(razorpay_order_id);
        const orderId = rzOrder.receipt;

        const order = await Order.findById(orderId);
        if (!order) {
            return next(new CustomError(404, "Order not found"));
        }

        // Mark Payment as Paid
        order.isPaid = true;
        await order.save();

        // Clear user cart
        await User.findByIdAndUpdate(order.userId, { cartItems: {} });

        res.status(200).json({
            success: true,
            message: "Payment verified successfully",
        });
    } else {
        // Signature matching failed
        
        // We could delete the order if we want to reverse it on fail
        // However we don't know the orderId directly from body without fetching
        // We'll leave it as unpaid.
        
        return next(new CustomError(400, "Invalid signature"));
    }
});

//! Get Orders by UserId : /api/order/user

export const getUserOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.find({
        userId: req.user._id,
        $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
        .populate("items.product address")
        .sort({ createdAt: -1 });

    if (!orders) {
        return next(new CustomError(404, "Orders not found"));
    }

    res.status(200).json({
        success: true,
        message: "User orders fetched successfully",
        orders,
    });
});

//! Get All Orders (for seller / admin) : /api/order/seller

export const getAllOrders = asyncHandler(async (req, res, next) => {
    const orders = await Order.find({
        $or: [{ paymentType: "COD" }, { isPaid: true }],
    })
        .populate("items.product address")
        .sort({ createdAt: -1 });

    if (!orders) {
        return next(new CustomError(404, "Orders not found"));
    }

    res.status(200).json({
        success: true,
        message: "All orders fetched successfully",
        orders,
    });
});

//! Delete Order by ID : /api/order/:orderId [DELETE]

export const deleteOrderById = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new CustomError(404, "Order not found"));
    }

    await Order.findByIdAndDelete(orderId);

    res.status(200).json({
        success: true,
        message: "Order deleted successfully",
    });
});

//! Change Order Status: /api/order/:orderId [PATCH]
export const changeOrderStatus = asyncHandler(async (req, res, next) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
        return next(new CustomError(400, "Invalid status"));
    }

    const order = await Order.findById(orderId);

    if (!order) {
        return next(new CustomError(404, "Order not found"));
    }

    await Order.findByIdAndUpdate(orderId, { status });

    res.status(200).json({
        success: true,
        message: "Order status updated successfully",
    });
});
