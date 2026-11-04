/* Hình minh họa các bước bốc bài bằng bộ bài thật (SVG, đổi màu theo sáng/tối). */
(function(){
  function bk(x,y,a){
    return '<g transform="rotate('+(a||0)+' '+(x+18)+' '+(y+27)+')"><rect x="'+x+'" y="'+y+'" width="36" height="54" rx="5" style="fill:var(--cobalt);stroke:var(--ink);stroke-width:1.2"/><rect x="'+(x+5)+'" y="'+(y+5)+'" width="26" height="44" rx="3" style="fill:none;stroke:var(--gold);stroke-width:.8;opacity:.7"/></g>';
  }
  function fc(x,y,up){
    var t=up
      ? 'M'+(x+18)+' '+(y+14)+' L'+(x+24)+' '+(y+24)+' L'+(x+12)+' '+(y+24)+'Z'
      : 'M'+(x+18)+' '+(y+40)+' L'+(x+24)+' '+(y+30)+' L'+(x+12)+' '+(y+30)+'Z';
    return '<rect x="'+x+'" y="'+y+'" width="36" height="54" rx="5" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.2"/><path d="'+t+'" style="fill:var(--gold)"/>';
  }
  function pile(x,y,k,top){
    var s='';
    for(var i=k-1;i>=1;i--) s+=bk(x+2*i,y+2*i,0);
    return s+top;
  }
  function mk(id){
    return '<defs><marker id="'+id+'" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" style="fill:var(--gold-ink)"/></marker></defs>';
  }
  function ar(d,id,both){
    return '<path d="'+d+'" style="fill:none;stroke:var(--gold-ink);stroke-width:2" marker-end="url(#'+id+')"'+(both?' marker-start="url(#'+id+')"':'')+'/>';
  }
  function tx(x,y,s,c){
    return '<text x="'+x+'" y="'+y+'" text-anchor="middle" style="font:600 12px system-ui,sans-serif;fill:'+(c||'var(--muted)')+'">'+s+'</text>';
  }
  function svg(label,body){
    return '<svg viewBox="0 0 240 130" role="img" aria-label="'+label+'">'+body+'</svg>';
  }

  // 1. Tĩnh tâm
  function tinh(){
    return svg('Tĩnh tâm',
      '<circle cx="120" cy="58" r="50" style="fill:none;stroke:var(--muted);stroke-width:1.2;stroke-dasharray:4 4"/>'
      + pile(102,30,4,bk(102,30,0))
      + tx(120,124,'Hít thở chậm · 3 nhịp'));
  }

  // 2. Xoay nửa bộ 180°
  function xoay(){
    return svg('Xoay nửa bộ 180 độ',
      mk('rxo')
      + pile(44,30,3,fc(44,30,true))
      + '<g transform="rotate(180 170 57)">'+pile(152,30,3,fc(152,30,true))+'</g>'
      + ar('M 92 44 Q 120 12 148 44','rxo')
      + tx(120,18,'180°','var(--gold-ink)')
      + tx(62,118,'Giữ nguyên')
      + tx(170,118,'Đã xoay'));
  }

  // 3. Xáo bài
  function xao(){
    return svg('Xáo bài',
      mk('rxa')
      + bk(58,30,-14) + bk(92,22,6) + bk(126,30,-4) + bk(160,24,12) + bk(108,46,-22)
      + ar('M 16 100 Q 4 60 30 20','rxa')
      + ar('M 224 100 Q 236 60 210 20','rxa')
      + tx(120,124,'Xáo đều, lá úp'));
  }

  // 4. Cắt 3 chồng bằng tay trái, gộp lại
  function cat(){
    return svg('Cắt 3 chồng',
      mk('rct')
      + tx(120,20,'Cắt bằng tay trái')
      + pile(14,34,2,bk(14,34,0))
      + pile(64,34,2,bk(64,34,0))
      + pile(114,34,2,bk(114,34,0))
      + tx(32,108,'1') + tx(82,108,'2') + tx(132,108,'3')
      + ar('M 158 61 L 184 61','rct')
      + pile(188,34,4,bk(188,34,0))
      + tx(206,108,'gộp'));
  }

  // 5. Rút từ trên xuống, đặt vào các vị trí
  function rut(n){
    n=Math.max(1,+n||1);
    var m=Math.min(n,4), s=mk('rrt')
      + pile(12,30,4,bk(12,30,0))
      + ar('M 56 57 L 92 57','rrt')
      + tx(48,108,'lá trên cùng');
    for(var i=0;i<m;i++){
      var x=100+i*36;
      s+= i===0
        ? '<rect x="'+x+'" y="30" width="30" height="44" rx="4" style="fill:var(--surface);stroke:var(--ink);stroke-width:1.2"/>'
        : '<rect x="'+x+'" y="30" width="30" height="44" rx="4" style="fill:none;stroke:var(--muted);stroke-dasharray:3 3"/>';
      s+= tx(x+15,92,String(i+1),'var(--ink)');
    }
    s+= tx(120,124, n>1 ? 'Đặt lần lượt vào vị trí 1 → '+n : 'Đặt vào vị trí 1');
    return svg('Rút từ trên xuống', s);
  }

  // 6. Lật ngang như lật trang sách
  function lat(){
    return svg('Lật ngang',
      mk('rlt')
      + fc(30,34,true)
      + fc(174,34,false)
      + ar('M 74 61 L 160 61','rlt',true)
      + tx(120,22,'Như lật trang sách')
      + tx(48,110,'✓ Lật ngang','var(--leaf)')
      + tx(192,110,'✗ Lật dọc','var(--verm)'));
  }

  function guide(){
    var steps=[
      ['Tĩnh tâm', tinh()],
      ['Xoay nửa bộ 180° (nếu dùng lá ngược)', xoay()],
      ['Xáo đến khi thấy đủ', xao()],
      ['Cắt 3 chồng bằng tay trái rồi gộp lại', cat()],
      ['Rút từ trên xuống, đặt vào vị trí 1 → 3', rut(3)],
      ['Lật ngang như lật trang sách', lat()]
    ];
    return steps.map(function(p,i){
      return '<figure class="rart"><div class="rart-svg">'+p[1]+'</div><figcaption>'+(i+1)+'. '+p[0]+'</figcaption></figure>';
    }).join('');
  }

  window.RA={tinh:tinh,xoay:xoay,xao:xao,cat:cat,rut:rut,lat:lat,guide:guide};
})();
