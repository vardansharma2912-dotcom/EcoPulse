import numpy as np
from PIL import Image

def rdp(points, epsilon):
    if len(points) < 3:
        return points
    begin, end = points[0], points[-1]
    line_vec = end - begin
    line_len = np.linalg.norm(line_vec)
    if line_len == 0:
        dists = np.linalg.norm(points - begin, axis=1)
    else:
        line_unit = line_vec / line_len
        vecs = points - begin
        projections = np.dot(vecs, line_unit)[:, None] * line_unit
        dists = np.linalg.norm(vecs - projections, axis=1)
    dmax_idx = np.argmax(dists)
    dmax = dists[dmax_idx]
    if dmax > epsilon:
        rec1 = rdp(points[:dmax_idx+1], epsilon)
        rec2 = rdp(points[dmax_idx:], epsilon)
        return np.vstack((rec1[:-1], rec2))
    else:
        return np.vstack((begin, end))

im = Image.open('docs/logo.png').convert('RGBA')
arr = (np.array(im)[:, :, 3] > 110).astype(int)
h, w = arr.shape

dirs = [(-1, 0), (-1, 1), (0, 1), (1, 1), (1, 0), (1, -1), (0, -1), (-1, -1)]

def trace_contour(start_r, start_c, grid):
    path = [(start_c, start_r)]
    curr_r, curr_c = start_r, start_c
    dir_idx = 7
    while True:
        start_scan = (dir_idx + 5) % 8 if dir_idx % 2 == 1 else (dir_idx + 6) % 8
        found = False
        for i in range(8):
            check_dir = (start_scan + i) % 8
            dr, dc = dirs[check_dir]
            nr, nc = curr_r + dr, curr_c + dc
            if 0 <= nr < h and 0 <= nc < w and grid[nr, nc]:
                path.append((nc, nr))
                curr_r, curr_c = nr, nc
                dir_idx = check_dir
                found = True
                break
        if not found or (curr_r == start_r and curr_c == start_c and len(path) > 2):
            break
        if len(path) > 10000:
            break
    return np.array(path, dtype=float)

visited = np.zeros_like(arr, dtype=bool)
contours = []
for r in range(1, h-1):
    for c in range(1, w-1):
        if arr[r, c] and not arr[r, c-1] and not visited[r, c]:
            poly = trace_contour(r, c, arr)
            if len(poly) > 20:
                simplified = rdp(poly, epsilon=1.2)
                contours.append(simplified)
                for pt in poly:
                    visited[int(pt[1]), int(pt[0])] = True

print(f'Traced {len(contours)} contours with sizes: {[len(c) for c in contours]}')

svg_paths = []
for c in contours:
    parts = [f"M {c[0,0]:.1f} {c[0,1]:.1f}"]
    for i in range(1, len(c)):
        parts.append(f"L {c[i,0]:.1f} {c[i,1]:.1f}")
    parts.append("Z")
    svg_paths.append(" ".join(parts))

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <defs>
    <linearGradient id="ecopulse-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4ade80" />
      <stop offset="45%" stop-color="#22c55e" />
      <stop offset="100%" stop-color="#15803d" />
    </linearGradient>
  </defs>
'''

for d in svg_paths:
    svg_content += f'  <path d="{d}" fill="url(#ecopulse-grad)" />\n'

svg_content += '</svg>\n'

with open('public/favicon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

print('public/favicon.svg successfully written!')
