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

function DropMyMenu(){

    return(
        <div style={{position:"fixed", left:"1%", top:"2%"}}>
        <DropdownMenu>
          <DropdownMenuTrigger style={{fontSize:"135%", color:"white"}} className="bg-indigo-500">Navigation Menu</DropdownMenuTrigger>
          <DropdownMenuContent style={{fontSize:"125%" }}  className="bg-indigo-300">
              <DropdownMenuItem  className="bg-indigo-300">
                <Button style={{fontSize:"120%" }} variant="secondary"  className="bg-indigo-500">
                  <Link style={{color:"white"}} to="/Locations">Locations</Link>
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem  className="bg-indigo-300">
                <Button style={{fontSize:"120%" }} variant="secondary"  className="bg-indigo-500">
                  <Link style={{color:"white"}} to="/Dashboard/YOW">Dashboard</Link>
                </Button>
              </DropdownMenuItem>
              <DropdownMenuItem  className="bg-indigo-300">
                <Button style={{fontSize:"120%" }} variant="secondary"  className="bg-indigo-500">
                  <Link style={{color:"white"}} to="/">Sign Out</Link>
                </Button>
              </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
}

export default DropMyMenu;