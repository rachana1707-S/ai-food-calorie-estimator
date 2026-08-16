from torchvision.datasets import Food101


dataset = Food101(
    root="../data",
    split="train"
)


LABELS = dataset.classes