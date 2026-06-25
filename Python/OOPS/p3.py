class Car:
    def __init__(self,name,brand):
        self.name=name
        self.brand=brand
    def show(self):
        print(f"My car is {self.name} and it from {self.brand}.")
r1=Car("G-Wagon","Benz")
r1.show()
