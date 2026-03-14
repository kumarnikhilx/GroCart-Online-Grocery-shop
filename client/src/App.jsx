import React from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Footer from "./components/Footer";
import { useAppContext } from "./context/AppContext";
import Login from "./components/Login";
import AllProducts from "./pages/AllProducts";
import ProductCategory from "./pages/ProductCategory";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import AddAddress from "./pages/AddAddress";
import MyOrders from "./pages/MyOrders";
import SellerLogin from "./components/seller/SellerLogin";
import SellerLayout from "./pages/seller/SellerLayout";
import AddProduct from "./pages/seller/AddProduct";
import ProductList from "./pages/seller/ProductList";
import Orders from "./pages/seller/Orders";
import Loading from "./components/Loading";
import NotFoundPage from "./pages/NotFoundPage";
import About from "./pages/About";
import VoiceAssistant from "./components/VoiceAssistant";

const App = () => {
    const isSellerPath = useLocation().pathname.includes("seller");
    const { showUserLogin, seller } = useAppContext();

    return (
        <div className="text-default min-h-screen text-gray-800 bg-[#fbf9ff] relative overflow-hidden">
            {/* Soft, beautiful multi-colored background blobs matching the reference image */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blob-purple rounded-full mix-blend-multiply opacity-60 filter blur-[120px] animate-pulse pointer-events-none"></div>
            <div className="absolute top-[20%] right-[-5%] w-[30rem] h-[30rem] bg-blob-pink rounded-full mix-blend-multiply opacity-50 filter blur-[140px] animate-pulse pointer-events-none" style={{animationDelay: "2s"}}></div>
            <div className="absolute bottom-[-10%] left-[20%] w-[35rem] h-[35rem] bg-blob-orange rounded-full mix-blend-multiply opacity-50 filter blur-[160px] animate-pulse pointer-events-none" style={{animationDelay: "4s"}}></div>
            <div className="absolute top-[60%] right-[15%] w-80 h-80 bg-blob-purple rounded-full mix-blend-multiply opacity-40 filter blur-[100px] animate-pulse pointer-events-none"></div>

            <div className="relative z-10 w-full min-h-screen flex flex-col pt-4"> {/* Added padding top so navbar can float */}
                {isSellerPath ? null : <Navbar />}
                {showUserLogin ? <Login /> : null}

            <Toaster />

            <div
                className={`${
                    isSellerPath ? "" : "px-6 md:px-16 lg:px-24 xl:px-32"
                }`}
            >
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/products" element={<AllProducts />} />
                    <Route
                        path="/products/:category"
                        element={<ProductCategory />}
                    />
                    <Route
                        path="/products/:category/:id"
                        element={<ProductDetails />}
                    />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/add-address" element={<AddAddress />} />
                    <Route path="/my-orders" element={<MyOrders />} />
                    <Route path="/loader" element={<Loading />} />
                    <Route
                        path="/seller"
                        element={
                            seller ? (
                                <SellerLayout />
                            ) : (
                                <Navigate to="/seller-login" />
                            )
                        }
                    >
                        <Route index element={<AddProduct />} />
                        <Route path="product-list" element={<ProductList />} />
                        <Route path="orders" element={<Orders />} />
                    </Route>
                    <Route path="/seller-login" element={<SellerLogin />} />
                    <Route path="/*" element={<NotFoundPage />} />
                </Routes>
            </div>
            {!isSellerPath && <VoiceAssistant />}
            {!isSellerPath && <Footer />}
            </div>
        </div>
    );
};

export default App;
