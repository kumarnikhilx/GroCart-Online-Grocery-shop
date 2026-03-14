import React from "react";
import { assets } from "../assets/assets";

const About = () => {
    return (
        <div className="mt-10 mb-20">
            <h1 className="text-3xl sm:text-4xl text-center font-bold text-gray-800 mb-10">
                <span className="text-primary text-gray-500">About</span> Grocart
            </h1>
            
            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="flex-1 w-full flex justify-center">
                   <div className="relative w-full max-w-md aspect-square bg-green-50 rounded-full flex items-center justify-center p-8 overflow-hidden shdaow-sm border border-green-100">
                      <img src={assets.logo} alt="Grocart Logo" className="w-[80%] h-auto object-contain z-10" />
                   </div>
                </div>
                
                <div className="flex-1 text-gray-600 text-lg md:text-xl leading-relaxed space-y-6">
                    <p>
                        Welcome to <span className="font-semibold text-primary text-gray-800">Grocart</span>, your number one source for all things grocery. We're dedicated to providing you the very best of products, with an emphasis on freshness, quality, and quick delivery.
                    </p>
                    <p>
                        Founded with a passion for bringing farm-fresh produce and daily essentials directly to your doorstep, Grocart has come a long way from its beginnings. We now serve customers all over the city and are thrilled that we're able to turn our passion into this website.
                    </p>
                    <p>
                        We hope you enjoy our products as much as we enjoy offering them to you. If you have any questions or comments, please don't hesitate to contact us.
                    </p>
                    <div className="pt-4">
                        <p className="font-medium text-gray-800">Sincerely,</p>
                        <p className="font-bold text-primary">The Grocart Team</p>
                    </div>
                </div>
            </div>

            <div className="mt-24">
                <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-12">Why Choose Us?</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 transition-transform duration-300 hover:-translate-y-2">
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                           <img src={assets.delivery_truck_icon} className="w-8 h-8 opacity-80" alt="fast delivery"/>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Fast Delivery</h3>
                        <p className="text-gray-600">We ensure your groceries reach you in the shortest possible time.</p>
                    </div>
                    
                    <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 transition-transform duration-300 hover:-translate-y-2">
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                           <img src={assets.leaf_icon} className="w-8 h-8 opacity-80" alt="freshness"/>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Freshness Guaranteed</h3>
                        <p className="text-gray-600">Directly from farms to your doorstep, ensuring maximum freshness.</p>
                    </div>

                    <div className="bg-white p-8 rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.05)] border border-gray-100 transition-transform duration-300 hover:-translate-y-2">
                        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                           <img src={assets.coin_icon} className="w-8 h-8 opacity-80" alt="best prices"/>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-3">Best Prices</h3>
                        <p className="text-gray-600">Enjoy premium quality products at affordable and competitive prices.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;
