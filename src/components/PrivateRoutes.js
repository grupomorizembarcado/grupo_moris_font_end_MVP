import Header from "./Header";
import Nav from "./Nav";

const PrivateLayout = ({ children }) => {
  return (
    <div className="app-container">
      <Header />
      <div className="main-layout">
        <Nav />
        {children}
      </div>
    </div>
  );
};

export default PrivateLayout;
