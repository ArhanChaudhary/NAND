a = """

"""

a = a.split("\n")
ret = []
for i in a:
    if i == '':
        continue
    ret.append(int(i, 2))
with open("out.txt", "w") as f:
    f.write(repr(ret))