import {useEffect,useState} from "react";
import API from "../services/api";


function TestAPI(){

const [message,setMessage]=useState("");

useEffect(()=>{

API.get("/")
.then(res=>{
setMessage(res.data.message)
})

},[])


return(

<h2>
{message}
</h2>

)

}


export default TestAPI;
