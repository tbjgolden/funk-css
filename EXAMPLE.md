```
%breakpoints: 600 800 1000 1200
%pseudo: full // | abbreviated | no | split

scale =px 0 1 2 3 [4 8 16..1024] [6 12 24..1536] 11111111 50% 100% 100vh 100vw
scale-with-negative =px {scale} -1 -2 -3 [-4 -8 -16..-1024] [-6 -12 -24..-1536] -11111111 -50% -100% -100vh -100vw
overflow = hidden scroll auto visible
headerTypeScale =px 64 48 32
copyTypeScale =px 24 16 12

@import https://gist.githubusercontent.com/tbjgolden/3277a380d335803632765c2647c1a028/raw/f9300f4910c1a517820c87c0136cd593c07c13b8/hard-reset.css

/* jjj */

[width height top left down right]: {scale}
color: {colors}
background-color: {colors}
font-size: {headerTypeScale}; line-height: 1.2
font-size: {copyTypeScale}; line-height: 1.3
padding: {scale}
padding-{direction}: {scale}
background-position: "{xLoc} {yLoc}"
border-{direction}: "{scale} solid {colors}"
flex: "[0 1 auto] [0 1 auto] [0 auto]"
overflow: "{overflow} {overflow}"
display: inline block flex none inline-block inline-flex
text-decoration: line-through underline none
font-style: italic normal
line-height: 1 1.2 1.3
font-weight: 400 600 700
margin: {scale-with-negative}
margin-{direction}: {scale-with-negative}
```
