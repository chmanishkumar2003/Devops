# For user input of array
n=int(input("Enter size of an array :"))
print("Enter elements in list after every element press enter")
arr=[]
for _ in range(n):
    arr.append(int(input()))
print(arr)
