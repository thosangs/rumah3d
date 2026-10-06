# Bangun set furnitur modern (gaya render DED) di Blender headless → GLB per item ke models/furniture/bl_*.glb
# Jalankan: /Applications/Blender.app/Contents/MacOS/Blender -b -P scripts/blender/build_furniture.py -- models/furniture
# Konvensi: satuan meter, alas di z=0, DEPAN menghadap -Y (glTF: +Z), pusat di x=0 / y=0 (kecuali disebut).
import bpy, bmesh, sys, os, math
from mathutils import Vector

OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else 'models/furniture'
os.makedirs(OUT, exist_ok=True)

def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)

_mats = {}
def mat(name, rgb, rough=0.8, metal=0.0, emit=None, emit_str=0.0):
    key = (name)
    if key in _mats: return _mats[key]
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']
    b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal
    if emit:
        b.inputs['Emission Color'].default_value = (*emit, 1); b.inputs['Emission Strength'].default_value = emit_str
    _mats[key] = m; return m

def srgb(hexstr):
    h = hexstr.lstrip('#'); r, g, b = (int(h[i:i+2], 16) / 255 for i in (0, 2, 4))
    lin = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    return (lin(r), lin(g), lin(b))

M = {}
def mats():
    M.clear()
    M['fabricGrey'] = mat('fabricGrey', srgb('#6f6b68'), 1.0)
    M['fabricGrey2'] = mat('fabricGrey2', srgb('#7e7a76'), 1.0)
    M['fabricBeige'] = mat('fabricBeige', srgb('#c9b79d'), 1.0)
    M['fabricCream'] = mat('fabricCream', srgb('#dbd0be'), 1.0)
    M['fabricDark'] = mat('fabricDark', srgb('#3a3734'), 1.0)
    M['fabricTaupe'] = mat('fabricTaupe', srgb('#9a8f82'), 1.0)
    M['white'] = mat('white', srgb('#f4f2ed'), 0.35)
    M['cream'] = mat('cream', srgb('#eae3d5'), 0.5)
    M['walnut'] = mat('walnut', srgb('#6a4a30'), 0.45)
    M['walnutDark'] = mat('walnutDark', srgb('#4e3624'), 0.5)
    M['black'] = mat('black', srgb('#151617'), 0.4, 0.6)
    M['blackMatte'] = mat('blackMatte', srgb('#1f2022'), 0.8)
    M['marble'] = mat('marble', srgb('#2a2c30'), 0.18)
    M['linen'] = mat('linen', srgb('#f6f3ee'), 1.0)
    M['duvetStripe'] = mat('duvetStripe', srgb('#d9d6d0'), 1.0)
    M['screen'] = mat('screen', srgb('#0a0b0d'), 0.15, 0.2, emit=srgb('#141a24'), emit_str=0.4)
    M['led'] = mat('led', srgb('#ffe2b0'), 1.0, 0.0, emit=srgb('#ffc772'), emit_str=3.0)
    M['mirror'] = mat('mirror', srgb('#dfe6ec'), 0.05, 1.0)
    M['chrome'] = mat('chrome', srgb('#bfc3c7'), 0.25, 1.0)
    M['curtain'] = mat('curtain', srgb('#55575b'), 1.0)
    M['curtainCream'] = mat('curtainCream', srgb('#c9bfae'), 1.0)

def box(name, sx, sy, sz, x=0, y=0, z=0, m=None, bevel=0.0, seg=3, subsurf=0):
    """kotak ukuran penuh (sx,sy,sz) dengan pusat (x,y,z); bevel = lebar bevel (m)"""
    bpy.ops.mesh.primitive_cube_add(size=1, location=(x, y, z))
    o = bpy.context.active_object; o.name = name; o.scale = (sx, sy, sz)
    bpy.ops.object.transform_apply(scale=True)
    if m: o.data.materials.append(m)
    if bevel > 0:
        bv = o.modifiers.new('Bevel', 'BEVEL'); bv.width = min(bevel, min(sx, sy, sz) * 0.45); bv.segments = seg; bv.limit_method = 'ANGLE'; bv.harden_normals = False
    if subsurf > 0:
        ss = o.modifiers.new('Subsurf', 'SUBSURF'); ss.levels = subsurf; ss.render_levels = subsurf
    bpy.ops.object.shade_smooth()
    return o

def cyl(name, r, h, x=0, y=0, z=0, m=None, verts=32, r2=None):
    if r2 is None:
        bpy.ops.mesh.primitive_cylinder_add(radius=r, depth=h, vertices=verts, location=(x, y, z))
    else:
        bpy.ops.mesh.primitive_cone_add(radius1=r, radius2=r2, depth=h, vertices=verts, location=(x, y, z))
    o = bpy.context.active_object; o.name = name
    if m: o.data.materials.append(m)
    bpy.ops.object.shade_smooth()
    return o

