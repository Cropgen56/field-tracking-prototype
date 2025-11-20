import React from 'react';

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-dark-green border-b border-light-green">
      <div className="text-xl font-bold">CropGen</div>
      <ul className="flex space-x-6">
        <li>Dashboard</li>
        <li>Farmers</li>
        <li>Blog</li>
        <li>Crop</li>
        <li>Organization</li>
      </ul>
      <div className="w-8 h-8 bg-gray-500 rounded-full"></div> {/* User icon placeholder */}
    </nav>
  );
};

export default Navbar;