const { test } = require('node:test');
const assert = require('node:assert/strict');
test('flat-road vibration is tiny and both wheels use travelled distance',async()=>{
  const {riderVibration,wheelRotation}=await import('../web/src/lib/ride-motion.js');
  for(let d=0;d<100;d+=.1){
    assert.ok(Math.abs(riderVibration(d,12))<=.0016);
    assert.equal(riderVibration(d,0),0);
    assert.ok(Math.abs(wheelRotation(d,1.3*.95)*.95-wheelRotation(d,1.3))<1e-10);
  }
});
test('road and tyre distance freezes when paused, decelerates smoothly, and clamps long frames',async()=>{
  const { advanceRide }=await import('../web/src/lib/ride-motion.js');
  const initial={speed:12,distance:10,step:0};
  assert.deepEqual(advanceRide(initial,1,{paused:true}),initial);
  const normal=advanceRide(initial,.02);
  const reading=advanceRide(initial,.02,{slow:true});
  assert.ok(reading.speed<normal.speed && reading.speed>2.8);
  assert.equal(normal.distance,10+normal.step);
  assert.ok(Math.abs(advanceRide(initial,50).step-.6)<1e-12);
  assert.deepEqual(initial,{speed:12,distance:10,step:0});
});
test('scenery wraps continuously without losing overshoot',async()=>{
  const { loopRoadPosition }=await import('../web/src/lib/ride-motion.js');
  assert.equal(loopRoadPosition(13,2),-165);
  assert.equal(loopRoadPosition(-100,4),-96);
  assert.equal(loopRoadPosition(13,362),-165);
  assert.equal(loopRoadPosition(17,3,-240,18),-238);
});
test('distant continuation preserves the straight riding area',async()=>{
  const { roadProfile }=await import('../web/src/lib/ride-motion.js');
  assert.deepEqual(roadProfile(0),{x:0,y:0});
  assert.deepEqual(roadProfile(-12),{x:0,y:0});
  for(let z=18;z>=-80;z-=.5){
    assert.deepEqual(roadProfile(z),{x:0,y:0});
  }
});
test('highway extends beyond the old cutoff with a continuous distant bend',async()=>{
  const {roadProfile,ROAD_FAR,ROAD_LENGTH,ROAD_NEAR}=await import('../web/src/lib/ride-motion.js');
  assert.ok(ROAD_FAR < -3000);
  assert.equal(ROAD_LENGTH,ROAD_NEAR-ROAD_FAR);
  assert.ok(roadProfile(-240).x<0);
  assert.ok(roadProfile(-240).y<0);
  assert.ok(roadProfile(ROAD_FAR).x < -300, 'continues around the city block instead of returning to the tower');
  assert.ok(roadProfile(ROAD_FAR).y < -12);
  for(let z=-80;z>ROAD_FAR;z-=1){
    const a=roadProfile(z),b=roadProfile(z-1);
    assert.ok(Math.abs(b.x-a.x)<.22);
    assert.ok(Math.abs(b.y-a.y)<.04);
  }
});
test('far highway holds a leftward heading rather than converging through the central tower',async()=>{
  const {roadProfile}=await import('../web/src/lib/ride-motion.js');
  for(const depth of [600,1200,2400,3200]) {
    const heading = roadProfile(-depth).x/depth;
    assert.ok(heading < -.09 && heading > -.12);
  }
  const left=roadProfile(-259.99),right=roadProfile(-260.01);
  assert.ok(Math.abs(right.x-left.x)<.005, 'no kink when the additional bend starts');
});
test('responsive distant road aims behind the skyline tower without a crest or moving the riding area',async()=>{
  const {roadProfile}=await import('../web/src/lib/ride-motion.js');
  for (const viewport of [{width:1146,height:924},{width:2536,height:1822},{width:1280,height:720},{width:390,height:450}]) {
    const {width,height}=viewport, compact=width<=800;
    const skyWidth=compact?height*1672/941:width;
    const expectedX=(width-skyWidth)/2+skyWidth*.345;
    const pitch=Math.atan2(2.7,108),tan=Math.tan(55*Math.PI/360);
    let previousY=Infinity;
    for(let depth=80;depth<=3200;depth+=10) {
      const p=roadProfile(-depth,viewport),dy=p.y-4.4,d=depth+8;
      const viewDepth=d*Math.cos(pitch)-dy*Math.sin(pitch);
      const screenY=(1-(dy*Math.cos(pitch)+d*Math.sin(pitch))/viewDepth/tan)*height/2;
      assert.ok(screenY<previousY,'no crest conceals the bend'); previousY=screenY;
      if(depth>=600) {
        const screenX=((p.x-(compact?0:3.35))/viewDepth/tan/(width/height)+1-(compact?0:.15))*width/2;
        assert.ok(Math.abs(screenX-expectedX)<.01,'far road aligned with tower');
      }
    }
    assert.deepEqual(roadProfile(-80,viewport),{x:0,y:0});
  }
});
test('wheel makes one rotation per circumference and freezes with travelled distance',async()=>{
  const { wheelRotation, advanceRide }=await import('../web/src/lib/ride-motion.js');
  const radius=1.3;
  assert.ok(Math.abs(wheelRotation(2*Math.PI*radius,radius)-2*Math.PI)<1e-12);
  const state={speed:12,distance:37,step:0};
  assert.equal(wheelRotation(advanceRide(state,.04,{paused:true}).distance,radius),wheelRotation(state.distance,radius));
  assert.ok(wheelRotation(advanceRide(state,.04).distance,radius)>wheelRotation(state.distance,radius));
});
test('both illustrated tyre contacts project onto the same straight world-space lane',async()=>{
  const { alignedRiderX }=await import('../web/src/lib/ride-motion.js');
  for(const scale of [.9,1.05,1.18]){
    const rear={u:.35,v:.974},front={u:.81,v:.568},cameraX=3.35,cameraHeight=4.4;
    const x=alignedRiderX(cameraX,cameraHeight,3.3,4.95,scale,rear,front);
    const rearGroundX=x+(rear.u-.5)*3.3*scale;
    const frontHeight=(rear.v-front.v)*4.95*scale;
    const frontGroundX=cameraX+(x+(front.u-.5)*3.3*scale-cameraX)*cameraHeight/(cameraHeight-frontHeight);
    assert.ok(Math.abs(rearGroundX-frontGroundX)<1e-10);
    if(scale===1.18) assert.ok(Math.abs(rearGroundX)<.05,'bike rides in the middle of the centre lane');
  }
});