def torus(name, R, r, x=0, y=0, z=0, m=None, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, location=(x, y, z), rotation=rot, major_segments=64, minor_segments=12)
    o = bpy.context.active_object; o.name = name
    if m: o.data.materials.append(m)
    bpy.ops.object.shade_smooth(); return o

def export(name):
    for o in bpy.data.objects: o.select_set(True)
    path = os.path.join(OUT, f'bl_{name}.glb')
    bpy.ops.export_scene.gltf(filepath=path, export_format='GLB', use_selection=True, export_apply=True, export_yup=True, export_texcoords=True, export_normals=True, export_materials='EXPORT', export_cameras=False, export_lights=False)
    print('EXPORT', path, round(os.path.getsize(path) / 1024), 'KB')

def start():
    clear(); _mats.clear(); mats()

# ---------------------------------------------------------------------------
def sofa_l(mirror=False):
    start()
    L, D, H = 2.6, 0.9, 0.42
    box('base', L, D, 0.14, 0, 0, 0.25, M['fabricGrey'], bevel=0.03)
    for i in range(3):
        cx = -L / 2 + L / 6 + i * L / 3
        box(f'seat{i}', L / 3 - 0.04, D - 0.24, 0.16, cx, 0.08, 0.40, M['fabricGrey2'], bevel=0.06, seg=4, subsurf=1)
        box(f'back{i}', L / 3 - 0.06, 0.16, 0.36, cx, D / 2 - 0.26, 0.64, M['fabricGrey2'], bevel=0.06, seg=4, subsurf=1)
    box('backframe', L, 0.2, 0.52, 0, D / 2 - 0.1, 0.58, M['fabricGrey'], bevel=0.03)
    box('armL', 0.2, D, 0.5, -L / 2 + 0.1, 0, 0.53, M['fabricGrey'], bevel=0.04)
    # chaise di ujung kanan (+x), menjorok ke depan (-y)
    CH = 0.75
    box('chaiseBase', 0.9, CH, 0.14, L / 2 - 0.45, -D / 2 - CH / 2, 0.25, M['fabricGrey'], bevel=0.03)
    box('chaiseSeat', 0.84, CH - 0.04, 0.16, L / 2 - 0.45, -D / 2 - CH / 2, 0.40, M['fabricGrey2'], bevel=0.06, seg=4, subsurf=1)
    box('armR', 0.2, D + CH, 0.5, L / 2 - 0.1, -CH / 2, 0.53, M['fabricGrey'], bevel=0.04)
    for (x, y) in [(-L / 2 + 0.15, D / 2 - 0.12), (L / 2 - 0.15, D / 2 - 0.12), (-L / 2 + 0.15, -D / 2 + 0.12), (L / 2 - 0.15, -D / 2 - CH + 0.12)]:
        cyl('leg', 0.018, 0.18, x, y, 0.09, M['black'], 12)
    export('sofa_l')

def bed(name, w, l, style):
    start()
    # headboard di +y (tembok), kasur memanjang ke -y; alas di y = 0 (tembok) → kasur y ∈ [-l, 0]
    yc = -l / 2
    frameM = M['fabricDark'] if style == 'dark' else (M['walnut'] if style == 'walnut' else M['fabricBeige'])
    box('platform', w + 0.1, l + 0.06, 0.24, 0, yc, 0.12, frameM, bevel=0.02)
    box('mattress', w, l - 0.04, 0.24, 0, yc, 0.36, M['linen'], bevel=0.08, seg=4)
    duvetM = M['fabricDark'] if style == 'dark' else (M['fabricTaupe'] if style == 'walnut' else M['duvetStripe'])
    dv = box('duvet', w + 0.04, l * 0.62, 0.08, 0, -l + l * 0.31, 0.51, duvetM, bevel=0.035, seg=4, subsurf=1)
    box('duvetDrop', w + 0.04, 0.05, 0.16, 0, -l - 0.01, 0.42, duvetM, bevel=0.02)
    for sx in (-1, 1):
        p = box('pillow', w * 0.42, 0.48, 0.15, sx * w * 0.24, -0.34, 0.55, M['linen'], bevel=0.06, seg=4, subsurf=2)
        p.rotation_euler.x = math.radians(-18)
        if style == 'beige':
            p2 = box('pillow2', w * 0.34, 0.32, 0.12, sx * w * 0.24, -0.5, 0.6, M['fabricDark'], bevel=0.05, seg=4, subsurf=2); p2.rotation_euler.x = math.radians(-25)
    if style == 'beige':
        hb = w + 0.2
        for i in range(6):
            box(f'hb{i}', hb / 6 - 0.02, 0.08, 1.15, -hb / 2 + hb / 12 + i * hb / 6, 0.04, 0.6 + 0.575, M['fabricBeige'], bevel=0.03, seg=4, subsurf=1)
    elif style == 'dark':
        box('hb', w + 0.4, 0.07, 0.5, 0, 0.035, 0.5, M['fabricDark'], bevel=0.03, seg=3)
        pw = w + 0.6
        box('slatBack', pw, 0.03, 0.9, 0, 0.03, 1.55, M['walnutDark'])
        n = int(pw / 0.05)
        for i in range(n):
            box(f'slat{i}', 0.025, 0.03, 0.9, -pw / 2 + 0.025 + i * (pw / n), 0.005, 1.55, M['walnut'], bevel=0.005, seg=2)
        box('ledTop', pw, 0.02, 0.015, 0, 0.02, 2.005, M['led']); box('ledBot', pw, 0.02, 0.015, 0, 0.02, 1.095, M['led'])
    else:  # walnut
        hw = w + 0.6
        for i in range(3):
            box(f'hb{i}', hw / 3 - 0.02, 0.06, 1.2, -hw / 2 + hw / 6 + i * hw / 3, 0.03, 1.0, M['walnutDark'] if i == 1 else M['walnut'], bevel=0.01, seg=2)
        for i in range(4):
            box(f'hbTop{i}', hw / 4 - 0.02, 0.06, 0.9, -hw / 2 + hw / 8 + i * hw / 4, 0.03, 2.05, M['cream'] if i % 2 else M['white'], bevel=0.01, seg=2)
    export(name)

