import {useEffect,useRef,useState} from "react";
import {
    Apple,
    Brain,
    CheckCircle2,
    FolderOpen,
    Loader2,
    PieChart,
    Plus,
    RefreshCw,
    Scale,
    Sparkles,
    Trash2,
    Upload
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
            if(preview){
                URL.revokeObjectURL(preview);
            }
        };
    },[preview]);

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

        if(preview){
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
        handleFile(event.target.files[0]);
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
        handleFile(file);
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

            if(inputRef.current){
                inputRef.current.value="";
            }
        }catch(err){
            setError(err.message);
        }finally{
            setNutritionLoading(false);
        }
    };

    const handleAddAnother=()=>{
        setSelectedFile(null);
        setPreview(null);
        setResult(null);
        setSelectedUnit("");
        setQuantity(1);
        setError("");

        if(inputRef.current){
            inputRef.current.value="";
        }

        inputRef.current?.click();
    };

    const handleRemoveFood=(id)=>{
        setMealItems((current)=>
            current.filter((item)=>item.id!==id)
        );
    };

    const handleClearMeal=()=>{
        setMealItems([]);
        setSelectedFile(null);
        setPreview(null);
        setResult(null);
        setSelectedUnit("");
        setQuantity(1);
        setError("");

        if(inputRef.current){
            inputRef.current.value="";
        }
    };

    const handleUnitChange=(unit)=>{
        setSelectedUnit(unit);

        if(unit==="gram"){
            setQuantity(100);
        }else{
            setQuantity(1);
        }
    };

    const decreaseQuantity=()=>{
        const current=Number(quantity)||0;

        if(selectedUnit==="gram"){
            setQuantity(Math.max(current-10,1));
            return;
        }

        setQuantity(Math.max(current-0.5,0.5));
    };

    const increaseQuantity=()=>{
        const current=Number(quantity)||0;

        if(selectedUnit==="gram"){
            setQuantity(current+10);
            return;
        }

        setQuantity(current+1);
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
                <div className="brand">
                    <div className="brand-icon">
                        <Apple size={21}/>
                    </div>

                    <span className="brand-name">
                        Food<span>AI</span>
                    </span>

                    <span className="brand-subtitle">
                        Smart Nutrition
                    </span>
                </div>

                <div className="status-badge">
                    <span className="status-dot"></span>
                    AI Online
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
                    <section className="hero">
                        <div className="hero-badge">
                            <Sparkles size={13}/>
                            AI-POWERED FOOD ANALYSIS
                        </div>

                        <h1>
                            Know what's <span>on your plate.</span>
                        </h1>

                        <p>
                            Upload a food photo, let AI identify it,
                            then enter the portion you consumed for a
                            more accurate nutrition estimate.
                        </p>

                        <div className="feature-row">
                            <FeatureItem text="Food Recognition"/>
                            <FeatureItem text="Calorie Estimates"/>
                            <FeatureItem text="Multiple Foods"/>
                        </div>
                    </section>

                    <section className="upload-card">
                        {!preview?(
                            <UploadZone
                                inputRef={inputRef}
                                isDragging={isDragging}
                                handleDragOver={handleDragOver}
                                handleDragLeave={handleDragLeave}
                                handleDrop={handleDrop}
                            />
                        ):(
                            <div className="selected-image-layout">
                                <div className="selected-image-panel">
                                    <img
                                        src={preview}
                                        alt="Selected food"
                                        className="selected-image"
                                    />
                                </div>

                                <div className="selected-image-actions">
                                    <span className="eyebrow">
                                        READY TO ANALYZE
                                    </span>

                                    <h3>
                                        {selectedFile?.name}
                                    </h3>

                                    <p>
                                        Our AI will identify the food
                                        and suggest portion options.
                                    </p>

                                    <div className="action-buttons">
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
                                            className="primary-button"
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
                                                    <Sparkles size={15}/>
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

                    <section className="how-it-works">
                        <Step
                            number="1"
                            icon={<Upload size={18}/>}
                            title="Upload"
                            text="Add a food photo"
                        />

                        <Step
                            number="2"
                            icon={<Brain size={18}/>}
                            title="Recognize"
                            text="AI identifies it"
                        />

                        <Step
                            number="3"
                            icon={<Scale size={18}/>}
                            title="Portion"
                            text="Enter what you ate"
                        />

                        <Step
                            number="4"
                            icon={<PieChart size={18}/>}
                            title="Nutrition"
                            text="View meal totals"
                        />
                    </section>
                </main>
            ):(
                <main className="meal-layout">
                    <section className="analysis-panel">
                        {result?(
                            <>
                                <div className="analysis-image-wrapper">
                                    <img
                                        src={preview}
                                        alt="Analyzed food"
                                        className="analysis-image"
                                    />
                                </div>

                                <div className="prediction-card">
                                    <div>
                                        <span className="eyebrow">
                                            AI RESULT
                                        </span>

                                        <h2>
                                            {result.food.replaceAll("_"," ")}
                                        </h2>

                                        <p>
                                            EfficientNetV2B0 • Food-101
                                        </p>
                                    </div>

                                    <div className="confidence-box">
                                        <span>Confidence</span>

                                        <strong>
                                            {result.confidence}%
                                        </strong>
                                    </div>
                                </div>

                                <div className="portion-card">
                                    <div className="portion-heading">
                                        <div className="portion-heading-icon">
                                            <Scale size={17}/>
                                        </div>

                                        <div>
                                            <h3>
                                                How much did you eat?
                                            </h3>

                                            <p>
                                                Choose a unit and enter
                                                the amount consumed.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="portion-control">
                                        <div className="quantity-control">
                                            <label>Amount</label>

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
                                                    step={
                                                        selectedUnit==="gram"
                                                            ?"1"
                                                            :"0.5"
                                                    }
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

                                        <div className="unit-control">
                                            <label>Unit</label>

                                            <div className="unit-options">
                                                {result.portion_options?.map(
                                                    (option)=>(
                                                        <button
                                                            key={option.value}
                                                            type="button"
                                                            className={`unit-option ${
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

                                    <button
                                        type="button"
                                        className="primary-button add-food-button"
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
                            </>
                        ):(
                            <div className="add-food-state">
                                <div className="add-food-icon">
                                    <Plus size={26}/>
                                </div>

                                <span className="eyebrow">
                                    ADD ANOTHER FOOD
                                </span>

                                <h2>
                                    What's else on your plate?
                                </h2>

                                <p>
                                    Add another food image and FoodAI
                                    will include it in your meal total.
                                </p>

                                <button
                                    type="button"
                                    className="primary-button"
                                    onClick={()=>
                                        inputRef.current?.click()
                                    }
                                >
                                    <FolderOpen size={15}/>
                                    Choose Food Image
                                </button>

                                {preview&&(
                                    <button
                                        type="button"
                                        className="secondary-button"
                                        onClick={handleAnalyze}
                                    >
                                        Analyze Food
                                    </button>
                                )}
                            </div>
                        )}

                        {!result&&preview&&(
                            <div className="new-food-preview">
                                <img
                                    src={preview}
                                    alt="New food"
                                />

                                <div>
                                    <span className="eyebrow">
                                        NEW FOOD
                                    </span>

                                    <h3>
                                        {selectedFile?.name}
                                    </h3>

                                    <button
                                        type="button"
                                        className="primary-button"
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
                                                <Sparkles size={15}/>
                                                Analyze
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}

                        {error&&(
                            <div className="error-message result-error">
                                {error}
                            </div>
                        )}
                    </section>

                    <section className="meal-panel">
                        <div className="meal-heading">
                            <div>
                                <span className="eyebrow">
                                    YOUR MEAL
                                </span>

                                <h2>
                                    Meal Summary
                                </h2>
                            </div>

                            <span className="meal-count">
                                {mealItems.length}{" "}
                                {mealItems.length===1
                                    ?"item"
                                    :"items"}
                            </span>
                        </div>

                        {mealItems.length===0?(
                            <div className="empty-meal">
                                <Apple size={28}/>

                                <h3>
                                    No foods added yet
                                </h3>

                                <p>
                                    Enter the portion above and add
                                    the first food to your meal.
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

                                                <span>kcal</span>
                                            </div>

                                            <button
                                                type="button"
                                                className="delete-food"
                                                title="Remove food"
                                                onClick={()=>
                                                    handleRemoveFood(item.id)
                                                }
                                            >
                                                <Trash2 size={14}/>
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <div className="meal-total">
                                    <div className="total-calories">
                                        <div>
                                            <span>
                                                Total Calories
                                            </span>

                                            <p>
                                                Combined meal estimate
                                            </p>
                                        </div>

                                        <strong>
                                            {Math.round(
                                                mealTotals.calories
                                            )}
                                            <small> kcal</small>
                                        </strong>
                                    </div>

                                    <div className="macro-summary">
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

                                    <div className="meal-source">
                                        <CheckCircle2 size={13}/>
                                        USDA FoodData Central
                                    </div>
                                </div>

                                <div className="meal-actions">
                                    <button
                                        type="button"
                                        className="primary-button add-another-button"
                                        onClick={handleAddAnother}
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
                                        Start New Meal
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

function UploadZone({
    inputRef,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop
}){
    return(
        <div
            className={`drop-zone ${isDragging?"dragging":""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={()=>
                inputRef.current?.click()
            }
        >
            <div className="upload-icon">
                <Upload size={26}/>
            </div>

            <h2>
                Upload your food image
            </h2>

            <p>
                Drag & drop or click to browse
            </p>

            <span className="formats">
                JPG • PNG • WEBP • MAX 10MB
            </span>

            <button
                type="button"
                className="primary-button"
                onClick={(event)=>{
                    event.stopPropagation();
                    inputRef.current?.click();
                }}
            >
                <FolderOpen size={15}/>
                Choose Image
            </button>
        </div>
    );
}

function FeatureItem({text}){
    return(
        <div className="feature-item">
            <CheckCircle2 size={15}/>
            {text}
        </div>
    );
}

function Step({number,icon,title,text}){
    return(
        <div className="step">
            <div className="step-icon">
                {icon}
            </div>

            <div>
                <div className="step-title">
                    <span>{number}</span>
                    {title}
                </div>

                <p>{text}</p>
            </div>
        </div>
    );
}

function Macro({label,value}){
    return(
        <div className="macro">
            <span>{label}</span>

            <strong>
                {Number(value||0).toFixed(1)}
                <small>g</small>
            </strong>
        </div>
    );
}

function formatUnit(unit,quantity){
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