import os
import shutil

import string
import re

path = os.path
root_path = path.dirname(__file__)
re_require_nw = r'''(var\s\w+\s*=\s*global\.require\(\s*'([^\(\)]*)'\s*\))'''
re_require = r'require\(\[\n'
re_define  = r'define\(\[\n'
re_require_end = r'\],function\('

def read_amd_file_require ( file ):
  require_start = False
  config_path   = False

  requires      = []
  for line in open(file).readlines() :

    if not require_start and (re.search( re_require, line ) or re.search( re_define, line)) :
      require_start = True
      continue

    if not config_path   and re.search(r'paths\s*:', line ):
      config_path = True
      continue

    if require_start :
      if re.search(re_require_end, line):
        require_start = False
        continue
      else:
        ref_path = line.lstrip(" '").rstrip("', \n")
        if ref_path.startswith( '.' ) or re.search( r'\/', ref_path):
          requires.append( ref_path  )

    if config_path :
      if re.search(r'}',line):
        config_path = False
        continue
      else :
        ref_path = line.lstrip(' ').rstrip(', ')
        match = re.search ( r"\w+\s*:\s*'([^']+)'", ref_path )
        ref_path = match.group(1)
        if ref_path.startswith( '.' ) or re.search( r'\/', ref_path):
          requires.append ( ref_path )

  return requires

def resolve (path_a, path_b):
  if not path.isdir(path_a) :
    path_a = path.dirname(path_a)
  return path.normpath( path.join(path_a, path_b))

def without ( list_a, list_b ):
  return list( set(list_a) - set(list_b))
def union  ( list_a, list_b ):
  return list( set( list_a ) | set( list_b ) )
def unique ( list_a ):
  return list( set(list_a))

def read_require_list( cur_path, required = [] ):
  requires    = []
  for  x in read_amd_file_require( cur_path ) :
    if x.startswith('.' ) :
      requires.append( resolve ( cur_path,  x + '.js' ))
    else :
      requires.append( resolve ( root_path, x + '.js' ))
  not_required = without ( requires, required )

  for resolved in not_required :
    requires += read_require_list( resolved, unique( requires ) )
  return unique( requires )


def read_html_require( file ):
  requires = []
  for line in open(file).readlines() :
    match = re.search( r'''<script src="([^""]*)"''',line)
    if match :
      requires.append ( resolve( root_path, match.group(1) ) )
  return requires

def get_skins () :
  skins = []
  for root, subFolders, files in os.walk(path.join(root_path,'skin'), topdown=True):
    for file in files :
      skins.append( path.join(root, file) )
  return skins

def save_copy( src, dist):
  _dist = dist
  paths = []
  root  = ''
  file_name, file_ext = path.splitext( dist )
  if file_ext != '' :
    root = path.dirname( file_name )
  else :
    root = file_name
  while not path.exists(root):
    _root = path.dirname(root)
    paths.append( string.replace(root, _root, ''))
    root = _root
  while len ( paths )> 0:
    root = root + paths.pop()
    os.mkdir( root )
  shutil.copyfile( src, dist )


def copy_files () :
  root_files = [ path.join( root_path, x) for x in ['app-v2.html','app-v2.js', 'package.json' ] ]
  dist_dir   = path.join(root_path,'pack')

  for file in root_files + read_html_require( root_files[0] ) + read_require_list( root_files[1] ) + get_skins() :
    try:
      save_copy( file, string.replace(file, root_path, dist_dir ))
    except Exception, e:
      print e

def make_nw () :
  zip_name = shutil.make_archive( 'spirit_maker', 'zip', './pack', '.' )
  nw_name  = string.replace( zip_name, 'zip', 'nw' )

  os.rename( zip_name, nw_name )

def clear_pack():
  try:
    shutil.rmtree( path.join(root_path,'pack'), True)
  except Exception, e:
    raise e

def clear_up () :
  clear_pack()
  try:
    os.remove( path.join(root_path,'spirit_maker.nw'))
  except Exception, e:
    print e 

def main() :
  clear_up()
  copy_files()
  make_nw()
  clear_pack()

main()