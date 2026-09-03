const API_URL =
    import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export const analyzeFoodImage = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await fetch(
        `${API_URL}/api/upload`,
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

    return data;
};