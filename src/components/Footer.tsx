import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-black text-white py-24 px-6">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                {/* Brand & Newsletter */}
                <div className="col-span-1 lg:col-span-2">
                    <h2 className="text-4xl md:text-6xl font-bold mb-8">Fast Selling Urban<br />Fashion Collection</h2>
                    <div className="flex items-center gap-4 mb-8">
                        <input 
                            type="email" 
                            placeholder="Send email to us" 
                            className="bg-transparent border-b border-gray-700 py-2 w-64 focus:outline-none focus:border-white transition placeholder-gray-500" 
                        />
                        <button className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                            </svg>
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <p className="text-sm text-gray-500">Follow Us</p>
                        <div className="flex gap-4">
                            <a href="#" className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center hover:bg-white hover:text-black transition">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center hover:bg-white hover:text-black transition">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center hover:bg-white hover:text-black transition">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                                </svg>
                            </a>
                            <a href="#" className="w-8 h-8 rounded-full border border-gray-700 flex items-center justify-center hover:bg-white hover:text-black transition">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
                
                {/* Contact Info */}
                <div>
                    <div className="mb-8">
                        <p className="text-xs text-gray-500 mb-2">LOCATION</p>
                        <p className="text-sm">5567 Washington Ave,<br />America, 32289</p>
                    </div>
                    <div className="mb-8">
                        <p className="text-xs text-gray-500 mb-2">EMAIL</p>
                        <p className="text-sm">hello@orbix.studio</p>
                    </div>
                    <div className="mb-8">
                        <p className="text-xs text-gray-500 mb-2">CALL US</p>
                        <p className="text-sm">+016 76234396</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 mb-2">OPEN TIME</p>
                        <p className="text-sm">08:00 - 11:00 pm</p>
                    </div>
                </div>
                
                {/* Menu Links */}
                <div>
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-xs text-gray-500 mb-4">MENU</p>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition">About</a></li>
                                <li><a href="#" className="hover:text-white transition">Industries</a></li>
                                <li><a href="#" className="hover:text-white transition">Product</a></li>
                                <li><a href="#" className="hover:text-white transition">Categories</a></li>
                            </ul>
                        </div>
                        <div>
                            <p className="text-xs text-gray-500 mb-4">SHOP</p>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><a href="#" className="hover:text-white transition">Jacket</a></li>
                                <li><a href="#" className="hover:text-white transition">Totebag</a></li>
                                <li><a href="#" className="hover:text-white transition">Hat</a></li>
                                <li><a href="#" className="hover:text-white transition">Blouse</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="mt-8">
                        <p className="text-xs text-gray-500 mb-4">CART</p>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li><a href="#" className="hover:text-white transition">Blog</a></li>
                            <li><a href="#" className="hover:text-white transition">Contact</a></li>
                            <li><a href="#" className="hover:text-white transition">Terms</a></li>
                            <li><a href="#" className="hover:text-white transition">Tutorials</a></li>
                        </ul>
                    </div>
                </div>
            </div>
            
            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto mt-24 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                <div className="flex gap-8 mb-4 md:mb-0">
                    <a href="#" className="hover:text-white transition">Terms & Conditions</a>
                    <a href="#" className="hover:text-white transition">Privacy Policy</a>
                </div>
                <p>© 2026 Velour. All rights reserved.</p>
            </div>
        </footer>
    );
};

export default Footer;
