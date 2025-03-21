import React, { useState } from 'react'
import * as ROSLIB from '../../RosLib.js'

const [status, setStatus] = useState('Not connected');
const ros = new ROSLIB.Ros({encoding: 'ascii'});

function ConnectROS(){
    ros.connect("ws://localhost:9090")

    ros.on('error', function (error) {
        console.log(error)
        setStatus(error)
      })

      // Find out exactly when we made a connection.
      ros.on('connection', function () {
        console.log('Connected!')
        setStatus('Connected!')
      })

      ros.on('close', function () {
        console.log('Connection closed')
        setStatus('Connection closed')
      })

    return(
        <div>
            {status}
        </div>
    );
}

export default ConnectROS;