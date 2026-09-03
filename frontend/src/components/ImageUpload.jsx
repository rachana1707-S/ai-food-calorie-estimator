
import { useState } from "react";
import {
    Camera,
    CheckCircle2,
    CloudUpload,
    Flame,
    Image as ImageIcon,
    Loader2,
    Sparkles,
    Upload,
    X,
    Beef,
    Wheat,
    Droplets,
    ScanSearch,
    ArrowRight,
} from "lucide-react";

import "./ImageUpload.css";

function ImageUpload() {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleImageChange = (event) => {
        const file = event.target.files[0];

        if (!file) return;

        setImage(file);
        setPreview(URL.createObjectURL(file));
        setResult(null);
        setError("");
    };

    const removeImage = () => {
        setImage(null);
        setPreview(null);
        setResult(null);
        setError("");
    };

    const uploadImage = async () => {
        if (!image) {
            setError("Please select a food image first.");
            return;
        }

        try {
            setLoading(true);
            setError("");
            setResult(null);

            const formData = new FormData();
            formData.append("file", image);

            const response = await fetch(
                "http://127.0.0.1:8000/api/upload",
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail || "Unable to analyze the image."
                );
            }

            setResult(data);
        } catch (err) {
            console.error(err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const formatFoodName = (name) => {
        if (!name) return "";

        return name
            .replaceAll("_", " ")
            .replace(/\b\w/g, (char) => char.toUpperCase());
    };

    return (
        <div className="food-app">

            {/* Decorative background */}
            <div className="bg-shape bg-shape-one"></div>
            <div className="bg-shape bg-shape-two"></div>

            {/* ================= NAVBAR ================= */}

            <header className="navbar">
                <div className="navbar-inner">

                    <div className="brand">

                        <div className="brand-logo">
                            <Sparkles size={20} />
                        </div>

                        <div className="brand-text">
                            <h1>FoodAI</h1>
                            <span>Smart Nutrition</span>
                        </div>

                    </div>

                    <div className="ai-status">
                        <span className="status-indicator"></span>
                        AI Online
                    </div>

                </div>
            </header>


            <main className="main-container">

                {/* ================= HERO ================= */}

                <section className="hero">

                    <div className="hero-badge">
                        <Sparkles size={14} />
                        AI-POWERED FOOD ANALYSIS
                    </div>

                    <h2>
                        Know what's
                        <br />
                        <span>on your plate.</span>
                    </h2>

                    <p>
                        Take a photo of your meal and let FoodAI
                        identify the food and provide nutritional
                        insights in seconds.
                    </p>

                    <div className="hero-points">

                        <div>
                            <CheckCircle2 size={16} />
                            Food Recognition
                        </div>

                        <div>
                            <CheckCircle2 size={16} />
                            Calorie Estimates
                        </div>

                        <div>
                            <CheckCircle2 size={16} />
                            Nutrition Insights
                        </div>

                    </div>

                </section>


                {/* ================= UPLOAD ================= */}

                <section className="upload-section">

                    <div className="upload-card">

                        {!preview ? (

                            <label
                                htmlFor="food-image"
                                className="drop-zone"
                            >

                                <div className="upload-icon-wrapper">
                                    <CloudUpload size={34} />
                                </div>

                                <h3>
                                    Upload your food
                                </h3>

                                <p>
                                    Drag & drop your image here or browse
                                    your device
                                </p>

                                <div className="file-types">
                                    <span>JPG</span>
                                    <span>PNG</span>
                                    <span>WEBP</span>
                                    <span>MAX 10MB</span>
                                </div>

                                <div className="choose-button">
                                    <Upload size={16} />
                                    Choose Image
                                </div>

                            </label>

                        ) : (

                            <div className="preview-container">

                                <div className="preview-header">

                                    <div>
                                        <span>
                                            READY TO ANALYZE
                                        </span>

                                        <p>
                                            {image?.name}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="remove-button"
                                    >
                                        <X size={18} />
                                    </button>

                                </div>

                                <div className="preview-wrapper">

                                    <img
                                        src={preview}
                                        alt="Selected food"
                                    />

                                    <div className="preview-status">
                                        <ImageIcon size={14} />
                                        Image ready
                                    </div>

                                </div>

                            </div>

                        )}

                        <input
                            id="food-image"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleImageChange}
                            hidden
                        />

                        <button
                            className="analyze-button"
                            onClick={uploadImage}
                            disabled={!image || loading}
                        >

                            {loading ? (
                                <>
                                    <Loader2 className="spin" size={19} />
                                    Analyzing...
                                </>
                            ) : (
                                <>
                                    <ScanSearch size={19} />
                                    Analyze My Food
                                    <ArrowRight size={18} />
                                </>
                            )}

                        </button>

                        {error && (
                            <div className="error-message">
                                <X size={17} />
                                {error}
                            </div>
                        )}

                    </div>

                </section>


                {/* ================= LOADING ================= */}

                {loading && (
                    <section className="loading-card">

                        <div className="loading-animation">
                            <Sparkles size={23} />
                        </div>

                        <div>
                            <h3>
                                AI is analyzing your meal
                            </h3>

                            <p>
                                Identifying the food and retrieving
                                nutrition information...
                            </p>
                        </div>

                    </section>
                )}


                {/* ================= RESULTS ================= */}

                {result && !loading && (

                    <section className="results-section">

                        <div className="results-title">

                            <div>
                                <span>ANALYSIS COMPLETE</span>
                                <h2>
                                    Your Food Insights
                                </h2>
                            </div>

                            <div className="success-badge">
                                <CheckCircle2 size={20} />
                                Complete
                            </div>

                        </div>


                        {/* Prediction */}

                        <div className="prediction-grid">

                            <div className="result-image-card">

                                <img
                                    src={preview}
                                    alt={result.food}
                                />

                                <div className="image-label">
                                    <Camera size={14} />
                                    Analyzed Image
                                </div>

                            </div>


                            <div className="prediction-card">

                                <span className="result-label">
                                    AI PREDICTION
                                </span>

                                <h3>
                                    {formatFoodName(result.food)}
                                </h3>

                                <div className="confidence">

                                    <div className="confidence-header">

                                        <span>
                                            Confidence
                                        </span>

                                        <strong>
                                            {result.confidence}%
                                        </strong>

                                    </div>

                                    <div className="confidence-track">

                                        <div
                                            className="confidence-value"
                                            style={{
                                                width: `${result.confidence}%`,
                                            }}
                                        />

                                    </div>

                                    <p>
                                        FoodAI's computer vision model
                                        recognized this food with this
                                        confidence score.
                                    </p>

                                </div>

                                <div className="model-info">
                                    <Sparkles size={14} />
                                    EfficientNetV2B0
                                    <span>•</span>
                                    Food-101
                                </div>

                            </div>

                        </div>


                        {/* Nutrition */}

                        <div className="nutrition-section">

                            <div className="section-heading">

                                <span>
                                    NUTRITION BREAKDOWN
                                </span>

                                <h2>
                                    What's in your food?
                                </h2>

                            </div>


                            <div className="nutrition-grid">

                                <NutritionCard
                                    icon={<Flame />}
                                    label="Calories"
                                    value={
                                        result.nutrition
                                            ?.nutrition
                                            ?.calories
                                            ?.value
                                    }
                                    unit="kcal"
                                />

                                <NutritionCard
                                    icon={<Beef />}
                                    label="Protein"
                                    value={
                                        result.nutrition
                                            ?.nutrition
                                            ?.protein
                                            ?.value
                                    }
                                    unit="g"
                                />

                                <NutritionCard
                                    icon={<Wheat />}
                                    label="Carbohydrates"
                                    value={
                                        result.nutrition
                                            ?.nutrition
                                            ?.carbohydrates
                                            ?.value
                                    }
                                    unit="g"
                                />

                                <NutritionCard
                                    icon={<Droplets />}
                                    label="Fat"
                                    value={
                                        result.nutrition
                                            ?.nutrition
                                            ?.fat
                                            ?.value
                                    }
                                    unit="g"
                                />

                            </div>

                        </div>


                        {/* USDA */}

                        {result.nutrition?.food_name && (

                            <div className="source-card">

                                <div className="source-check">
                                    <CheckCircle2 size={18} />
                                </div>

                                <div>
                                    <span>
                                        VERIFIED NUTRITION SOURCE
                                    </span>

                                    <p>
                                        USDA FoodData Central
                                    </p>

                                    <small>
                                        Matched food:{" "}
                                        {result.nutrition.food_name}
                                    </small>
                                </div>

                            </div>

                        )}

                    </section>

                )}


                {/* ================= HOW IT WORKS ================= */}

                {!result && !loading && (

                    <section className="how-section">

                        <div className="section-heading centered">

                            <span>
                                SIMPLE & FAST
                            </span>

                            <h2>
                                From photo to insights.
                            </h2>

                        </div>


                        <div className="steps">

                            <Step
                                number="01"
                                icon={<Upload />}
                                title="Upload"
                                description="Choose a clear photo of your food."
                            />

                            <Step
                                number="02"
                                icon={<ScanSearch />}
                                title="AI Analysis"
                                description="EfficientNetV2B0 identifies your food."
                            />

                            <Step
                                number="03"
                                icon={<Flame />}
                                title="Get Insights"
                                description="See calories and nutrition information."
                            />

                        </div>

                    </section>

                )}

            </main>


            <footer>
                <span>FoodAI</span>
                <p>
                    AI-powered food recognition & nutrition analysis
                </p>
            </footer>

        </div>
    );
}


function NutritionCard({ icon, label, value, unit }) {

    return (
        <div className="nutrition-card">

            <div className="nutrition-icon">
                {icon}
            </div>

            <div>

                <span>
                    {label}
                </span>

                <h3>
                    {value ?? "--"}

                    {value != null && (
                        <small>
                            {unit}
                        </small>
                    )}

                </h3>

            </div>

        </div>
    );
}


function Step({ number, icon, title, description }) {

    return (
        <div className="step-card">

            <span className="step-number">
                {number}
            </span>

            <div className="step-icon">
                {icon}
            </div>

            <h3>
                {title}
            </h3>

            <p>
                {description}
            </p>

        </div>
    );
}


export default ImageUpload;

