from fastapi import FastAPI

app = FastAPI(
    title="AI Food Calorie Estimator API"
)


@app.get("/")
def home():

    return {
        "message":"Food AI API running"
    }