def wardrobe(name, w, h, d, mname, doors, mirror=False, curved=False):
    start(); m = M[mname]
    # depan di -y; belakang (tembok) di y=+d/2
    box('body', w, d, h, 0, 0, h / 2, m, bevel=0.01, seg=2)
    dw = w / doors
    for i in range(doors):
        cx = -w / 2 + dw / 2 + i * dw
        box(f'door{i}', dw - 0.012, 0.02, h - 0.06, cx, -d / 2 - 0.005, h / 2, m, bevel=0.006, seg=2)
        cyl(f'handle{i}', 0.008, 0.28, cx + (0.1 if i % 2 == 0 else -0.1), -d / 2 - 0.03, h * 0.45, M['blackMatte'], 12)
    if mirror:
        box('mirror', dw - 0.1, 0.01, h - 0.4, -w / 2 + dw / 2, -d / 2 - 0.02, h / 2, M['mirror'])
    if curved:
        c = cyl('curve', d / 2, h, w / 2, 0, h / 2, M['walnut'], 48)
    export(name)

def desk(name, w, d, topName, frameName):
    start(); topM = M[topName]; frameM = M[frameName]
    box('top', w, d, 0.04, 0, 0, 0.74, topM, bevel=0.008, seg=2)
    for sx in (-1, 1):
        box('legFrame', 0.04, d - 0.08, 0.72, sx * (w / 2 - 0.04), 0, 0.36, frameM, bevel=0.004, seg=2)
        box('legFoot', 0.04, d - 0.08, 0.04, sx * (w / 2 - 0.04), 0, 0.02, frameM)
    box('apron', w - 0.16, 0.04, 0.06, 0, d / 2 - 0.06, 0.69, frameM)
    export(name)

def vanity():
    start()
    # meja rias krem + laci walnut, cermin bundar di panel; tembok di +y
    box('top', 1.0, 0.45, 0.04, 0, 0, 0.74, M['cream'], bevel=0.01, seg=3)
    box('drawer', 0.96, 0.4, 0.12, 0, 0, 0.66, M['walnut'], bevel=0.006, seg=2)
    box('legPanel', 0.04, 0.42, 0.6, 0.47, 0, 0.3, M['walnut'])
    box('legPanel2', 0.04, 0.42, 0.6, -0.47, 0, 0.3, M['walnut'])
    m = cyl('mirror', 0.36, 0.015, 0, 0.19, 1.55, M['mirror'], 64); m.rotation_euler.x = math.radians(90)
    t = torus('rim', 0.365, 0.02, 0, 0.185, 1.55, M['walnut'], rot=(math.radians(90), 0, 0))
    export('vanity')

def office_chair():
    start()
    box('seat', 0.48, 0.48, 0.08, 0, 0, 0.5, M['blackMatte'], bevel=0.035, seg=4, subsurf=1)
    b = box('back', 0.46, 0.07, 0.58, 0, 0.22, 0.85, M['blackMatte'], bevel=0.03, seg=4, subsurf=1); b.rotation_euler.x = math.radians(-6)
    cyl('lift', 0.025, 0.42, 0, 0, 0.25, M['chrome'], 16)
    cyl('hub', 0.05, 0.04, 0, 0, 0.06, M['black'], 16)
    for i in range(5):
        a = i * 2 * math.pi / 5
        arm = box('arm', 0.3, 0.035, 0.03, math.cos(a) * 0.15, math.sin(a) * 0.15, 0.045, M['black'], bevel=0.01, seg=2); arm.rotation_euler.z = a
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.028, location=(math.cos(a) * 0.29, math.sin(a) * 0.29, 0.028)); w = bpy.context.active_object; w.data.materials.append(M['black']); bpy.ops.object.shade_smooth()
    for sx in (-1, 1):
        box('armrest', 0.05, 0.3, 0.02, sx * 0.26, 0.02, 0.72, M['black'], bevel=0.008, seg=2)
        box('armpost', 0.03, 0.03, 0.2, sx * 0.26, 0.1, 0.62, M['black'])
    export('office_chair')

