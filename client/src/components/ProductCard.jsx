import React from "react";
import { assets } from "../assets/assets";
import { useAppContext } from "../context/AppContext";

const ProductCard = ({ product }) => {
    const { currency, addToCart, removeFromCart, cartItems, navigate } =
        useAppContext();

    return (
        product && (
            <div
                onClick={() => {
                    navigate(
                        `/products/${product.category.toLowerCase()}/${product._id}`
                    );
                    scrollTo(0, 0);
                }}
                className="group border border-gray-100/50 rounded-3xl px-4 py-4 bg-white/70 backdrop-blur-sm shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg cursor-pointer"
            >
                <div className="group cursor-pointer flex items-center justify-center w-full h-40 sm:h-48 md:h-52 mb-3 overflow-hidden">
                    <img
                        className="group-hover:scale-105 transition w-full h-full object-contain"
                        src={product.image[0]}
                        alt={product.name}
                    />
                </div>
                <div className="text-gray-500/60 text-sm">
                    <p>{product.category}</p>
                    <p className="text-gray-700 font-medium text-lg truncate w-full">
                        {product.name}
                    </p>
                    <div className="flex items-center gap-0.5">
                        {Array(5)
                            .fill("")
                            .map((_, i) => (
                                <img
                                    key={i}
                                    className="md:w-3 w-3"
                                    src={
                                        i < 4
                                            ? assets.star_icon
                                            : assets.star_dull_icon
                                    }
                                    alt="star"
                                />
                            ))}
                        <p>({4})</p>
                    </div>
                    <div className="flex items-end justify-between mt-3">
                        <p className="md:text-xl text-base font-medium text-primary">
                            {currency}
                            {product.offerPrice}{" "}
                            <span className="text-gray-500/60 md:text-sm text-xs line-through">
                                {currency}
                                {product.price}
                            </span>
                        </p>
                        <div
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                            className="text-primary"
                        >
                            {!cartItems[product._id] ? (
                                <button
                                    className="flex items-center justify-center gap-1.5 bg-gray-900 text-white hover:bg-black transition-colors md:w-[90px] w-[74px] h-[36px] rounded-full cursor-pointer text-sm font-medium"
                                    onClick={() => addToCart(product._id)}
                                >
                                    <img
                                        src={assets.cart_icon}
                                        alt="cart_icon"
                                        className="w-3.5 h-3.5 invert brightness-0"
                                    />
                                    Add
                                </button>
                            ) : (
                                <div className="flex items-center justify-center gap-2 md:w-24 w-20 h-[36px] bg-gray-900 text-white rounded-full select-none font-medium">
                                    <button
                                        onClick={() => {
                                            removeFromCart(product._id);
                                        }}
                                        className="cursor-pointer text-md px-2 h-full hover:text-gray-300"
                                    >
                                        -
                                    </button>
                                    <span className="w-4 text-center text-sm">
                                        {cartItems[product._id]}
                                    </span>
                                    <button
                                        onClick={() => addToCart(product._id)}
                                        className="cursor-pointer text-md px-2 h-full hover:text-gray-300"
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    );
};

export default ProductCard;
