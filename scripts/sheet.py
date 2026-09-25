#!/usr/bin/env python3
# Gabung beberapa PNG/JPG jadi satu lembar kontak berlabel: python3 scripts/sheet.py out.jpg img1.png img2.png ... [--cols=3] [--w=700]
import sys, os
from PIL import Image, ImageDraw
args=[a for a in sys.argv[1:] if not a.startswith('--')]; opts=dict(a[2:].split('=') for a in sys.argv[1:] if a.startswith('--'))
out=args[0]; files=args[1:]; cols=int(opts.get('cols',3)); w=int(opts.get('w',700))
ims=[]
for f in files:
    try: im=Image.open(f).convert('RGB')
    except Exception: im=Image.new('RGB',(w,int(w*0.57)),'grey')
    r=w/im.width; im=im.resize((w,int(im.height*r))); ims.append((os.path.basename(f),im))
h=max(im.height for _,im in ims)+18; rows=(len(ims)+cols-1)//cols
M=Image.new('RGB',(cols*w,rows*h),'white'); d=ImageDraw.Draw(M)
for k,(name,im) in enumerate(ims):
    x=(k%cols)*w; y=(k//cols)*h; M.paste(im,(x,y)); d.rectangle([x,y,x+len(name)*7+8,y+16],fill='black'); d.text((x+4,y+2),name,fill='white')
M.save(out,quality=85); print(out, M.size)