def dining_table():
    start()
    box('top', 1.4, 0.75, 0.03, 0, 0, 0.745, M['marble'], bevel=0.004, seg=2)
    box('topEdge', 1.4, 0.75, 0.012, 0, 0, 0.724, M['black'])  # bibir hitam tipis di bawah top
    t = 0.035
    for sx in (-1, 1):
        for sy in (-1, 1):
            box('leg', t, t, 0.72, sx * (0.7 - t / 2 - 0.02), sy * (0.375 - t / 2 - 0.02), 0.36, M['black'])
        box('apronShort', t, 0.67, t, sx * (0.7 - t / 2 - 0.02), 0, 0.72 - t / 2 - 0.012, M['black'])
        box('sledLong', 1.52, t, t, 0, sy * 0, 0.02, M['black']) if False else None
    for sy in (-1, 1):
        box('apronLong', 1.32, t, t, 0, sy * (0.375 - t / 2 - 0.02), 0.72 - t / 2 - 0.012, M['black'])
        box('stretcher', 1.32, t, t, 0, sy * (0.375 - t / 2 - 0.02), 0.06, M['black'])  # rangka bawah (sled)
    export('dining_table')

def tv():
    start()
    box('panel', 1.46, 0.03, 0.84, 0, 0.015, 0.42, M['black'], bevel=0.004, seg=2)
    box('screen', 1.42, 0.005, 0.8, 0, -0.002, 0.42, M['screen'])
    export('tv65')

def tv_console():
    start()
    box('body', 2.4, 0.42, 0.28, 0, 0, 0.14, M['walnut'], bevel=0.012, seg=3)
    for i in range(3):
        box(f'groove{i}', 2.4 * 0.32, 0.005, 0.008, -0.8 + i * 0.8, -0.212, 0.14, M['walnutDark'])
    box('led', 2.3, 0.3, 0.01, 0, -0.02, -0.004, M['led'])
    export('tv_console')

def curtain(name, mname, w=2.0, h=2.9):
    start(); m = M[mname]
    # kain berlipat: grid + gelombang sinus, ditebalkan
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=int(w * 40), y_subdivisions=8, size=1)
    o = bpy.context.active_object; o.name = name; o.scale = (w, h, 1); bpy.ops.object.transform_apply(scale=True)
    o.rotation_euler.x = math.radians(90); bpy.ops.object.transform_apply(rotation=True)
    bm = bmesh.new(); bm.from_mesh(o.data)
    for v in bm.verts:
        v.co.y = -(math.sin(v.co.x * 22) * 0.05 + 0.06)
        v.co.z += h / 2
    bm.to_mesh(o.data); bm.free()
    o.data.materials.append(m)
    so = o.modifiers.new('Solidify', 'SOLIDIFY'); so.thickness = 0.01
    bpy.ops.object.shade_smooth()
    box('rail', w + 0.1, 0.14, 0.05, 0, -0.06, h + 0.03, M['blackMatte'], bevel=0.008, seg=2)
    export(name)

def nightstand_float():
    start()
    box('body', 0.42, 0.4, 0.18, 0, 0, 0.5, M['white'], bevel=0.01, seg=3)
    box('groove', 0.36, 0.005, 0.006, 0, -0.2, 0.5, M['blackMatte'])
    export('nightstand_float')

def sideboard():
    start()
    box('bodyL', 0.9, 0.45, 0.8, -0.35, 0, 0.4, M['walnut'], bevel=0.01, seg=2)
    box('bodyR', 0.7, 0.45, 0.8, 0.45, 0, 0.4, M['cream'], bevel=0.01, seg=2)
    cyl('curve', 0.225, 0.8, 0.8, 0, 0.4, M['cream'], 48)
    for i in range(1, 3):
        box(f'g{i}', 0.86, 0.005, 0.006, -0.35, -0.226, 0.8 * i / 3, M['walnutDark'])
    export('sideboard')

def wall_panels():
    start()
    w, h = 4.8, 2.95
    n = 4; pw = (w - 0.6) / n
    for i in range(n):
        box(f'p{i}', pw - 0.02, 0.03, h - 0.2, -w / 2 + 0.3 + pw / 2 + i * pw, -0.015, 0.1 + (h - 0.2) / 2, M['cream'] if i % 2 else M['white'], bevel=0.008, seg=2)
    box('wl', 0.3, 0.05, h, -w / 2 + 0.15, -0.025, h / 2, M['walnut'], bevel=0.006, seg=2)
    box('wr', 0.3, 0.05, h, w / 2 - 0.15, -0.025, h / 2, M['walnut'], bevel=0.006, seg=2)
    export('wall_panels')

