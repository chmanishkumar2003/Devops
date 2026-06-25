class Car:
    count=0
    def __init__(self,name):
        self.name=name
        Car.count+=1
c1=Car("Benz")
c2=Car("BMW")
c3=Car("Skoda")
print("Total cars are",Car.count)
