n=int(input("Enter your marks: "))
if n >=90:
  print("O Grade") #10
elif n >= 80 and n <= 90:
  print("A+ Grade") #9
elif n >= 70 and n <= 80:
  print("A Grade") #8
elif n >= 60 and n <= 70:
  print("B+ Grade") #7
elif n >= 50 and n <= 60:
  print("B Grade") #6
elif n >= 40 and n <= 50:
  print(" C Grade") #5
elif n >= 32 and n <= 40:
  print("Pass") #4
else:
  print("Fail") 