def tv_wall():
    start()
    # panel krem utama + panel taupe + LED, depan di -y, tembok di y=0
    w, h = 2.8, 3.0
    box('panelMain', w * 0.62, 0.06, h - 0.3, -w * 0.05, -0.04, 0.15 + (h - 0.3) / 2, M['cream'], bevel=0.01, seg=2)
    box('panelL', w * 0.2, 0.06, h - 0.9, -w * 0.4, -0.02, 0.5 + (h - 0.9) / 2, M['fabricTaupe'], bevel=0.01, seg=2)
    box('panelR', w * 0.14, 0.06, h - 1.4, w * 0.36, -0.02, 0.9 + (h - 1.4) / 2, M['fabricTaupe'], bevel=0.01, seg=2)
    box('ledMain', w * 0.66, 0.01, h - 0.24, -w * 0.05, -0.005, 0.12 + (h - 0.24) / 2, M['led'])
    box('shelf', w * 0.5, 0.18, 0.03, -w * 0.15, -0.16, 0.70, M['black'], bevel=0.005, seg=2)
    export('tv_wall')

def dining_chair():
    start()
    tan = mat('fabricTan', srgb('#c8a67c'), 1.0)
    box('seat', 0.46, 0.46, 0.09, 0, 0, 0.455, tan, bevel=0.045, seg=5, subsurf=2)
    b = box('back', 0.44, 0.07, 0.42, 0, 0.2, 0.73, tan, bevel=0.035, seg=5, subsurf=2); b.rotation_euler.x = math.radians(-7)
    box('backJoin', 0.3, 0.05, 0.08, 0, 0.19, 0.5, tan, bevel=0.02, seg=3)
    for (x, y) in [(-0.19, -0.19), (0.19, -0.19), (-0.19, 0.2), (0.19, 0.2)]:
        l = cyl('leg', 0.009, 0.43, x, y, 0.215, M['black'], 8); l.rotation_euler.x = math.radians(4 if y < 0 else -4)
    export('dining_chair')

def armchair_cream():
    start()
    cyl('seatBase', 0.4, 0.3, 0, 0, 0.3, M['fabricCream'], 48, r2=0.38)
    c = cyl('cushion', 0.36, 0.08, 0, 0, 0.49, M['fabricBeige'], 48)
    # sandaran melengkung: torus terpotong → pakai silinder berongga setengah lingkaran (boolean sederhana: dua silinder)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.42, depth=0.42, vertices=64, location=(0, 0, 0.66)); outer = bpy.context.active_object
    bpy.ops.mesh.primitive_cylinder_add(radius=0.34, depth=0.5, vertices=64, location=(0, 0, 0.66)); inner = bpy.context.active_object
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, -0.45, 0.66)); cut = bpy.context.active_object; cut.scale = (0.6, 0.5, 0.6)
    m1 = outer.modifiers.new('inner', 'BOOLEAN'); m1.object = inner; m1.operation = 'DIFFERENCE'
    m2 = outer.modifiers.new('cut', 'BOOLEAN'); m2.object = cut; m2.operation = 'DIFFERENCE'
    bpy.context.view_layer.objects.active = outer
    for mod in list(outer.modifiers): bpy.ops.object.modifier_apply(modifier=mod.name)
    bpy.data.objects.remove(inner); bpy.data.objects.remove(cut)
    outer.data.materials.append(M['fabricCream']); bv = outer.modifiers.new('Bevel', 'BEVEL'); bv.width = 0.03; bv.segments = 3
    bpy.ops.object.shade_smooth()
    cyl('foot', 0.22, 0.15, 0, 0, 0.075, M['black'], 32, r2=0.26)
    export('armchair_cream')

def round_table(name, r, h):
    start()
    cyl('top', r, 0.035, 0, 0, h - 0.0175, M['blackMatte'], 64)
    cyl('stem', 0.06, h - 0.035, 0, 0, (h - 0.035) / 2, M['blackMatte'], 32, r2=r * 0.55)
    export(name)

def ring_pendant():
    start()
    # titik nol = plafon; menggantung ke -z
    cyl('canopy', 0.06, 0.03, 0, 0, -0.015, M['blackMatte'], 32)
    for (R, z) in [(0.45, -0.65), (0.33, -0.37), (0.22, -0.15)]:
        t = torus('ring', R, 0.014, 0, 0, z, M['chrome'], rot=(math.radians(8), 0, 0)); t.data.materials[0] = mat('brass', srgb('#b8925a'), 0.3, 0.9)
        torus('ringLed', R, 0.007, 0, 0, z - 0.012, M['led'], rot=(math.radians(8), 0, 0))
        cyl('wire', 0.002, -z, R * 0.7, 0, z / 2, M['blackMatte'], 6)
    export('ring_pendant')

