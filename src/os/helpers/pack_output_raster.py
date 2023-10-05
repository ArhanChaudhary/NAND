import os.path
import re

def sbin16(x):
    if x[0] == '1' and len(x) == 16:
        return -1 * (65536 - int(x, 2))
    else:
        return int(x, 2)

def pack_raster(raster_data):
    raster_bits = ''.join(
        [bin(int(j))[2:].zfill(6) for j in raster_data.group(3).split(',')]
    )
    packed_raster = (
        f'do Output.create('
            f'{sbin16(raster_bits[:15])},'
            f'{sbin16(raster_bits[15:30])},'
            f'{sbin16(raster_bits[30:45])},'
            f'{sbin16(raster_bits[45:60])}'
        ');'
    )
    return f'{raster_data.group(0)}{raster_data.group(1)}{packed_raster}\n'


def pack_output_raster(file_contents):
    return re.sub(r'([ \t]*)(// *)?do Output\.create\(((\d\d?,){9}\d\d?)\);.*\n', pack_raster, file_contents)

with open(os.path.dirname(__file__) + '/../Output.jack', 'r+') as f:
    file_contents = f.read()
    f.seek(0)
    f.write(pack_output_raster(file_contents))
    f.truncate()
