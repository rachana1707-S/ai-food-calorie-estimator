import {useEffect,useRef,useState} from "react";
import {
    Apple,
    Brain,
    CheckCircle2,
    FolderOpen,
    Image as ImageIcon,
    Loader2,
    PieChart,
    Plus,
    RefreshCw,
    Scale,
    Sparkles,
    Trash2,
    Upload,
    Utensils
} from "lucide-react";
import {
    analyzeFoodImage,
    estimateNutrition
} from "../services/api";
import "./ImageUpload.css";

const MAX_FILE_SIZE=10*1024*1024;

const ALLOWED_FILE_TYPES=[
    "image/jpeg",
    "image/png",
    "image/webp"
];

function ImageUpload(){
    const inputRef=useRef(null);

    const[selectedFile,setSelectedFile]=useState(null);
    const[preview,setPreview]=useState(null);
    const[result,setResult]=useState(null);
    const[selectedUnit,setSelectedUnit]=useState("");
    const[quantity,setQuantity]=useState(1);
    const[mealItems,setMealItems]=useState([]);
    const[loading,setLoading]=useState(false);
    const[nutritionLoading,setNutritionLoading]=useState(false);
    const[error,setError]=useState("");
    const[isDragging,setIsDragging]=useState(false);

    const hasMealItems=mealItems.length>0;
    const isResultMode=Boolean(result)||hasMealItems;

    useEffect(()=>{
        return()=>{
            if(
                preview&&
                !mealItems.some((item)=>item.image===preview)
            ){
                URL.revokeObjectURL(preview);
            }
        };
    },[preview,mealItems]);

    const validateFile=(file)=>{
        if(!ALLOWED_FILE_TYPES.includes(file.type)){
            setError("Please upload a JPG, PNG, or WebP image.");
            return false;
        }

        if(file.size>MAX_FILE_SIZE){
            setError("Image must be smaller than 10MB.");
            return false;
        }

        return true;
    };

    const handleFile=(file)=>{
        if(!file||!validateFile(file)){
            return;
        }

        if(
            preview&&
            !mealItems.some((item)=>item.image===preview)
        ){
            URL.revokeObjectURL(preview);
        }

        setSelectedFile(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
        setSelectedUnit("");
        setQuantity(1);
        setError("");
    };

    const handleFileChange=(event)=>{
        const file=event.target.files[0];

        if(file){
            handleFile(file);
        }

        event.target.value="";
    };

    const handleDragOver=(event)=>{
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave=(event)=>{
        event.preventDefault();
        setIsDragging(false);
    };

    const handleDrop=(event)=>{
        event.preventDefault();
        setIsDragging(false);

        const file=event.dataTransfer.files[0];

        if(file){
            handleFile(file);
        }
    };

    const handleAnalyze=async()=>{
        if(!selectedFile){
            setError("Please select an image first.");
            return;
        }

        try{
            setLoading(true);
            setError("");

            const data=await analyzeFoodImage(selectedFile);

            setResult(data);

            if(data.portion_options?.length){
                const firstUnit=data.portion_options[0].value;

                setSelectedUnit(firstUnit);
                setQuantity(firstUnit==="gram"?100:1);
            }
        }catch(err){
            setError(err.message);
        }finally{
            setLoading(false);
        }
    };

    const handleAddFood=async()=>{
        if(!result){
            return;
        }

        const numericQuantity=Number(quantity);

        if(!selectedUnit){
            setError("Please select a portion unit.");
            return;
        }

        if(!numericQuantity||numericQuantity<=0){
            setError("Please enter a valid quantity.");
            return;
        }

        try{
            setNutritionLoading(true);
            setError("");

            const nutrition=await estimateNutrition(
                result.food,
                selectedUnit,
                numericQuantity
            );

            const mealItem={
                id:crypto.randomUUID(),
                food:result.food,
                confidence:result.confidence,
                image:preview,
                unit:selectedUnit,
                quantity:numericQuantity,
                grams:nutrition.grams,
                nutrition:nutrition.nutrition
            };

            setMealItems((current)=>[
                ...current,
                mealItem
            ]);

            setSelectedFile(null);
            setPreview(null);
            setResult(null);
            setSelectedUnit("");
            setQuantity(1);
        }catch(err){
            setError(err.message);
        }finally{
            setNutritionLoading(false);
        }
    };

    const handleRemoveFood=(id)=>{
        const item=mealItems.find(
            (food)=>food.id===id
        );

        if(item?.image){
            URL.revokeObjectURL(item.image);
        }

        setMealItems((current)=>
            current.filter((food)=>food.id!==id)
        );
    };

    const handleClearMeal=()=>{
        mealItems.forEach((item)=>{
            if(item.image){
                URL.revokeObjectURL(item.image);
            }
        });

        setMealItems([]);
        setSelectedFile(null);
        setPreview(null);
        setResult(null);
        setSelectedUnit("");
        setQuantity(1);
        setError("");
    };

    const handleUnitChange=(unit)=>{
        setSelectedUnit(unit);
        setQuantity(unit==="gram"?100:1);
    };

    const decreaseQuantity=()=>{
        const current=Number(quantity)||0;

        if(selectedUnit==="gram"){
            setQuantity(Math.max(current-10,1));
            return;
        }

        setQuantity(
            Math.max(
                Number((current-0.5).toFixed(1)),
                0.5
            )
        );
    };

    const increaseQuantity=()=>{
        const current=Number(quantity)||0;

        if(selectedUnit==="gram"){
            setQuantity(current+10);
            return;
        }

        setQuantity(
            Number((current+0.5).toFixed(1))
        );
    };

    const mealTotals=mealItems.reduce(
        (totals,item)=>{
            totals.calories+=Number(
                item.nutrition?.calories||0
            );

            totals.protein+=Number(
                item.nutrition?.protein||0
            );

            totals.carbohydrates+=Number(
                item.nutrition?.carbohydrates||0
            );

            totals.fat+=Number(
                item.nutrition?.fat||0
            );

            return totals;
        },
        {
            calories:0,
            protein:0,
            carbohydrates:0,
            fat:0
        }
    );

    return(
        <div className={`app-shell ${isResultMode?"result-mode":""}`}>
            <header className="navbar">
                <div className="nav-brand">
                    <div className="nav-logo">
                        <Apple size={22}/>
                    </div>

                    <div className="nav-title">
                        <h1>
                            AI Calorie Estimator
                        </h1>

                        <span>
                            Food recognition & nutrition
                        </span>
                    </div>
                </div>

                <div className="nav-center">
                    <div className="nav-feature">
                        <Brain size={15}/>
                        AI Recognition
                    </div>

                    <div className="nav-feature">
                        <Scale size={15}/>
                        Portion Aware
                    </div>

                    <div className="nav-feature">
                        <PieChart size={15}/>
                        Meal Tracking
                    </div>
                </div>

                <div className="nav-actions">
                    {mealItems.length>0&&(
                        <div className="nav-meal">
                            <Utensils size={14}/>
                            {mealItems.length}{" "}
                            {mealItems.length===1
                                ?"food"
                                :"foods"}
                        </div>
                    )}

                    <div className="status-badge">
                        <span className="status-dot"></span>
                        AI Online
                    </div>
                </div>
            </header>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                hidden
            />

            {!isResultMode?(
                <main className="landing-page">
                    <section className="intro-section">
                        <div className="intro-left">
                            <div className="intro-label">
                                <Sparkles size={15}/>
                                SMART FOOD ANALYSIS
                            </div>

                            <h2>
                                Calculate nutrition from
                                <span> your food photos.</span>
                            </h2>

                            <p>
                                Upload a food image, let our AI identify
                                what you're eating, then enter the amount
                                you consumed for a more accurate calorie
                                and nutrition estimate.
                            </p>
                        </div>

                        <div className="intro-stats">
                            <Stat
                                icon={<Brain size={19}/>}
                                title="101"
                                text="Food classes"
                            />

                            <Stat
                                icon={<Scale size={19}/>}
                                title="Flexible"
                                text="Portion sizes"
                            />

                            <Stat
                                icon={<Utensils size={19}/>}
                                title="Multiple"
                                text="Foods per meal"
                            />
                        </div>
                    </section>

                    <section className="upload-card">
                        {!preview?(
                            <div
                                className={`drop-zone ${isDragging?"dragging":""}`}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={()=>
                                    inputRef.current?.click()
                                }
                            >
                                <div className="drop-icon">
                                    <ImageIcon size={28}/>
                                </div>

                                <h3>
                                    Upload your food photo
                                </h3>

                                <p>
                                    Drag and drop an image here or browse
                                    from your computer
                                </p>

                                <div className="file-info">
                                    <span>JPG</span>
                                    <span>PNG</span>
                                    <span>WEBP</span>
                                    <span>MAX 10MB</span>
                                </div>

                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={(event)=>{
                                        event.stopPropagation();
                                        inputRef.current?.click();
                                    }}
                                >
                                    <FolderOpen size={16}/>
                                    Choose Image
                                </button>
                            </div>
                        ):(
                            <div className="selected-layout">
                                <div className="selected-preview">
                                    <img
                                        src={preview}
                                        alt="Selected food"
                                    />

                                    <div className="image-badge">
                                        <CheckCircle2 size={14}/>
                                        Image ready
                                    </div>
                                </div>

                                <div className="selected-details">
                                    <div className="selected-icon">
                                        <Sparkles size={21}/>
                                    </div>

                                    <span className="section-label">
                                        READY FOR AI ANALYSIS
                                    </span>

                                    <h3>
                                        Analyze this food
                                    </h3>

                                    <p className="file-name">
                                        {selectedFile?.name}
                                    </p>

                                    <p className="selected-text">
                                        FoodAI will identify the food and
                                        then let you choose slices, pieces,
                                        cups, servings or grams.
                                    </p>

                                    <div className="selected-actions">
                                        <button
                                            type="button"
                                            className="secondary-button"
                                            onClick={()=>
                                                inputRef.current?.click()
                                            }
                                        >
                                            <RefreshCw size={15}/>
                                            Change
                                        </button>

                                        <button
                                            type="button"
                                            className="primary-button no-margin"
                                            onClick={handleAnalyze}
                                            disabled={loading}
                                        >
                                            {loading?(
                                                <>
                                                    <Loader2
                                                        size={15}
                                                        className="spin"
                                                    />
                                                    Analyzing...
                                                </>
                                            ):(
                                                <>
                                                    <Brain size={15}/>
                                                    Analyze Food
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>

                    {error&&(
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <section className="steps-section">
                        <ProcessStep
                            number="01"
                            icon={<Upload size={18}/>}
                            title="Upload"
                            text="Add a clear food photo"
                        />

                        <ProcessStep
                            number="02"
                            icon={<Brain size={18}/>}
                            title="Recognize"
                            text="AI identifies your food"
                        />

                        <ProcessStep
                            number="03"
                            icon={<Scale size={18}/>}
                            title="Set Portion"
                            text="Enter slices, pieces or grams"
                        />

                        <ProcessStep
                            number="04"
                            icon={<PieChart size={18}/>}
                            title="Get Nutrition"
                            text="See calories and macros"
                        />
                    </section>
                </main>
            ):(
                <main className="result-layout">
                    <section className="analysis-panel">
                        <div className="panel-heading">
                            <div>
                                <span className="section-label">
                                    FOOD ANALYSIS
                                </span>

                                <h2>
                                    {result
                                        ?"Review detected food"
                                        :"Add another food"}
                                </h2>
                            </div>
                        </div>

                        {result?(
                            <>
                                <div className="analysis-top">
                                    <div className="food-image-card">
                                        <img
                                            src={preview}
                                            alt="Analyzed food"
                                        />
                                    </div>

                                    <div className="prediction-card">
                                        <div className="prediction-icon">
                                            <Brain size={21}/>
                                        </div>

                                        <span className="section-label">
                                            AI DETECTED
                                        </span>

                                        <h3>
                                            {result.food.replaceAll(
                                                "_",
                                                " "
                                            )}
                                        </h3>

                                        <p>
                                            EfficientNetV2B0 • Food-101
                                        </p>

                                        <div className="confidence">
                                            <span>
                                                Confidence
                                            </span>

                                            <strong>
                                                {result.confidence}%
                                            </strong>
                                        </div>
                                    </div>
                                </div>

                                <div className="portion-card">
                                    <div className="portion-title">
                                        <div>
                                            <span className="section-label">
                                                PORTION SIZE
                                            </span>

                                            <h3>
                                                How much did you eat?
                                            </h3>

                                            <p>
                                                Choose a unit and enter the
                                                amount you consumed.
                                            </p>
                                        </div>

                                        <div className="portion-title-icon">
                                            <Scale size={20}/>
                                        </div>
                                    </div>

                                    <div className="portion-controls">
                                        <div>
                                            <label>
                                                QUANTITY
                                            </label>

                                            <div className="quantity-input">
                                                <button
                                                    type="button"
                                                    onClick={decreaseQuantity}
                                                >
                                                    −
                                                </button>

                                                <input
                                                    type="number"
                                                    min="0.1"
                                                    value={quantity}
                                                    onChange={(event)=>
                                                        setQuantity(
                                                            event.target.value
                                                        )
                                                    }
                                                />

                                                <button
                                                    type="button"
                                                    onClick={increaseQuantity}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label>
                                                UNIT
                                            </label>

                                            <div className="unit-options">
                                                {result.portion_options?.map(
                                                    (option)=>(
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            className={`unit-button ${
                                                                selectedUnit===option.value
                                                                    ?"selected"
                                                                    :""
                                                            }`}
                                                            onClick={()=>
                                                                handleUnitChange(
                                                                    option.value
                                                                )
                                                            }
                                                        >
                                                            {option.label}
                                                        </button>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="portion-bottom">
                                        <div>
                                            <span>
                                                Selected portion
                                            </span>

                                            <strong>
                                                {quantity}{" "}
                                                {formatUnit(
                                                    selectedUnit,
                                                    quantity
                                                )}
                                            </strong>
                                        </div>

                                        <button
                                            type="button"
                                            className="primary-button no-margin"
                                            onClick={handleAddFood}
                                            disabled={
                                                nutritionLoading||
                                                !quantity||
                                                !selectedUnit
                                            }
                                        >
                                            {nutritionLoading?(
                                                <>
                                                    <Loader2
                                                        size={15}
                                                        className="spin"
                                                    />
                                                    Calculating...
                                                </>
                                            ):(
                                                <>
                                                    <Plus size={15}/>
                                                    Add to Meal
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ):(
                            <div className="add-food-card">
                                {preview?(
                                    <>
                                        <img
                                            src={preview}
                                            alt="New food"
                                        />

                                        <div className="add-food-content">
                                            <span className="section-label">
                                                NEW FOOD
                                            </span>

                                            <h3>
                                                Ready to analyze
                                            </h3>

                                            <p>
                                                {selectedFile?.name}
                                            </p>

                                            <div className="selected-actions">
                                                <button
                                                    className="secondary-button"
                                                    type="button"
                                                    onClick={()=>
                                                        inputRef.current?.click()
                                                    }
                                                >
                                                    Change
                                                </button>

                                                <button
                                                    className="primary-button no-margin"
                                                    type="button"
                                                    onClick={handleAnalyze}
                                                    disabled={loading}
                                                >
                                                    {loading?(
                                                        <>
                                                            <Loader2
                                                                size={15}
                                                                className="spin"
                                                            />
                                                            Analyzing...
                                                        </>
                                                    ):(
                                                        <>
                                                            <Brain size={15}/>
                                                            Analyze
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                ):(
                                    <div
                                        className="add-food-empty"
                                        onClick={()=>
                                            inputRef.current?.click()
                                        }
                                    >
                                        <div className="add-food-icon">
                                            <Plus size={24}/>
                                        </div>

                                        <h3>
                                            Add another food
                                        </h3>

                                        <p>
                                            Upload another image to include
                                            it in your meal total.
                                        </p>

                                        <button
                                            type="button"
                                            className="primary-button"
                                        >
                                            <FolderOpen size={15}/>
                                            Choose Image
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {error&&(
                            <div className="error-message result-error">
                                {error}
                            </div>
                        )}
                    </section>

                    <section className="meal-panel">
                        <div className="meal-header">
                            <div>
                                <span className="section-label">
                                    CURRENT MEAL
                                </span>

                                <h2>
                                    Meal Summary
                                </h2>

                                <p>
                                    Combined nutrition for all foods
                                </p>
                            </div>

                            <div className="meal-count">
                                <Utensils size={14}/>
                                {mealItems.length}{" "}
                                {mealItems.length===1
                                    ?"item"
                                    :"items"}
                            </div>
                        </div>

                        {mealItems.length===0?(
                            <div className="empty-meal">
                                <div className="empty-meal-icon">
                                    <Utensils size={25}/>
                                </div>

                                <h3>
                                    Your meal is empty
                                </h3>

                                <p>
                                    Choose your portion and add this
                                    food to see the nutrition summary.
                                </p>
                            </div>
                        ):(
                            <>
                                <div className="meal-items">
                                    {mealItems.map((item)=>(
                                        <div
                                            className="meal-item"
                                            key={item.id}
                                        >
                                            <img
                                                src={item.image}
                                                alt={item.food}
                                            />

                                            <div className="meal-item-info">
                                                <strong>
                                                    {item.food.replaceAll(
                                                        "_",
                                                        " "
                                                    )}
                                                </strong>

                                                <span>
                                                    {item.quantity}{" "}
                                                    {formatUnit(
                                                        item.unit,
                                                        item.quantity
                                                    )}
                                                    {" • "}
                                                    {item.grams}g
                                                </span>
                                            </div>

                                            <div className="meal-item-calories">
                                                <strong>
                                                    {roundValue(
                                                        item.nutrition?.calories
                                                    )}
                                                </strong>

                                                <span>
                                                    kcal
                                                </span>
                                            </div>

                                            <button
                                                type="button"
                                                className="delete-button"
                                                onClick={()=>
                                                    handleRemoveFood(item.id)
                                                }
                                            >
                                                <Trash2 size={15}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="nutrition-summary">
                                    <div className="total-calories">
                                        <div>
                                            <span>
                                                TOTAL CALORIES
                                            </span>

                                            <p>
                                                Estimated meal total
                                            </p>
                                        </div>

                                        <strong>
                                            {Math.round(
                                                mealTotals.calories
                                            )}
                                            <small>
                                                kcal
                                            </small>
                                        </strong>
                                    </div>

                                    <div className="macro-grid">
                                        <Macro
                                            label="Protein"
                                            value={mealTotals.protein}
                                        />

                                        <Macro
                                            label="Carbs"
                                            value={
                                                mealTotals.carbohydrates
                                            }
                                        />

                                        <Macro
                                            label="Fat"
                                            value={mealTotals.fat}
                                        />
                                    </div>
                                </div>

                                <div className="meal-actions">
                                    <button
                                        type="button"
                                        className="primary-button no-margin"
                                        onClick={()=>
                                            inputRef.current?.click()
                                        }
                                    >
                                        <Plus size={15}/>
                                        Add Another Food
                                    </button>

                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={handleClearMeal}
                                    >
                                        <RefreshCw size={14}/>
                                        New Meal
                                    </button>
                                </div>
                            </>
                        )}
                    </section>
                </main>
            )}
        </div>
    );
}

function Stat({icon,title,text}){
    return(
        <div className="stat-card">
            <div className="stat-icon">
                {icon}
            </div>

            <div>
                <strong>
                    {title}
                </strong>

                <span>
                    {text}
                </span>
            </div>
        </div>
    );
}

function ProcessStep({number,icon,title,text}){
    return(
        <div className="process-step">
            <div className="process-icon">
                {icon}
            </div>

            <div>
                <span className="process-number">
                    {number}
                </span>

                <strong>
                    {title}
                </strong>

                <p>
                    {text}
                </p>
            </div>
        </div>
    );
}

function Macro({label,value}){
    return(
        <div className="macro-card">
            <span>
                {label}
            </span>

            <strong>
                {Number(value||0).toFixed(1)}
                <small>g</small>
            </strong>
        </div>
    );
}

function formatUnit(unit,quantity){
    if(!unit){
        return "";
    }

    if(unit==="gram"){
        return "grams";
    }

    if(Number(quantity)===1){
        return unit;
    }

    if(unit==="piece"){
        return "pieces";
    }

    if(unit==="slice"){
        return "slices";
    }

    if(unit==="serving"){
        return "servings";
    }

    if(unit==="cup"){
        return "cups";
    }

    return `${unit}s`;
}

function roundValue(value){
    if(value===undefined||value===null){
        return "--";
    }

    return Math.round(Number(value));
}

export default ImageUpload;