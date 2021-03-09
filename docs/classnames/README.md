# How class names are generated

There are a few major factors that greatly impact how convenient and powerful
class names are for functional CSS libraries.

1. **Length** - shorter names are more convenient
2. **Predictable (or memorable)** - impractical to learn thousands of seemingly
   random class names
3. **Unambiguous** - New properties added in the future shouldn't result in
   clashes

Finding the intersection of all three of these objectives is not a simple task.

---

To illustrate the problem, consider different ways of generating class names.

### Idea 1: using the equivalent CSS

For example, `width: 100%` becomes `.width100%`

This solution is predictable and unambigious, but produces long class names when
concatenated with others.

### Idea 2: prefix with the first letter of properties

For example, `width: 100%` becomes `.w100%`, and `border-width: 2px` becomes
`.bw2`

This solution is short, predictable, but causes ambiguities (i.e. not resilient)

There aren't enough letters of the alphabet to go around:

```
c -> color,cursor,content,collapse,clear,count,clip,change,column,counter
m -> margin,max,min,mode
l -> left,line,letter,list,layout,linecap
b -> background,bottom,border,box,basis,break,backface
d -> display,decoration,direction,duration,delay
t -> top,text,transform,transition,timing,type,touch,table,tab
r -> right,radius,repeat,resize,rendering,reset
p -> padding,position,property,pointer,page,perspective
w -> width,white,weight,wrap,word,will,widows
h -> height,hyphens
f -> font,family,flex,float,function,fill,filter,fit
s -> size,style,space,sizing,shadow,shrink,select,spacing,stretch,self,stroke
o -> outline,overflow,opacity,origin,offset,order,orphans,object
a -> align,animation,appearance,attachment,action,after,adjust
v -> vertical,visibility,variant
g -> grow,gap
i -> index,image,items,iteration,inside,indent,increment
n -> name,numeric
```

This means that full properties clash frequently:

```
c  -> color,cursor,content,clear,clip
bs -> box-sizing,border-style,box-shadow,background-size,border-spacing
bc -> background-color,border-color,border-collapse,background-clip
```

And even some common full class names (including the value):

```
.bcWhite
 ??? border-color: white;
 ??? background-color: white;
```

### Idea 3: somewhere in the middle

There is potential for a short, predictable and unambiguous class name
algorithm; though I haven't found the holy grail yet.

---
