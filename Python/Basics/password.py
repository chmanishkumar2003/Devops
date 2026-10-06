n=input("Enter you password ")
l=len(n)
if l >= 6 and n.istitle():
        print("You can use this password")
else:
        print("You can not use this password")
