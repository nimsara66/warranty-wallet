import React from 'react';
import profileImg from '../assets/defaultimg.png';
import { TbCircleCheckFilled } from "react-icons/tb";
import { RiCloseCircleFill } from "react-icons/ri";

// RiCloseCircleFill

export default function Friend() {
    return (
        <div class="container bcontent">
           
            <div class="card m-auto " >
                <div class="row ">
                    <div class="col-5">
                        <img class="card-img" src={profileImg} alt="Card Image"/>
                    </div>
                    <div class="col-7">
                        <div class="card-body">
                            <h6 class="card-title">Suresh Dasari</h6>
                        
                            <TbCircleCheckFilled size={40} className='clickable cursor-pointer' color={'green'}/>
                            <RiCloseCircleFill size={40}  className='clickable cursor-pointer' color={'red'}/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}