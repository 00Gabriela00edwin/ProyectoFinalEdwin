import { Link } from "react-router-dom";
import CartWidget from "./CartWidget";
import logo from "../assets/logo.png";

const NavBar = () => {
  return (
    <header>
      <nav>
       
<Link to="/" className="logo" style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "black" }}>
  <img 
    src={logo} 
    alt="Logo AYG Bombillas" 
    style={{ width: "100px", height: "auto", marginRight: "1px" }} 
  />
</Link>



        <ul>
          <li><Link to="/category/alpaca">Alpaca</Link></li>
          <li><Link to="/category/bronce">Bronce</Link></li>
      
        </ul>

        <CartWidget />
      </nav>
    </header>
  );
};

export default NavBar;