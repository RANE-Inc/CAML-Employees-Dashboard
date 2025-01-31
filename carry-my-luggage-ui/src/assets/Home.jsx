import React from 'react';
import {Link} from 'react-router-dom';
import { Button } from "../components/ui/button";


function Home(){
    return(
        <div style={{fontFamily:'Kanit', position:"fixed", top:"20%", left:'37%'}}>
            <div style={{fontSize:"250%"}}>
                Welcome To
            </div>
            <div style={{fontSize:"250%"}}>
                CAML Autonomous Mobility Lift  
            </div>
            <div className="grid grid-cols-1" style={{paddingTop:'15%'}}>
                <div style={{paddingTop:'5%'}}>
                <Button style={{fontSize:'150%'}} variant="secondary"  className="bg-amber-600">
                    <Link style={{color:"white"}} to="/Login">Login</Link>
                </Button>
                </div>
                <div style={{paddingTop:'5%'}}>
                <Button style={{fontSize:'150%'}} variant="secondary"  className="bg-amber-600">
                    <Link style={{color:"white"}} to="/Signup">Sign Up</Link>
                </Button>
                </div>
            </div>
        </div>
    );
}

export default Home;