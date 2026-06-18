class Rec:
    def __init__(self,ln,br):
        self.ln=ln
        self.br=br
    def Area(self):
        ar=self.ln * self.br
        print(f"Area of Rectangle",ar)
r1=Rec(11,20)
r1.Area()