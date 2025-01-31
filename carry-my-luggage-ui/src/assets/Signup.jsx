import React from 'react';
import {Link} from 'react-router-dom';
import{ useState } from 'react';
import { Button } from "../components/ui/button";


function Signup(){

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [pwConfirm,setPwConfirm] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
    }

    return(
        <div style={{fontFamily:'Kanit', position:"fixed", top:"20%", left:'37%'}}>
            <div style={{fontSize:"250%"}}>
                Welcome To
            </div>
            <div style={{fontSize:"250%"}}>
                CAML Autonomous Mobility Lift
            </div>

            <form className="grid grid-cols-1" style={{paddingTop:'5%'}} onSubmit={handleSubmit}>
                <div style={{paddingTop:'5%'}}>
                <input style={{fontSize:'140%'}} className='bg-amber-200' type='text' value={username} onChange={(e) => setUsername(e.target.value)}
                    placeholder='Username'
                />
                </div>

                <div style={{paddingTop:'7%'}}>
                <input style={{fontSize:'140%'}} className='bg-amber-200' type='text' value={password} onChange={(e) => setPassword(e.target.value)} 
                    placeholder='Password'
                />
                </div>

                <div style={{paddingTop:'3%'}}>
                <input style={{fontSize:'140%'}} className='bg-amber-200' type='text' value={pwConfirm} onChange={(e) => setPwConfirm(e.target.value)} 
                    placeholder='Confirm Password'
                />
                </div>

                <div style={{paddingTop:'8%'}}>
                <Button style={{fontSize:'150%'}} variant="secondary"  className="bg-amber-600" type='submit'>
                    <Link style={{color:"white"}} to='/Locations'>Sign Up</Link>
                </Button>
                </div>
            </form>

        </div>
    );
}

export default Signup;