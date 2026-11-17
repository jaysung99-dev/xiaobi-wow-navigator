/** Position a portalled picker inside the currently visible browser viewport. */
export function pickerPlacement({anchor,viewport,mobile=false}) {
  const gap=8,margin=12;
  const left=Number(viewport.left)||0,top=Number(viewport.top)||0;
  const width=Math.max(1,Number(viewport.width)||1),height=Math.max(1,Number(viewport.height)||1);
  const availableWidth=Math.max(1,width-margin*2),availableHeight=Math.max(1,height-margin*2);
  if(mobile){const h=Math.min(availableHeight,Math.max(300,height*.72));return {left:left+Math.min(margin,width/2),top:top+height-Math.min(margin,height/2)-h,width:availableWidth,height:h,sheet:true};}
  const w=Math.min(880,availableWidth),below=top+height-margin-anchor.bottom-gap,above=anchor.top-top-margin-gap;
  const useAbove=below<260&&above>below;
  let h=Math.min(460,Math.max(220,useAbove?above:below),availableHeight);
  let y=useAbove?anchor.top-gap-h:anchor.bottom+gap;
  y=Math.max(top+Math.min(margin,height/2),Math.min(y,top+height-margin-h));
  const x=Math.max(left+Math.min(margin,width/2),Math.min(anchor.left,left+width-margin-w));
  return {left:x,top:y,width:w,height:h,sheet:false};
}
