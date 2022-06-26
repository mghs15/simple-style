const fs = require('fs');

const style = require('./basic.json');

const layers = style.layers;

const tmp = {};
const tmp2 = {};

const collectColorInfo = (colorInfo)=>{
  if(Array.isArray(colorInfo)){
    colorInfo.forEach( colorInfoElement => {
      collectColorInfo(colorInfoElement);
    });
  }else if(typeof(colorInfo)=="string" && ( colorInfo.match(/^rgb/) || colorInfo.match(/^hsl/))){
    if(tmp[colorInfo]){
      tmp[colorInfo] += 1;
    }else{
      tmp[colorInfo] = 1;
    }
    return colorInfo;
  }
}

/*************************************************/
/*RGB→HSLの変換関係設定                         */
/*************************************************/
var calcsl = function(max, min) {
    let L = (max + min)/(2*255);
    let total = max + min;
    let S=(max - min)/255;
    if((total <= 0) || (total >= 510)){
        S = 0;
    }else if(total < 255){
        S = (max-min)/(total);
    }else{
        S = (max-min)/(255*2-total);
    }
    let SL = {"s" : S, "l" : L};
    return SL;
}

var rgb2hsl = function(r, g, b, a = 1) {
    let max=0; let middle=0; let min = 0; 
    let h=0; let s=0; let l=0; 
    if((r == g) && (r == b)){
        max = r; middle=b; min = g; 
        h = 0;
        let sl = calcsl(max, min);
        s = sl.s;
        l = sl.l;
    }else if((r <= g) && (r < b)){
        min = r;
        if(g < b){
            middle=g; max = b; 
        }else{ 
            middle=b; max = g; 
        }
        h = 60*((b-g)/(max-min))+180;
        let sl = calcsl(max, min);
        s = sl.s;
        l = sl.l;
    }else if((g <= b) && (g < r)){
        min = g; 
        if(r < b){
            middle=r; max = b; 
        }else{ 
            middle=b; max = r; 
        } 
        h = 60*((r-b)/(max-min))+300;
        let sl = calcsl(max, min);
        s = sl.s;
        l = sl.l;
    }else{
        min = b; 
        if(g < r){
            middle=g; max = r; 
        }else{ 
            middle=r; max = g; 
        }
        h = 60*((g-r)/(max-min))+60;
        let sl = calcsl(max, min);
        s = sl.s;
        l = sl.l;
    }
    
    if(h > 360){
        h = h - 360;
    }else if(h < 0){
        h = h + 360;
    }
    
    const hsl = [ Math.floor(h), Math.floor(s*100), Math.floor(l*100), a ];
    return hsl;
}

/*************************************************/
/*HSL→RGBの変換関係設定                         */
/*************************************************/
const hsl2rgb = function(h, s, l, a = 1) {

    const max = l + (s * (1 - Math.abs((2 * l) - 1)) / 2);
    const min = l - (s * (1 - Math.abs((2 * l) - 1)) / 2);

    let rgb;
    const i = parseInt(h / 60);

    switch (i) {
      case 0:
      case 6:
        rgb = [max, min + (max - min) * (h / 60), min];
        break;
      case 1:
        rgb = [min + (max - min) * ((120 - h) / 60), max, min];
        break;
      case 2:
        rgb = [min, max, min + (max - min) * ((h - 120) / 60)];
        break;
      case 3:
        rgb = [min, min + (max - min) * ((240 - h) / 60), max];
        break;
      case 4:
        rgb = [min + (max - min) * ((h - 240) / 60), min, max];
        break;
      case 5:
        rgb = [max, min, min + (max - min) * ((360 - h) / 60)];
        break;
    }
    
    return [Math.round(rgb[0] * 255), Math.round(rgb[1] * 255), Math.round(rgb[2] * 255), a] ;
    
  }


/*************************************************/
/*"rgba(r,g,b,a)"などのパース                    */
/*************************************************/
var parsecolor = function(txt){
  if( (txt.indexOf("rgba") == 0) || (txt.indexOf("hsla") == 0) ){
    var length = txt.length - 1;
    var type= txt.slice(0, 4);
    txt = txt.slice(5,length );
    var col = txt.split(",");
  }else{
    var length = txt.length - 1;
    var type= txt.slice(0, 3) + "a";
    txt = txt.slice(4,length );
    var col = txt.split(",");
    col.push(1);
  }
  const color = [];
  color.push( type );
  color.push( parseInt(col[0]) );
  color.push( parseInt(col[1]) );
  color.push( parseInt(col[2]) );
  color.push( Number(col[3]) );
  return color;
}

const addArrEle = (arr, ele) => {
  const n = arr.length;
  if(Array.isArray(arr[n-1])){
    addArrEle(arr[n-1],ele);
  }else{
    arr.push(ele);
  }
}

