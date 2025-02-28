# Stt

## Horloges

On peut passer les temps sous de nombreux formats et, à la base, le format : 

~~~
H:MM:SS   p.e. 1:23:45
~~~

Par commodité, on peut remplacer les deux points par des virgules "," (plus facile à taper).

~~~
H,MM,SS p.e 1,23,45
~~~

On peut aussi fournir l'horloge par un calcul sur les secondes.

~~~
12 * 5 + 3600
=> 1:01:00
~~~

On peut faire n'importe quelle opération d'ajout ou de retrait sur les horloges à l'aide de "+" ou de "-".

~~~
H:MM:SS + <valeur en secondes>
~~~

La valeur en secondes pour être un nombre :

~~~
1,23,45 + 12
=> 1:23:57

1,23,45 - 12
=> 1:23:33

~~~

… une opération arythmétique :

~~~
1,23,45 + 4 * 3600 + 12
=> 5:23:57
~~~

… une autre horloge :

~~~
1,23,45 + 4,0,12
=> 5:23:57
~~~

… une expression avec "s" pour secondes, "m" pour minutes et "h" pour heures :

~~~
1,23,45 + 12s 4h
=> 5:23:57
~~~
