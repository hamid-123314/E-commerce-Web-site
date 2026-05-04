import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="brand">
        <Link to="/">Shop SaaS</Link>
      </div>
      <div className="links">
        <Link to="/cart">Cart</Link>
      </div>
    </nav>
  );
}