def molecule_pendant():
    start()
    brass = mat('brass', srgb('#b8925a'), 0.3, 0.9)
    cyl('canopy', 0.05, 0.03, 0, 0, -0.015, brass, 32)
    cyl('rod', 0.006, 1.1, 0, 0, -0.55, brass, 8)
    box('bar', 1.1, 0.02, 0.02, 0, 0, -1.1, brass)
    for i in range(6):
        x = -0.5 + i * 0.2; dz = 0.16 if i % 2 else -0.16
        cyl('stem', 0.006, 0.16, x, 0, -1.1 + dz / 2, brass, 8)
        bpy.ops.mesh.primitive_uv_sphere_add(radius=0.06, location=(x, 0, -1.1 + dz)); s = bpy.context.active_object; s.data.materials.append(mat('bulb', srgb('#fff6e6'), 1, 0, emit=srgb('#ffe9c4'), emit_str=4)); bpy.ops.object.shade_smooth()
    export('molecule_pendant')

def concrete_pot():
    start()
    grey = mat('concrete', srgb('#8a8783'), 0.9)
    cyl('pot', 0.3, 0.62, 0, 0, 0.31, grey, 48, r2=0.24)
    cyl('soil', 0.27, 0.02, 0, 0, 0.61, mat('soil', srgb('#3b2f26'), 1.0), 48)
    export('concrete_pot')


def glass(name, rgb, alpha, rough=0.08):
    m = mat(name, rgb, rough, 0.0)
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Alpha'].default_value = alpha
    if hasattr(m, 'surface_render_method'): m.surface_render_method = 'BLENDED'
    else: m.blend_method = 'BLEND'
    return m

def mcb_box():
    """Box MCB 4 group (gaya Schneider Domae): punggung di y=0, menonjol ke -Y, pusat vertikal z=0."""
    start()
    white = mat('boxWhite', srgb('#f1f0eb'), 0.35)
    dark = mat('mcbDark', srgb('#2d2f33'), 0.5)
    lever = mat('mcbLever', srgb('#d9dbde'), 0.45)
    rail = mat('dinRail', srgb('#9a9ea3'), 0.4, 0.8)
    smoke = glass('smoke', srgb('#2b3139'), 0.35)
    W, D, H, t = 0.20, 0.065, 0.13, 0.006
    box('back', W, 0.004, H, 0, -0.002, 0, white)
    box('sideL', t, D, H, -W / 2 + t / 2, -D / 2, 0, white, bevel=0.002)
    box('sideR', t, D, H, W / 2 - t / 2, -D / 2, 0, white, bevel=0.002)
    box('top', W, D, t, 0, -D / 2, H / 2 - t / 2, white, bevel=0.002)
    box('bot', W, D, t, 0, -D / 2, -H / 2 + t / 2, white, bevel=0.002)
    box('rail', 0.11, 0.008, 0.035, 0, -0.012, 0, rail)
    for i in range(4):
        x = -0.027 + i * 0.018
        box(f'mcb{i}', 0.0175, 0.045, 0.08, x, -0.0325, 0, dark, bevel=0.001)
        box(f'lever{i}', 0.008, 0.01, 0.018, x, -0.058, 0.014, lever, bevel=0.001)  # tuas ON (ke atas)
    box('window', W - 2 * t - 0.002, 0.003, H - 2 * t - 0.002, 0, -(D - 0.0015), 0, smoke)
    box('handle', 0.03, 0.006, 0.006, W / 2 - 0.03, -(D + 0.003), -H / 2 + 0.018, white, bevel=0.002)
    export('mcb_box')

def kwh_meter():
    """kWh meter prabayar PLN (gaya Itron/Hexing): punggung di y=0, menonjol ke -Y, pusat vertikal z=0."""
    start()
    cream = mat('meterCream', srgb('#e9e7df'), 0.4)
    dark = mat('meterDark', srgb('#3a3c40'), 0.5)
    lcd = mat('lcd', srgb('#5f6b57'), 0.3, 0.0, emit=srgb('#8fa07e'), emit_str=0.35)
    key = mat('key', srgb('#cfd1d3'), 0.5)
    red = mat('ledRed', srgb('#c62c24'), 0.4, 0.0, emit=srgb('#ff3b2e'), emit_str=1.5)
    W, D, H = 0.15, 0.075, 0.22
    box('body', W, D, H, 0, -D / 2, 0.01, cream, bevel=0.006, seg=3)
    box('lcd', 0.075, 0.004, 0.028, 0, -D - 0.001, 0.062, lcd, bevel=0.001)
    box('lcdFrame', 0.085, 0.003, 0.038, 0, -D - 0.0005, 0.062, dark, bevel=0.001)
    for r in range(4):
        for c in range(3):
            box(f'key{r}{c}', 0.013, 0.004, 0.011, -0.02 + c * 0.02, -D - 0.001, 0.025 - r * 0.018, key, bevel=0.001)
    cyl('led', 0.003, 0.003, 0.055, -D - 0.0015, 0.095, red, 12)
    box('terminal', W - 0.01, D - 0.01, 0.045, 0, -(D - 0.01) / 2, -H / 2 - 0.0125, dark, bevel=0.004)  # tutup terminal bawah
    box('plate', 0.06, 0.002, 0.014, 0, -D - 0.001, 0.09, dark, bevel=0.001)  # label PLN
    export('kwh_meter')

