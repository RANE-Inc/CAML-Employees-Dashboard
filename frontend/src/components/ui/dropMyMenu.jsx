import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "./dropdown-menu";
import { Button } from "./button";
import {Link} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
function DropMyMenu() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
      try {
          // Call the backend logout endpoint to clear cookies
          await axios.post('http://localhost:4000/logout'); 

          // Redirect user to the login or home page after logging out
          navigate('/');
      } catch (error) {
          console.error("Error logging out:", error);
      }
  };

  return (
      <div style={{ position: "fixed", left: "1%", top: "2%" }}>
          <DropdownMenu>
              <DropdownMenuTrigger style={{ fontSize: "135%", color: "white" }} className="bg-amber-600">
                  Navigation Menu
              </DropdownMenuTrigger>
              <DropdownMenuContent style={{ fontSize: "125%" }} className="bg-amber-400">
                  <DropdownMenuItem className="bg-amber-300">
                      <Button style={{ fontSize: "120%" }} variant="secondary" className="w-[110px] bg-amber-600">
                          <Link style={{ color: "white" }} to="/Locations">Locations</Link>
                      </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="bg-amber-300">
                      <Button style={{ fontSize: "120%" }} variant="secondary" className="w-[110px] bg-amber-600">
                          <Link style={{ color: "white" }} to="/Dashboard/YOW">Dashboard</Link>
                      </Button>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="bg-amber-300">
                      <Button style={{ fontSize: "120%" }} variant="secondary" className="w-[110px] bg-amber-600">
                          <Link style={{ color: "white" }} to="/AdminDashboard">Admin</Link>
                      </Button>
                  </DropdownMenuItem>
                  {/* Sign-out Button */}
                  <DropdownMenuItem className="bg-amber-300">
                      <Button 
                          style={{ fontSize: "120%", color:"White" }} 
                          variant="secondary"  
                          className="w-[110px] bg-amber-600"
                          onClick={handleSignOut} // Call the sign-out function
                      >
                          Sign Out
                      </Button>
                  </DropdownMenuItem>
              </DropdownMenuContent>
          </DropdownMenu>
      </div>
  );
}

export default DropMyMenu;