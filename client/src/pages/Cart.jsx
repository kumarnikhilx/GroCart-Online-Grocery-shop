import React, { useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import toast from "react-hot-toast";

const Cart = () => {
    const {
        products,
        currency,
        cartItems,
        setCartItems,
        removeFromCart,
        getCartCount,
        updateCartItem,
        navigate,
        getCartAmount,
        axios,
        user,
    } = useAppContext();
    const [cartArray, setCartArray] = useState([]);
    const [addresses, setAddress] = useState([]);
    const [showAddress, setShowAddress] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const getCart = () => {
        let tempArray = [];
        for (const key in cartItems) {
            const product = products.find((item) => item._id === key);
            product.quantity = cartItems[key];
            tempArray.push(product);
        }
        setCartArray(tempArray);
    };

    const getUserAddresses = async () => {
        try {
            const { data } = await axios.get("/api/address/get");

            if (data.success) {
                setAddress(data.addresses);
                if (data.addresses.length > 0) {
                    setSelectedAddress(data.addresses[0]);
                }
            }
        } catch (error) {
            if (error.response && error.response.data) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        }
    };

    const handleCheckoutClick = () => {
        if (!selectedAddress) {
            toast("Please Select an Address", {
                style: {
                    background: "#2d9cdb",
                    color: "#fff",
                },
            });
            return;
        }
        setShowPaymentModal(true);
    };

    const placeOrder = async (paymentOption) => {
        try {
            setShowPaymentModal(false);
            setLoading(true);

            // Place Order with COD
            if (paymentOption === "COD") {
                const { data } = await axios.post("/api/order/cod", {
                    items: cartArray.map((item) => ({
                        product: item._id,
                        quantity: item.quantity,
                    })),
                    address: selectedAddress._id,
                });

                if (data.success) {
                    toast.success(data.message);
                    setCartItems({});
                    navigate("/my-orders");
                }
            } else {
                // Place order with Razorpay
                const { data } = await axios.post("/api/order/razorpay", {
                    items: cartArray.map((item) => ({
                        product: item._id,
                        quantity: item.quantity,
                    })),
                    address: selectedAddress._id,
                });

                if (data.success) {
                    const options = {
                        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                        amount: data.order.amount,
                        currency: data.order.currency,
                        name: "GroCart",
                        description: "Order Payment",
                        order_id: data.order.id,
                        handler: async (response) => {
                            try {
                                const verifyData = await axios.post("/api/order/verifyRazorpay", response);
                                if (verifyData.data.success) {
                                    toast.success("Payment successful!");
                                    setCartItems({});
                                    navigate("/my-orders");
                                }
                            } catch (error) {
                                toast.error("Payment verification failed");
                                console.error(error);
                            }
                        },
                        prefill: {
                            name: user.name || "Customer",
                            email: user.email || "customer@example.com",
                        },
                        theme: {
                            color: "#00b207",
                        },
                    };

                    const rzp = new window.Razorpay(options);
                    rzp.on("payment.failed", function (response) {
                        toast.error("Payment failed. Please try again.");
                        console.error(response.error);
                    });
                    rzp.open();
                }
            }
        } catch (error) {
            if (error.response && error.response.data) {
                toast.error(error.response.data.message);
            } else {
                toast.error("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (products.length > 0 && cartItems) {
            getCart();
        }
    }, [products, cartItems]);

    useEffect(() => {
        if (user) {
            getUserAddresses();
        }
    }, [user]);

    return products.length > 0 && Object.keys(cartItems).length > 0 ? (
        <div className="flex flex-col md:flex-row mt-16 pb-16">
            <div className="flex-1 max-w-4xl">
                <h1 className="text-3xl font-medium mb-6">
                    Shopping Cart{" "}
                    <span className="text-sm text-primary">
                        {getCartCount()} Items
                    </span>
                </h1>

                <div className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 text-base font-medium pb-3">
                    <p className="text-left">Product Details</p>
                    <p className="text-center">Subtotal</p>
                    <p className="text-center">Action</p>
                </div>

                {cartArray.map((product, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-[2fr_1fr_1fr] text-gray-500 items-center text-sm md:text-base font-medium pt-3"
                    >
                        <div className="flex items-center md:gap-6 gap-3">
                            <div
                                onClick={() => {
                                    navigate(
                                        `/products/${product.category.toLowerCase()}/${
                                            product._id
                                        }`
                                    );
                                    scrollTo(0, 0);
                                }}
                                className="cursor-pointer w-24 h-24 flex items-center justify-center border border-gray-300 rounded"
                            >
                                <img
                                    className="max-w-full h-full object-cover"
                                    src={product.image[0]}
                                    alt={product.name}
                                />
                            </div>
                            <div>
                                <p className="hidden md:block font-semibold">
                                    {product.name}
                                </p>
                                <div className="font-normal text-gray-500/70">
                                    <p>
                                        Weight:{" "}
                                        <span>{product.weight || "N/A"}</span>
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p>Qty:</p>
                                        <select
                                            onChange={(e) =>
                                                updateCartItem(
                                                    product._id,
                                                    Number(e.target.value)
                                                )
                                            }
                                            value={cartItems[product._id]}
                                            className="outline-none border rounded border-gray-300 px-1 py-0.5"
                                        >
                                            {Array(
                                                Math.max(cartItems[product._id], 9)
                                            )
                                                .fill("")
                                                .map((_, index) => (
                                                    <option
                                                        key={index}
                                                        value={index + 1}
                                                    >
                                                        {index + 1}
                                                    </option>
                                                ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="text-center">
                            {currency}
                            {parseFloat(
                                (product.offerPrice * product.quantity).toFixed(
                                    2
                                )
                            )}
                        </p>
                        <button
                            onClick={() => removeFromCart(product._id)}
                            className="cursor-pointer mx-auto"
                        >
                            <img
                                src={assets.remove_icon}
                                alt="remove"
                                className="inline-block w-6 h-6 hover:opacity-75 transition-opacity"
                            />
                        </button>
                    </div>
                ))}

                <button
                    onClick={() => {
                        navigate("/products");
                        scrollTo(0, 0);
                    }}
                    className="group cursor-pointer flex items-center mt-8 gap-2 text-primary font-medium"
                >
                    <img
                        className="group-hover:-translate-x-1 transition"
                        src={assets.arrow_right_icon_colored}
                        alt="arrow"
                        style={{ transform: "rotate(180deg)" }}
                    />
                    Continue Shopping
                </button>
            </div>

            <div className="max-w-[360px] w-full bg-gray-100/40 p-5 max-md:mt-16 border border-gray-300/70 shrink-0">
                <h2 className="text-xl md:text-xl font-medium">
                    Order Summary
                </h2>
                <hr className="border-gray-300 my-5" />

                <div className="mb-6">
                    <p className="text-sm font-medium uppercase">
                        Delivery Address
                    </p>
                    <div className="relative flex justify-between items-start mt-2">
                        <p className="text-gray-500 text-sm">
                            {selectedAddress
                                ? `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.country}`
                                : "No address found"}
                        </p>
                        <button
                            onClick={() => setShowAddress(!showAddress)}
                            className="text-primary hover:underline cursor-pointer ml-4 shrink-0 text-sm"
                        >
                            Change
                        </button>
                        {showAddress && (
                            <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 text-sm w-full z-10 shadow-lg max-h-48 overflow-y-auto">
                                {addresses.map((address, index) => (
                                    <p
                                        key={index}
                                        onClick={() => {
                                            setSelectedAddress(address);
                                            setShowAddress(false);
                                        }}
                                        className="text-gray-500 p-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-none"
                                    >
                                        {address.street}, {address.city},{" "}
                                        {address.state}, {address.country}
                                    </p>
                                ))}
                                <p
                                    onClick={() => navigate("/add-address")}
                                    className="text-primary text-center cursor-pointer p-2 hover:bg-primary/10 font-medium"
                                >
                                    + Add New Address
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <hr className="border-gray-300" />

                <div className="text-gray-500 mt-4 space-y-2">
                    <p className="flex justify-between">
                        <span>Price</span>
                        <span>
                            {currency}
                            {getCartAmount()}
                        </span>
                    </p>
                    <p className="flex justify-between">
                        <span>Shipping Fee</span>
                        <span className="text-green-600 font-medium">Free</span>
                    </p>
                    <p className="flex justify-between">
                        <span>Tax (2%)</span>
                        <span>
                            {currency}
                            {parseFloat(
                                ((getCartAmount() * 2) / 100).toFixed(2)
                            )}
                        </span>
                    </p>
                    <p className="flex justify-between text-lg font-bold text-gray-800 mt-3 pt-3 border-t border-gray-300">
                        <span>Total Amount:</span>
                        <span>
                            {currency}
                            {parseFloat(
                                (
                                    getCartAmount() +
                                    (getCartAmount() * 2) / 100
                                ).toFixed(2)
                            )}
                        </span>
                    </p>
                </div>

                {user ? (
                    <button
                        onClick={handleCheckoutClick}
                        disabled={loading}
                        className={`w-full py-3 mt-6 cursor-pointer bg-primary text-white font-medium hover:bg-primary-dull transition ${
                            loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                    >
                        {loading ? "Processing..." : "Proceed to Checkout"}
                    </button>
                ) : (
                    <button
                        disabled
                        className="w-full py-3 mt-6 bg-gray-300 text-gray-600 font-medium cursor-not-allowed"
                    >
                        Login to proceed
                    </button>
                )}
            </div>

            {/* Payment Modal Override */}
            {showPaymentModal && (
                <div
                    onClick={() => setShowPaymentModal(false)}
                    className="fixed inset-0 z-50 flex justify-center items-center bg-black/50 backdrop-blur-sm p-4"
                >
                    <div
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white p-6 max-w-sm w-full shadow-2xl rounded-lg"
                    >
                        <h3 className="text-xl font-semibold mb-4 text-center">
                            Select Payment Method
                        </h3>
                        <p className="text-center text-gray-500 mb-6 text-sm">
                            How would you like to pay for your order?
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => placeOrder("Online")}
                                className="w-full bg-[#1A8BEF] hover:bg-[#1A8BEF]/90 text-white font-medium py-3 rounded-md transition shadow flex items-center justify-center gap-2 cursor-pointer"
                            >
                                Pay Online (Razorpay)
                            </button>
                            
                            <div className="relative py-2 flex items-center justify-center">
                                <hr className="w-full border-gray-200" />
                                <span className="absolute bg-white px-2 text-xs text-gray-400">
                                    OR
                                </span>
                            </div>

                            <button
                                onClick={() => placeOrder("COD")}
                                className="w-full bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white font-medium py-2.5 rounded-md transition cursor-pointer"
                            >
                                Cash on Delivery (COD)
                            </button>
                        </div>
                        
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="w-full mt-4 py-2 text-gray-500 hover:text-gray-800 text-sm cursor-pointer underline underline-offset-2"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    ) : (
        <div className="mt-16 text-center text-gray-500">
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Your cart is empty.</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <button
                onClick={() => {
                    navigate("/products");
                    scrollTo(0, 0);
                }}
                className="mt-6 mx-auto cursor-pointer bg-primary px-6 py-2 text-white font-medium rounded hover:bg-primary-dull transition"
            >
                Start Shopping
            </button>
        </div>
    );
};

export default Cart;
