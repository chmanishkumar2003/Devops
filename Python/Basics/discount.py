n=int(input("Enter bill amount: "))
dis=0
dis_am=n
if n > 7999:
    dis=25
elif n > 4999:
    dis=15
elif n > 1999:
    dis=10
dis_am = n - (n*dis // 100)
print(f"The discount rewarded for your bill is {dis} percent.")
print("The bill amount to be paid is ",dis_am) 