def sconce():
    """Lampu sorot/dinding outdoor LED hitam (up-down): punggung di y=0, menonjol ke -Y, pusat vertikal z=0."""
    start()
    blk = mat('sconceBlack', srgb('#1b1c1e'), 0.55, 0.2)
    led = mat('ledWarm', srgb('#fff1d6'), 1.0, 0.0, emit=srgb('#ffd9a0'), emit_str=4.0)
    box('body', 0.07, 0.085, 0.11, 0, -0.0425, 0, blk, bevel=0.006, seg=3)
    box('bracket', 0.05, 0.012, 0.06, 0, -0.006, 0, blk)
    cyl('lensUp', 0.024, 0.004, 0, -0.05, 0.0555, led, 24)
    cyl('lensDown', 0.024, 0.004, 0, -0.05, -0.0555, led, 24)
    export('sconce')

def ac_indoor():
    """Unit AC indoor split 0.85×0.29×0.21 (gaya Daikin/Panasonic putih): punggung di y=0, menonjol ke -Y, pusat vertikal z=0."""
    start()
    white = mat('acWhite', srgb('#f4f4f1'), 0.3)
    grey = mat('acGrey', srgb('#9c9fa3'), 0.5)
    dark = mat('acDark', srgb('#2a2c2f'), 0.6)
    box('body', 0.85, 0.21, 0.29, 0, -0.105, 0, white, bevel=0.03, seg=4, subsurf=1)
    box('louver', 0.72, 0.03, 0.035, 0, -0.205, -0.10, grey, bevel=0.01)
    box('slit', 0.74, 0.01, 0.012, 0, -0.212, -0.062, dark)
    box('display', 0.06, 0.004, 0.02, 0.3, -0.212, -0.02, dark)
    export('ac_indoor')

def water_heater():
    """Water heater listrik tangki 15 L (gaya Ariston Andris, 0.36×0.36×0.40): punggung di y=0, menonjol ke -Y, pusat vertikal z=0."""
    start()
    white = mat('whWhite', srgb('#f3f3f0'), 0.3)
    dark = mat('whDark', srgb('#2b2d30'), 0.5)
    chrome = M['chrome']
    box('tank', 0.36, 0.35, 0.40, 0, -0.175, 0, white, bevel=0.05, seg=5, subsurf=1)
    box('panel', 0.14, 0.004, 0.05, 0, -0.352, -0.09, dark, bevel=0.004)
    cyl('knob', 0.018, 0.006, 0.09, -0.355, -0.09, dark, 24)
    for x in (-0.05, 0.05):
        c = cyl('pipe', 0.008, 0.06, x, -0.12, -0.23, chrome, 12)
    box('bracket', 0.30, 0.012, 0.03, 0, -0.006, 0.15, dark)
    export('water_heater')

def closet_duduk():
    """Kloset duduk monoblok (gaya TOTO CW421): tangki di belakang, punggung tangki di y=0 (tembok), menonjol ke -Y; alas z=0."""
    start()
    white = mat('sanWhite', srgb('#f4f4f2'), 0.12)
    dark = mat('seatDark', srgb('#2a2b2d'), 0.5)
    chrome = M['chrome']
    box('tank', 0.40, 0.17, 0.36, 0, -0.095, 0.56, white, bevel=0.03, seg=4, subsurf=1)
    box('tankLid', 0.42, 0.19, 0.03, 0, -0.095, 0.755, white, bevel=0.01, seg=3)
    cyl('flush', 0.02, 0.012, 0.12, -0.085, 0.766, chrome, 24)
    box('pedestal', 0.36, 0.44, 0.40, 0, -0.40, 0.20, white, bevel=0.06, seg=5, subsurf=2)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.19, depth=0.12, vertices=48, location=(0, -0.44, 0.38)); b = bpy.context.active_object; b.name = 'bowl'; b.scale = (1.0, 1.25, 1.0); bpy.ops.object.transform_apply(scale=True); b.data.materials.append(white); bpy.ops.object.shade_smooth()
    bpy.ops.mesh.primitive_cylinder_add(radius=0.19, depth=0.03, vertices=48, location=(0, -0.44, 0.43)); st = bpy.context.active_object; st.name = 'seat'; st.scale = (1.0, 1.25, 1.0); bpy.ops.object.transform_apply(scale=True); st.data.materials.append(white); bpy.ops.object.shade_smooth()
    box('lidHinge', 0.30, 0.04, 0.02, 0, -0.20, 0.445, dark, bevel=0.005)
    export('closet_duduk')