const convertColor = (colorInfo, arr=[], info={}) => {
  if(Array.isArray(colorInfo)){
    colorInfo.forEach( colorInfoElement => {
      arr.push(convertColor(colorInfoElement, [], info));
    });
    return arr;
  }else if(typeof(colorInfo)=="string" && ( colorInfo.match(/^rgb/) || colorInfo.match(/^hsl/))){
    const colArr1 = parsecolor(colorInfo);
    //色の変更
    const colArr = changeColor(colArr1, info);
    const colTxt = `${colArr[0]}(${colArr[1]},${colArr[2]},${colArr[3]},${colArr[4]})`;
    
    if(tmp2[colTxt]){
      tmp2[colTxt] += 1;
    }else{
      tmp2[colTxt] = 1;
    }
    
    return(colTxt);
    
  }else{
    return(colorInfo);
  }
  
}

const changeColor = (arr, info={}) => {
  
  const hsla = rgb2hsl(arr[1], arr[2], arr[3], arr[4]);
  
  let h = hsla[0];
  let s = hsla[1];
  let l = hsla[2];
  let a = hsla[3]
  
  
  const mode = "d";
  
  if(mode == "m"){
  //モノクロ
    if( s > 0 ) s = 1;
    if( l < 50 && l > 0) l = l + (50 - 1) * 0.5;
    return(["hsla", h, s + "%", l + "%", a]);
  
  }else if(mode == "m2"){
  //モノクロ風（少し色付き）
    h = 200;
    if( s > 0 ) s = 10;
    if( l < 50 && l > 0) l = l + (50 - 1) * 0.5;
    return(["hsla", h, s + "%", l + "%", a]);
  
  }else if(mode == "d"){
  //ダークモード用（まだ使い物にならない）
    
    h = 210; 
    //h = 180 + (180-h)/6;
    
    const propName = info["prop-name"] || "";
    const sourceLayer = info["source-layer"] || "";
    const layerType = info["type"] || "";
    const metadata = info["metadata"] || {};
    const metapath = metadata["path"] || "";
    const outline = metadata["line-role"] || "";
    
    console.log(sourceLayer);
    
    const satacc = 50;
    const satbase = 10;
    
    //個別処理
    if(propName.match(/background/)){ //背景色
      s = 1;
      l = 20;
    }else if(sourceLayer == "waterarea" || sourceLayer == "lake" || sourceLayer == "river" || sourceLayer == "coastline"){ //水域・河川・湖池
      s = 1;
      l = 1;
    }else if(sourceLayer == "building" || sourceLayer == "structurea" ){ //建物
      s = satbase;
      l = 25;
    }else if(sourceLayer == "wstructurea" ){ //水部構造物
      s = 1;
      l = 50;
    }else if(sourceLayer == "railway" ){ //鉄道
      if(outline == "outline"){
        s = 1;
        l = 20;
      }else{
        s = 1;
        l = 50;
      }
    }else if(sourceLayer == "road" ){ //道路
      if(outline == "outline"){
        s = 1;
        l = 20;
      }else{
        s = satacc;
        l =  20 + (100 - l) * 20/100;
      }
    }else if(propName.match(/text-halo-/)){//haloは背景と同じ色に
      s = 1;
      l = 20;
    }else if(propName.match(/text-color/) && (!metapath.match(/番号/) && sourceLayer != "landforml")){//文字色は一律に灰色に(国道・高速番号だけ除く)
      //s = 15;//少し色味を残す
      s = satbase;
      l = 80;
    }else if(sourceLayer == "contour" || sourceLayer == "landforml"){//等高線
      s = 1;
      l = 30;
    }else if(sourceLayer == "boundary" ){//境界線
      s = 1;
    }
    
    return(["hsla", h, s + "%", l + "%", a]);
  
  }else{
    //整理
    //const rgba = hsl2rgb(h, s/100, l/100, a);  //たぶん、ここがおかしい
    
    let r = Math.floor(arr[1]/5)*5;
    let g = Math.floor(arr[2]/5)*5;
    let b = Math.floor(arr[3]/5)*5;
    
    return(["rgba", r, g, b, a]);
  }
  
}

/*************************************************/
/*メイン                                         */
/*************************************************/

//テキスト形式を配列へ
layers.forEach( layer => {
  if(layer.paint){
    for( name in layer.paint){
      if(name.match("color")){
        const colorInfo = layer.paint[name];
        collectColorInfo(colorInfo);
        layer.paint[name] = convertColor(colorInfo, [], { ...layer, "prop-name": name});
        console.log(layer.paint[name]);
      }
    }
  }
});


//console.log(tmp);
console.log(tmp2);
//console.log(layers);

const resstring = JSON.stringify(style, null, 4);
fs.writeFileSync("style.json", resstring);

