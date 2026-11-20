import sys; sys.path.insert(0,'/gen')
from genlib import build

def quad(b,c):
    s="x²"
    if b: s += (" + " if b>0 else " − ")+str(abs(b))+"x"
    if c: s += (" + " if c>0 else " − ")+str(abs(c))
    return s+" = 0"

P=[5,10,15,20,25,30,40,50,60,75]; B=[80,120,200,240,300,400,500,600,800,1000]
def t_percent():
    out=[]
    for i in range(10):
        c=B[i]*P[i]/100
        out.append((f"Сколько составляет {P[i]}% от {B[i]}?", c, [c*1.5, c/2, c+10]))
    return out

A=[3,2,5,4,6,7,3,8,9,5]; X=[4,5,3,6,2,3,7,4,5,8]; BB=[5,7,4,9,8,11,2,6,3,10]
def t_linear():
    return [(f"Решите: {A[i]}x + {BB[i]} = {A[i]*X[i]+BB[i]}", X[i], [X[i]+1, X[i]-1, X[i]+2]) for i in range(10)]

PR=[(2,3),(3,5),(1,6),(4,2),(5,4),(2,7),(6,4),(3,8),(1,9),(7,5)]
def t_quadratic():
    out=[]
    for p,q in PR:
        lo,hi=sorted([p,q])
        out.append((f"Корни уравнения {quad(-(p+q), p*q)}", f"{lo} и {hi}",
                    [f"{-lo} и {-hi}", f"{lo} и {-hi}", f"{-lo} и {hi}"]))
    return out

IA=[2,3,4,5,2,6,3,4,5,7]; IX=[2,3,4,5,6,7,8,9,10,11]; IB=[2,3,4,5,6,7,8,9,10,11]
def t_ineq():
    return [(f"Решите: {IA[i]}x + {IB[i]} > {IA[i]*IX[i]+IB[i]}", f"x > {IX[i]}",
             [f"x < {IX[i]}", f"x > {-IX[i]}", f"x < {-IX[i]}"]) for i in range(10)]

KA=[2,3,4,5,-2,3,-4,5,6,-3]; KB=[1,2,-3,4,5,-6,7,-8,9,2]; KX=[3,4,2,5,3,6,2,4,3,5]
def t_functions():
    out=[]
    for i in range(10):
        k,b,x=KA[i],KB[i],KX[i]; y=k*x+b
        out.append((f"Найдите y = {k}x {'+' if b>0 else '−'} {abs(b)} при x = {x}", y,
                    [y+2, y-3, k*x, -y]))
    return out

LB=[2,3,2,5,10,2,3,4,2,10]; LN=[3,2,5,3,2,7,4,3,10,3]
def t_log():
    return [(f"log_{LB[i]} {LB[i]**LN[i]} = ?", LN[i], [LN[i]+1, LN[i]-1, LB[i]**(LN[i]-1)]) for i in range(10)]

EB=[2,3,2,5,2,3,4,2,5,3]; EN=[5,2,7,3,10,4,3,6,2,5]
def t_exp():
    return [(f"Решите: {EB[i]}ˣ = {EB[i]**EN[i]}", f"x = {EN[i]}", [f"x = {EN[i]+1}", f"x = {EN[i]-1}", f"x = {EB[i]**EN[i]}"]) for i in range(10)]

TRIG=[("sin 30°","0,5",["0","1","√3/2"]),("cos 60°","0,5",["1","0","√3/2"]),
      ("sin 90°","1",["0","0,5","−1"]),("cos 0°","1",["0","0,5","−1"]),
      ("tg 45°","1",["0","0,5","не существует"]),("sin 0°","0",["1","0,5","−1"]),
      ("cos 180°","−1",["1","0","0,5"]),("sin 180°","0",["1","−1","0,5"]),
      ("tg 0°","0",["1","0,5","не существует"]),("cos 90°","0",["1","−1","0,5"])]
