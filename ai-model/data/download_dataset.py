from torchvision.datasets import Food101
from torchvision import transforms


transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor()
])


dataset = Food101(
    root="./",
    split="train",
    download=True,
    transform=transform
)


print("Dataset downloaded")
print("Number of images:", len(dataset))