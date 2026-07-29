import { useState } from "react";


function ImageUpload(){

    const [image,setImage] = useState(null);

    const [preview,setPreview] = useState(null);

    const [result,setResult] = useState(null);

    const [loading,setLoading] = useState(false);



    const handleImageChange = (event)=>{


        const file = event.target.files[0];


        if(!file){
            return;
        }


        setImage(file);


        setPreview(
            URL.createObjectURL(file)
        );


        setResult(null);

    };




    const uploadImage = async()=>{


        if(!image){

            alert(
                "Please select an image first"
            );

            return;

        }


        try{


            setLoading(true);


            const formData = new FormData();


            formData.append(
                "file",
                image
            );



            const response = await fetch(

                "http://127.0.0.1:8000/api/upload",

                {

                    method:"POST",

                    body:formData

                }

            );



            const data = await response.json();



            console.log(data);



            setResult(data);



        }

        catch(error){

            console.error(
                "Upload failed:",
                error
            );

        }


        finally{

            setLoading(false);

        }


    };





    return(


        <div className="p-8">


            <h2 className="text-2xl font-bold mb-5">

                Upload Food Image

            </h2>



            <input

                type="file"

                accept="image/*"

                onChange={handleImageChange}

            />





            {
                preview &&

                <div className="mt-5">

                    <img

                    src={preview}

                    alt="preview"

                    className="w-64 rounded"

                    />

                </div>

            }





            <button


                onClick={uploadImage}


                className="bg-green-600 text-white px-5 py-2 rounded mt-5"


            >

                {
                    loading
                    ?
                    "Uploading..."
                    :
                    "Upload Image"
                }


            </button>





            {

                result &&


                <div className="mt-6 bg-gray-100 p-5 rounded">


                    <h3 className="font-bold">

                        Upload Result

                    </h3>



                    <p>

                    File:
                    {result.filename}

                    </p>



                    <p>

                    Type:
                    {result.content_type}

                    </p>



                    <p>

                    Dimensions:
                    {result.width}
                    x
                    {result.height}

                    </p>



                    <p>

                    {result.message}

                    </p>


                </div>

            }


        </div>


    );


}


export default ImageUpload;