def t_trig():
    return [(f"{q} = ?", c, w) for q,c,w in TRIG]

DA=[1,2,3,4,5,2,3,6,4,5]; DN=[2,3,2,4,3,5,4,2,3,6]
def t_deriv():
    out=[]
    for i in range(10):
        a,n=DA[i],DN[i]
        coef = a if a>1 else ""
        c = f"{a*n}x" + ("" if n-1==1 else f"^{n-1}")
        out.append((f"Производная {coef}x^{n} равна", c,
                    [f"{a}x^{n-1}", f"{a*n}x^{n}", f"{a*(n-1)}x^{n-1}"]))
    return out

GA=[1,2,3,4,5,6,2,3,4,7]; GN=[1,2,3,2,4,1,5,2,3,4]
def t_integral():
    out=[]
    for i in range(10):
        a,n=GA[i],GN[i]; k=a/(n+1)
        coef = a if a>1 else ""
        out.append((f"∫ {coef}x^{n} dx = ?", f"{k:g}x^{n+1} + C",
                    [f"{a}x^{n+1} + C", f"{k:g}x^{n} + C", f"{a*n}x^{n+1} + C"]))
    return out

TRIPLES=[(3,4,5),(6,8,10),(5,12,13),(8,15,17),(7,24,25),(9,12,15),(20,21,29),(12,16,20),(9,40,41),(15,20,25)]
def t_triangles():
    out=[]
    for i,(a,b,c) in enumerate(TRIPLES):
        if i%2==0: out.append((f"Гипотенуза прямоугольного треугольника с катетами {a} и {b}", c, [c+1,a+b,c-1]))
        else: out.append((f"Площадь прямоугольного треугольника с катетами {a} и {b}", a*b/2, [a*b,(a+b)/2,a*b/4]))
    return out

R=[3,5,2,4,6,7,10,8,1,9]
def t_circle():
    out=[]
    for i,r in enumerate(R):
        if i%2==0: out.append((f"Длина окружности радиуса {r}", f"{2*r}π", [f"{r}π", f"{r*r}π", f"{4*r}π"]))
        else: out.append((f"Площадь круга радиуса {r}", f"{r*r}π", [f"{2*r}π", f"{r}π", f"{2*r*r}π"]))
    return out

SA=[3,2,4,5,6,7,8,9,10,11]
def t_stereo():
    out=[]
    for i,a in enumerate(SA):
        if i%3==0: out.append((f"Объём куба с ребром {a}", a**3, [a*a, 6*a*a, 3*a]))
        elif i%3==1:
            b=[2,3,4,5,2,3,4,2,3,4][i]; c=[3,4,5,2,3,4,5,3,4,5][i]
            out.append((f"Объём параллелепипеда {a} × {b} × {c}", a*b*c, [a+b+c, a*b, 2*(a*b+b*c+a*c)]))
        else: out.append((f"Площадь поверхности куба с ребром {a}", 6*a*a, [a*a, 4*a*a, a**3]))
    return out

VA=[1,3,2,4,5,1,2,6,3,4]; VB=[2,4,3,1,2,5,4,2,3,1]
VC=[3,1,4,2,3,2,1,3,4,2]; VD=[4,2,1,5,4,3,2,1,2,3]
def t_vectors():
    out=[]
    for i in range(10):
        a,b,c,d=VA[i],VB[i],VC[i],VD[i]
        if i%2==0: out.append((f"({a}; {b}) + ({c}; {d}) = ?", f"({a+c}; {b+d})",
                               [f"({a*c}; {b*d})", f"({a+d}; {b+c})", f"({a-c}; {b-d})"]))
        else: out.append((f"Скалярное произведение ({a}; {b}) · ({c}; {d})", a*c+b*d,
                          [a*c-b*d, a*d+b*c, a+b+c+d]))
    return out

def fact(n):
    r=1
    for i in range(2,n+1): r*=i
    return r
