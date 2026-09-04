const API_URL=
    import.meta.env.VITE_API_URL||"http://127.0.0.1:8000";

export const analyzeFoodImage=async(file)=>{
    if(!file){
        throw new Error("No image selected.");
    }

    const formData=new FormData();
    formData.append("file",file);

    const response=await fetch(
        `${API_URL}/api/upload`,
        {
            method:"POST",
            body:formData
        }
    );

    let data;

    try{
        data=await response.json();
    }catch{
        throw new Error(
            "The server returned an invalid response."
        );
    }

    if(!response.ok){
        throw new Error(
            data.detail||"Unable to analyze image."
        );
    }

    return data;
};

export const estimateNutrition=async(
    foodName,
    unit,
    quantity
)=>{
    if(!foodName){
        throw new Error("Food name is required.");
    }

    if(!unit){
        throw new Error("Please select a portion unit.");
    }

    if(!quantity||Number(quantity)<=0){
        throw new Error(
            "Please enter a valid quantity."
        );
    }

    const response=await fetch(
        `${API_URL}/api/nutrition`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                food_name:foodName,
                unit,
                quantity:Number(quantity)
            })
        }
    );

    let data;

    try{
        data=await response.json();
    }catch{
        throw new Error(
            "The server returned an invalid response."
        );
    }

    if(!response.ok){
        throw new Error(
            data.detail||
            "Unable to calculate nutrition."
        );
    }

    return data;
};