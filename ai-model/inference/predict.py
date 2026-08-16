import torch

from torchvision import models, transforms

from PIL import Image

from .labels import LABELS



model = models.resnet50()


model.fc = torch.nn.Linear(

    model.fc.in_features,

    101

)



model.load_state_dict(

    torch.load(
        "../models/food101_resnet50.pth",
        map_location="cpu"
    )

)



model.eval()



transform = transforms.Compose([

    transforms.Resize((224,224)),

    transforms.ToTensor()

])



def predict_food(image_path):


    image = Image.open(
        image_path
    )


    image = transform(image)


    image = image.unsqueeze(0)



    with torch.no_grad():

        output = model(image)



    probabilities = torch.softmax(
        output,
        dim=1
    )


    confidence, index = torch.max(
        probabilities,
        1
    )


    food = LABELS[index.item()]


    return {

        "food":food,

        "confidence":
        round(
            confidence.item()*100,
            2
        )

    }