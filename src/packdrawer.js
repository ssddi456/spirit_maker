define([
  './helpers/loadimage',
  '../libs/canvas/pixel',
  './projectlist',
  './helpers/simplepack',
  './packers',
  'underscore'
],function(
  loadimage,
  pixel,
  projectlist,
  simplepack,
  packers,
  __
){

  var fs = global.require('fs');
  var path = global.require('path');
        

  // tpls
  var util = global.require('util');
  var path = global.require('path');
  // packed-url x  y
  var spirittpl = {};
  spirittpl.bins = util.format.bind(util,'  background : url( @spirit_%s ) #fff -%spx -%spx no-repeat;\n  width: %spx;\n  height: %spx;\n');
  spirittpl.hori = util.format.bind(util,'  background : url( @spirit_%s ) #fff -%spx -%spx repeat-x;\n  dim:%s;\n  height: %spx;\n');
  spirittpl.vert = util.format.bind(util,'  background : url( @spirit_%s ) #fff -%spx -%spx repeat-y;\n  width : %spx;\n  dim:%s;\n');

  var csstpl  = {
    bins : util.format.bind(util,'  background : url( "%s" ) #fff -%spx -%spx no-repeat;\n  width: %spx;\n  height: %spx;\n'),
    hori : util.format.bind(util,'  background : url( "%s" ) #fff -%spx -%spx repeat-x;\n  dim:%s;\n  height: %spx;\n'),
    vert : util.format.bind(util,'  background : url( "%s" ) #fff -%spx -%spx repeat-y;\n  width : %spx;\n  dim:%s;\n')
  };

  // classname, projectname, sourcename
  var classTpl = {
    simple   : [
                '.<%= classname %>{',
                '  .<%= projectname %>_bins_bin("<%= sourcename %>");',
                ' }'
              ],
    box      : ['.<%= classname %>{',
                '  .up{',
                '    .left{',
                '      .<%= projectname %>_bins_squared_upleft("<%= sourcename %>");',
                '    }',
                '    .mid{',
                '      .<%= projectname %>_vert_squared_upmid("<%= sourcename %>");',
                '    }',
                '    .right{',
                '      .<%= projectname %>_bins_squared_upright("<%= sourcename %>");',
                '    }',
                '  }',
                '  .mid{',
                '    .left{',
                '      .<%= projectname %>_hori_squared_midleft("<%= sourcename %>");',
                '    }',
                '    .mid{',
                '    }',
                '    .right{',
                '      .<%= projectname %>_hori_squared_midright("<%= sourcename %>");',
                '    }',
                '  }',
                '  .down{',
                '    .left{',
                '      .<%= projectname %>_bins_squared_downleft("<%= sourcename %>");',
                '    }',
                '    .mid{',
                '      .<%= projectname %>_vert_squared_downmid("<%= sourcename %>");',
                '    }',
                '    .right{',
                '      .<%= projectname %>_bins_squared_downright("<%= sourcename %>");',
                '    }',
                '  }',
                '}'],
    horizon  : ['.<%= classname %>{',
                '  .left{',
                '    .<%= projectname %>_bins_hori_left("<%= sourcename %>");',
                '  }',
                '  .mid{',
                '    .<%= projectname %>_vert_hori_mid("<%= sourcename %>");',
                '  }',
                '  .right{',
                '    .<%= projectname %>_bins_hori_right("<%= sourcename %>");',
                '  }',
                '}'],
    vertical : ['.<%= classname %>{',
                '  .top{',
                '    .<%= projectname %>_bins_vert_up("<%= sourcename %>");',
                '  }',
                '  .mid{',
                '    .<%= projectname %>_hori_vert_mid("<%= sourcename %>");',
                '  }',
                '  .down{',
                '    .<%= projectname %>_bins_vert_down("<%= sourcename %>");',
                '  }',
                '}']
  }

  _.each(classTpl,function( content, key){
    content.push('');
    classTpl[key] = _.template( content.join('\n') );
  })
  // project name, type, pos, project name idx body
  var partsless    = util.format.bind(util,'.%s_%s_%s( @name ) when (@name = @name_%s_%s ){\n %s }\n');
  var lessnamestpl = util.format.bind(util,'.%s_%s_%s( "%s" );\n' );
  // project name, idx, picname
  var spirit_out_tpl = util.format.bind(util,'@spirit_%s:"%s";\n');
  var namestpl   = util.format.bind(util,'@name_%s_%s:"%s";\n');

  function drawer ( packs ) {
    var curproject = projectlist.curproject().toJSON();
    var finpack = new simplepack.FinPack();
    var names   = {};
    var idxs    = [];
    loadimage(packs.map(function(pack){
      return path.join(curproject.sourceDir, pack.name() );
    }),function(imgs){
      _.each(packs, function( pack, idx ) {
        if( imgs[idx] == 'error' ){
          return;
        }
        var name = pack.name();
        var border=pack.border();
        if( !names.hasOwnProperty( name ) ){
          names[ name ] = idxs.push( name ) - 1;
        };
        finpack.addPack( 
          packers[pack.type()]( pack.img = imgs[idx], border && border.split(/\s+/), pack.toJSON() ) );

        pack.cssstr    = [];
        pack.lessnames = [];
      });
      var refpath  = path.resolve(curproject.outputLess, curproject.outputSpirit);
      var lessstr    = [spirit_out_tpl( curproject.name, refpath ) ]
                          .concat( 
                            idxs.map(function( name, idx){
                              return namestpl( curproject.name, idx, name);
                            })
                          );
      finpack.map(function( node, type ){
        var curpack = _.find( packs,function( pack ) {
                        return pack.img == node.imgdata.source    
                      });
        // build less file
        lessstr.push( partsless( curproject.name, type, node.imgdata.pos, 
                        curproject.name, names[node.imgdata.name],
                        spirittpl[type](
                          curproject.name,
                          node.x, node.y, 
                          node.w, node.h) ));
        // for pack copy
        var cssstr  = csstpl[type](
                        refpath,
                        node.x, node.y,
                        node.w, node.h);
        var lessnames     = lessnamestpl( curproject.name, type, node.imgdata.pos, node.imgdata.name );


        curpack.cssstr   .indexOf( cssstr    ) == -1 && curpack.cssstr   .push( cssstr    );
        curpack.lessnames.indexOf( lessnames ) == -1 && curpack.lessnames.push( lessnames );
      
      });

      _.each(packs,function(pack){
         pack.cssstr    = pack.cssstr   .join('');
         pack.lessnames = pack.lessnames.join('');
         if( pack.classname() ){
           pack.lessstr   = classTpl[pack.type()]({
                              classname   : pack.classname(),
                              projectname : curproject.name,
                              sourcename  : pack.name()
                            });
         }
      })
      
      var temp = new pixel.Canvas( finpack.layout.w, finpack.layout.h );
      finpack.draw(temp.ctx);

      fs.writeFile( curproject.outputLess,   lessstr.join('') );
      fs.writeFile( curproject.outputSpirit, temp.toBase64(), 'base64');

    });
  }

  return _.debounce(drawer,300);
});


