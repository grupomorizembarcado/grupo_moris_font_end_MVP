import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaWarehouse, 
  FaIndustry, 
  FaBell, 
  FaChartBar 
} from 'react-icons/fa';

const Nav = () => {
  const navItems = [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/galpoes', icon: <FaWarehouse />, label: 'Galpões' },
    { path: '/silos', icon: <FaIndustry />, label: 'Silos' },
    { path: '/alertas', icon: <FaBell />, label: 'Alertas' },
    { path: '/relatorios', icon: <FaChartBar />, label: 'Relatórios' }
  ];

  return (
    <nav className="sidebar">
      <ul className="nav-list">
        {navItems.map((item) => (
          <li key={item.path} className="nav-item">
            <NavLink
              to={item.path}
              className={({ isActive }) => 
                `nav-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Nav;