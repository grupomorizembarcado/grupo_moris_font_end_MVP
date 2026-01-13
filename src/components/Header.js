import React from 'react';
import { FaUserCircle } from 'react-icons/fa';

const Header = () => {
  return (
    <header className="header">
      <div className="header-logo">Grupo Moriz</div>
      <div className="header-avatar">
        <FaUserCircle />
      </div>
    </header>
  );
};

export default Header;