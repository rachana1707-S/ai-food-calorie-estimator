import torch
from torchvision import models, transforms
from PIL import Image


model = models.resnet50(
    weights="DEFAULT"
)


model.eval()



transform = transforms.Compose([

    transforms.Resize((224,224)),

    transforms.ToTensor(),

    transforms.Normalize(

        mean=[0.485,0.456,0.406],

        std=[0.229,0.224,0.225]

    )

])



def predict_food(image_path):


    image = Image.open(image_path)


    image = transform(image)


    image = image.unsqueeze(0)



    with torch.no_grad():

        output = model(image)



    prediction = torch.argmax(
        output,
        dim=1
    )


    return prediction.item()