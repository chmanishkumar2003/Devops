class Person:
    def __init__(self,name,roll):
        self.name=name
        self.roll=roll
    def show(self):
        print(f"My name is {self.name} and roll no. is {self.roll}")
r1=Person("Manish",1432)
r1.show()
