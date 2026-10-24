# Printing first +ve missing number  
m=[19,-4,-2,2,0,5,33]
n=[]
for i in range(len(m)):
    if m[i] >= 0:
        n.append(m[i])
min=n[0]
for i in range(len(n)):
    if  min > n[i]:
        min=n[i]
val=min
if val!= 0:
    print(val-1)
else:
    print(val)
