#1
# class Rec:
#     def __init__(self,ln,br):
#         self.ln=ln
#         self.br=br
#     def Area(self):
#         ar=self.ln * self.br
#         print(f"Area of Rectangle",ar)
# r1=Rec(11,20)
# r1.Area()

#2
# class Person:
#     def __init__(self,name,roll):
#         self.name=name
#         self.roll=roll
#     def show(self):
#         print(f"My name is {self.name} and roll no. is {self.roll}")
# r1=Person("Manish",1432)
# r1.show()

#3
# class Car:
#     def __init__(self,name,brand):
#         self.name=name
#         self.brand=brand
#     def show(self):
#         print(f"My car is {self.name} and it from {self.brand}.")
# r1=Car("G-Wagon","Benz")
# r1.show()

#6
# class Car:
#     count=0
#     def __init__(self,name):
#         self.name=name
#         Car.count+=1
# c1=Car("Benz")
# c2=Car("BMW")
# c3=Car("Skoda")
# print("Total cars are",Car.count)

#7
# class Rec:
#     def __init__(self,ln,br):
#         self.ln=ln
#         self.br=br
#     def Area(self,ar):
#         print(f"Area of Rectangle",ar)
#     def Ar(self):
#         ar=self.ln * self.br
#         self.Area(ar)
# r1=Rec(11,20)
# r1.Ar()

#9
# class Mul:
#     def __init__(self,ln,br):
#         self.ln=ln
#         self.br=br
#     def Area(self,ar):
#         print(f"Mutiple of {self.ln} and {}",ar)
#     def Ar(self):
#         ar=self.ln * self.br
#         self.Area(ar)
# r1=Mul(11,20)
# r1.Ar()

#10
# class Student:
#     def __init__(self,name,roll):
#         self.name=name
#         self.roll=roll
#     def show(self):
#         print(f"My name is {self.name} and roll no. is {self.roll}")
# r1=Student("Manish",1432)
# r1.show()

#11
# class Animal:
#     def __init__(self,name):
#         self.name=name
#     def sound(self):
#         print("Animal Makes sound")
# class Dog(Animal):
#     def show(self):
#         print("My dog name is",self.name)
# a1=Dog("Bobby")
# a1.show()

#12
# class Parent:
#     def __init__(self,s_name):
#         self.s_name=s_name
# class Child(Parent):
#     def __init__(self,s_name,name):
#         super().__init__(s_name)
#         self.name=name
#     def show(self):
#         print("My name is",self.s_name,self.name)
# a1=Child("Ch","Manish")
# a1.show()

#13
# class Parent:
#     def __init__(self,s_name):
#         self.s_name=s_name
# class Child(Parent):
#     def __init__(self,s_name,name):
#         super().__init__(s_name)
#         self.name=name
#     def show(self):
#         print("My name is",self.s_name,self.name)
# a1=Child("Ch","Manish")
# a1.show()

#14
# class Animal:
#     def sound(self):
#         print("Animal Makes sound")
# class Dog(Animal):
#     def sound(self):
#         print("Dog barks")
# a1=Dog()
# a1.sound()

#15
# class Car:
#     def __init__(self,name,brand):
#         self.name=name
#         self.brand=brand
#     def show(self):
#         print(f"My car is {self.name} and it from {self.brand}.")
#     def ride(self):
#         print("Car is starting")
        
# class Drive:
#     def __init__(self,name,brand):
#         self.name=name
#         self.brand=brand
#     def ride(self):
#         print("Car is going")

# r1=Car("G-Wagon","Benz")
# r1.ride()

# r2=Drive("G-Wagon","Benz")
# r2.ride()

#16
# class Emp:
#     def __init__(self,name,salary):
#         self.name=name
#         self.salary=salary
#     def grade(self):
#         if self.salary > 50000:
#             print("A Grade")
#         else:
#             print("B Grade")
# e1=Emp("Manish",60000)
# e2=Emp("Harish",45000)
# e1.grade()
# e2.grade()

#17
#yes
# class Emp:
#     def __init__(self,name,salary):
#         self.name=name
#         self.salary=salary
#     def grade(self):
#         if self.salary > 50000:
#             print("A Grade")
#         else:
#             print("B Grade")
# e1=Emp("Manish",60000)
# e2=Emp("Harish",45000)
# e1.grade()
# e2.grade()

#18
# class Animal:
#     def sound(self):
#         print("Animal Makes sound")
#     def sound(self):
#         print("Dog barks")
# a1=Animal()
# a1.sound()

#19
# class Animal:
#     def sound(self):
#         print("Animal Makes sound")
# class Dog(Animal):
#     def sound(self):
#         print("Dog barks")
# a1=Dog()
# a1.sound()

#20
# class Person:
#     def __init__(self,name,age):
#         self.name=name
#         self.age=age
#     def show(self):
#         print(f"My name is {self.name} and i am {self.age} old")
# class Emp(Person):
#     def type(self):
#         if self.age <=  25:
#             print("Fresher")
#         elif 25 < self.age <= 35:
#             print("Experience")
#         else:
#             print("Professional")
# a1=Emp("Manish",42)
# a1.show()
# a1.type()



#                            #Function Overriding

# class Car:
#     def __init__(self,name,brand):
#         self.name=name
#         self.brand=brand
#     def show(self):
#         print(f"My car is {self.name} and it from {self.brand}.")
#     def ride(self):
#         print("Car is starting")
        
# class Drive:
#     def __init__(self,name,brand):
#         self.name=name
#         self.brand=brand
#     def ride(self):
#         print("Car is going")

# r1=Car("G-Wagon","Benz")
# r1.ride()

# r2=Drive("G-Wagon","Benz")
# r2.ride()










































