def C(n,k): return fact(n)//(fact(k)*fact(n-k))
CN=[5,4,6,3,7,8,4,6,9,10]; CK=[2,2,2,2,3,3,2,3,2,4]
def t_comb():
    out=[]
    for i in range(10):
        n,k=CN[i],CK[i]
        if i%2==0: out.append((f"C({n}, {k}) = ?", C(n,k), [C(n,k)+1, n*k, fact(n)//fact(k)]))
        else: out.append((f"{n}! = ?", fact(n), [fact(n-1), n*n, fact(n+1)]))
    return out

PT=[6,10,8,12,20,5,16,25,4,9]; PF=[1,3,2,4,5,2,6,10,1,3]
def t_prob():
    out=[]
    for i in range(10):
        t,f=PT[i],PF[i]
        out.append((f"Вероятность события: {f} благоприятных из {t}", round(f/t,3),
                    [round(t/f,3), round((t-f)/t,3), round(f/t/2,3)]))
    return out

SETS=[[1,3,5,7,9],[2,4,6,8],[3,3,5,7,7],[10,20,30,40],[1,2,2,3,5],[4,8,12],[5,5,5,9],[2,6,10,14,18],[1,4,9,16],[6,7,8,9,10]]
def t_stats():
    out=[]
    for i,s in enumerate(SETS):
        txt=", ".join(map(str,s))
        if i%3==0: out.append((f"Медиана ряда {txt}", sorted(s)[len(s)//2], [round(sum(s)/len(s),2), max(s), min(s)]))
        elif i%3==1: out.append((f"Среднее арифметическое {txt}", round(sum(s)/len(s),2), [max(s), min(s), sum(s)]))
        else: out.append((f"Размах ряда {txt}", max(s)-min(s), [max(s), sum(s), min(s)]))
    return out

PA=[2,3,1,4,5,2,6,1,3,7]; PD=[3,2,4,3,2,5,3,4,2,3]; PN=[5,7,4,9,5,6,3,8,6,10]
def t_prog():
    out=[]
    for i in range(10):
        a,d,n=PA[i],PD[i],PN[i]
        if i%2==0:
            v=a+(n-1)*d
            out.append((f"Арифметическая прогрессия: a₁ = {a}, d = {d}. Найдите a_{n}", v, [v+d, v-d, a*n]))
        else:
            m=n*10; s=m*(m+1)//2
            out.append((f"Сумма чисел от 1 до {m}", s, [m*(m+1), m, s//2]))
    return out

WV=[60,45,80,15,90,50,70,12,100,36]; WT=[2,3,1.5,4,2.5,3,2,5,1.5,2]
def t_word():
    out=[]
    for i in range(10):
        v,t=WV[i],WT[i]
        out.append((f"Скорость {v} км/ч, время {t:g} ч. Какой путь?", f"{v*t:g} км",
                    [f"{v+t:g} км", f"{v/t:g} км", f"{v*t*2:g} км"]))
    return out

MA=[5,3,7,2,9,4,6,8,1,10]
def t_mod():
    out=[]
    for i,a in enumerate(MA):
        if i%2==0: out.append((f"Решите: |x| = {a}", f"±{a}", [f"{a}", f"−{a}", "нет решений"]))
        else: out.append((f"|−{a}| + |{a+2}| = ?", 2*a+2, [a, 2*a, a+2]))
    return out

QA=[2,3,5,4,11,10,6,7,13,8]
def t_powers():
    out=[]
    for i,a in enumerate(QA):
        if i%2==0: out.append((f"√{a*a} = ?", a, [a+1, a*a, a*2]))
        else: out.append((f"{a}² · {a}³ = ?", a**5, [a**6, a**5*2, a**2]))
    return out

OA=[2,3,4,5,6,1,2,3,4,5]; OB=[1,2,3,1,2,3,4,1,2,3]
def t_poly():
    out=[]
    for i in range(10):
        a,b=OA[i],OB[i]
        if i%2==0: out.append((f"({a}x + {b})({a}x − {b}) = ?", f"{a*a}x² − {b*b}",
                               [f"{a*a}x² + {b*b}", f"{a}x² − {b*b}", f"{a*a}x² − {2*b}"]))
        else: out.append((f"x^{a} · x^{b} = ?", f"x^{a+b}", [f"x^{a*b}", f"2x^{a+b}", f"x^{a-b}"]))
    return out

PARAM=[("Уравнение ax = 5 не имеет корней при","a = 0",["a = 1","a = 5","любом a"]),
 ("x² = a имеет решения при","a ≥ 0",["a > 0","a < 0","любом a"]),
 ("ax + b = 0 имеет единственное решение при","a ≠ 0",["a = 0","b = 0","любых a и b"]),
 ("|x| = a не имеет корней при","a < 0",["a > 0","a = 0","любом a"]),
 ("x² + a = 0 имеет корни при","a ≤ 0",["a ≥ 0","a > 0","любом a"]),
 ("Уравнение 0·x = b не имеет корней при","b ≠ 0",["b = 0","любом b","b > 0"]),
 ("x² = a имеет ровно один корень при","a = 0",["a > 0","a < 0","любом a"]),
 ("ax = 0 имеет бесконечно много корней при","a = 0",["a = 1","a = −1","любом a"]),
 ("x² − a = 0 имеет два корня при","a > 0",["a = 0","a < 0","любом a"]),
 ("|x| = a имеет два корня при","a > 0",["a = 0","a < 0","любом a"])]
def t_param(): return PARAM

ES=[1000,2000,500,1500,800,3000,1200,2500,600,4000]; EP=[10,20,30,25,15,40,50,10,20,5]
def t_econ():
    return [(f"Вклад {ES[i]} ₽ под {EP[i]}% годовых. Сколько будет через год?", f"{ES[i]*(1+EP[i]/100):g} ₽",
             [f"{ES[i]*EP[i]/100:g} ₽", f"{ES[i]} ₽", f"{ES[i]*(1+2*EP[i]/100):g} ₽"]) for i in range(10)]

ON=[10,20,50,100,15,25,30,40,12,60]
def t_olymp():
    return [(f"1 + 2 + 3 + … + {n} = ?", n*(n+1)//2, [n*n, n*(n+1), n*(n-1)//2]) for n in ON]

TOPICS=[("percent","Проценты","%",t_percent()),("linear","Линейные уравнения","x",t_linear()),
 ("quadratic","Квадратные уравнения","x²",t_quadratic()),("inequalities","Неравенства","≥",t_ineq()),
 ("functions","Функции и графики","ƒ",t_functions()),("logarithms","Логарифмы","log",t_log()),
 ("exponential","Показательные уравнения","2ˣ",t_exp()),("trigonometry","Тригонометрия","sin",t_trig()),
 ("derivative","Производная","d/dx",t_deriv()),("integral","Интегралы","∫",t_integral()),
 ("triangles","Планиметрия: треугольники","△",t_triangles()),("circle","Планиметрия: окружность","◯",t_circle()),
 ("stereometry","Стереометрия","3D",t_stereo()),("vectors","Векторы","→",t_vectors()),
 ("combinatorics","Комбинаторика","n!",t_comb()),("probability","Теория вероятностей","P",t_prob()),
 ("statistics","Статистика","σ",t_stats()),("progressions","Прогрессии","Σ",t_prog()),
 ("word","Текстовые задачи","✎",t_word()),("modules","Модули","|x|",t_mod()),
 ("powers","Степени и корни","√",t_powers()),("polynomials","Многочлены","axⁿ",t_poly()),
 ("params","Задачи с параметром","λ",t_param()),("economics","Экономические задачи","₽",t_econ()),
 ("olympiad","Олимпиадные задачи","★",t_olymp())]

if __name__=="__main__":
    import json
    print(json.dumps(build("math", TOPICS), ensure_ascii=False))