def closet_jongkok():
    """Kloset jongkok keramik (0.50×0.60): plat dengan pijakan & lubang; pusat di origin, alas z=0, tinggi 0.06; sisi belakang (lubang) ke +Y."""
    start()
    white = mat('sanWhite', srgb('#f1f1ef'), 0.15)
    dark = mat('drainDark', srgb('#45484c'), 0.4)
    box('plate', 0.50, 0.60, 0.06, 0, 0, 0.03, white, bevel=0.015, seg=3)
    for sx in (-1, 1):
        box('foot', 0.16, 0.30, 0.02, sx * 0.16, -0.05, 0.07, white, bevel=0.008, seg=3)
    box('trough', 0.14, 0.42, 0.012, 0, 0.02, 0.055, dark)
    cyl('hole', 0.045, 0.02, 0, 0.17, 0.052, dark, 24)
    export('closet_jongkok')

def washbasin():
    """Wastafel gantung kecil 0.45×0.38 + kran: punggung di y=0 (tembok), menonjol ke -Y; bibir atas di z=0 (pasang pada y 0.80–0.85)."""
    start()
    white = mat('sanWhite', srgb('#f4f4f2'), 0.12)
    chrome = M['chrome']
    box('basin', 0.45, 0.38, 0.14, 0, -0.19, -0.07, white, bevel=0.05, seg=5, subsurf=1)
    box('bowl', 0.33, 0.24, 0.10, 0, -0.21, -0.045, mat('bowlIn', srgb('#e6e8e8'), 0.1), bevel=0.04, seg=4, subsurf=1)
    cyl('tap', 0.012, 0.14, 0, -0.05, 0.07, chrome, 16)
    c = cyl('spout', 0.009, 0.10, 0, -0.10, 0.13, chrome, 12); c.rotation_euler.x = math.radians(90)
    cyl('trap', 0.02, 0.25, 0, -0.12, -0.26, chrome, 16)
    export('washbasin')

BUILD_ONLY = set(sys.argv[sys.argv.index('--') + 2:]) if '--' in sys.argv and len(sys.argv) > sys.argv.index('--') + 2 else set()
def want(name): return not BUILD_ONLY or name in BUILD_ONLY
# ---------------------------------------------------------------------------
if want('sofa_l'): sofa_l()
if want('concrete_pot'): concrete_pot()
if False: sofa_l()
if want('bed_single_beige'): bed('bed_single_beige', 1.2, 2.0, 'beige')
if want('bed_queen_dark'): bed('bed_queen_dark', 1.6, 2.0, 'dark')
if want('bed_king_walnut'): bed('bed_king_walnut', 1.8, 2.0, 'walnut')
if want('wardrobe_120_cream'): wardrobe('wardrobe_120_cream', 1.2, 2.4, 0.55, 'cream', 2)
if want('wardrobe_120_mirror'): wardrobe('wardrobe_120_mirror', 1.2, 2.4, 0.55, 'cream', 2, mirror=True)
if want('wardrobe_100_curved'): wardrobe('wardrobe_100_curved', 1.0, 2.4, 0.55, 'cream', 2, curved=True)
if want('desk_white_110'): desk('desk_white_110', 1.1, 0.5, 'white', 'black')
if want('desk_walnut_140'): desk('desk_walnut_140', 1.4, 0.6, 'walnut', 'black')
if want('vanity'): vanity()
if want('office_chair'): office_chair()
if want('dining_table'): dining_table()
if want('dining_chair'): dining_chair()
if want('tv'): tv()
if want('tv_console'): tv_console()
if want('tv_wall'): tv_wall()
if want('wall_panels'): wall_panels()
if want('curtain_dark'): curtain('curtain_dark', 'curtain')
if want('curtain_cream'): curtain('curtain_cream', 'curtainCream')
if want('nightstand_float'): nightstand_float()
if want('sideboard'): sideboard()
if want('armchair_cream'): armchair_cream()
if want('round_table_l'): round_table('round_table_l', 0.38, 0.42)
if want('round_table_s'): round_table('round_table_s', 0.25, 0.5)
if want('ring_pendant'): ring_pendant()
if want('molecule_pendant'): molecule_pendant()
print('SELESAI')
if want('mcb_box'): mcb_box()
if want('kwh_meter'): kwh_meter()
if want('sconce'): sconce()

if want('ac_indoor'): ac_indoor()
if want('water_heater'): water_heater()
if want('closet_duduk'): closet_duduk()
if want('closet_jongkok'): closet_jongkok()
if want('washbasin'): washbasin()
