<script>
  import { onMount } from 'svelte';
  import { advanceRide, loopRoadPosition, roadProfile as highwayProfile, alignedRiderX, wheelRotation, riderVibration, ROAD_NEAR, ROAD_LENGTH } from './ride-motion.js';
  let { paused = false, slow = false, onfallback = () => {} } = $props();
  let host;
  onMount(() => {
    let disposed = false, cleanup = () => {};
    import('three').then(THREE => {
      if (disposed) return;
      let renderer;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' }); }
      catch { onfallback(); return; }
      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog('#657c8e', 160, 1800);
      const camera = new THREE.PerspectiveCamera(55, 1, .1, 3600);
      // Offset chase camera: the bike stays in the middle lane, not on a dash.
      camera.position.set(3.35, 4.4, 8); camera.lookAt(3.35, 1.7, -100);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      renderer.setClearColor(0, 0); renderer.domElement.setAttribute('aria-hidden', 'true');
      host.appendChild(renderer.domElement);
      const materials = [], textures = [], geometries = [];
      const roadViewport = { width: host.clientWidth, height: host.clientHeight };
      const roadProfile = z => highwayProfile(z, roadViewport);
      const roadRibbons = [];
      const skylineViewport = { value: new THREE.Vector2(1, 1) };
      const skylineImage = { value: new THREE.Vector4(0, 0, 1, 1) };
      const skylinePixels = { value: new THREE.Vector2(1, 1) };
      const cube = new THREE.BoxGeometry(1, 1, 1); geometries.push(cube);
      function material(color, options = {}) {
        const m = new THREE.MeshBasicMaterial({ color, ...options }); materials.push(m); return m;
      }
      function fadeIntoSkyline(mat) {
        mat.transparent = true;
        mat.onBeforeCompile = shader => {
          Object.assign(shader.uniforms, { skylineViewport, skylineImage, skylinePixels });
          shader.fragmentShader = `uniform vec2 skylineViewport;
            uniform vec4 skylineImage;
            uniform vec2 skylinePixels;
          ` + shader.fragmentShader;
          shader.fragmentShader = shader.fragmentShader.replace('#include <fog_fragment>',
            `#include <fog_fragment>
            #ifdef USE_FOG
              gl_FragColor.a *= 1.0-smoothstep(1800.0,3100.0,vFogDepth);
              // Matte of the painted tower, in the original skyline's pixel
              // coordinates. Only the distant highway goes behind it; the
              // rider, contact shadows and foreground road are untouched.
              vec2 screen = vec2(gl_FragCoord.x, skylinePixels.y-gl_FragCoord.y)
                / skylinePixels * skylineViewport;
              vec2 city = (screen-skylineImage.xy)/skylineImage.zw * vec2(1672.0,941.0);
              float left = smoothstep(547.5,548.5,city.x);
              float right = 1.0-smoothstep(607.5,608.5,city.x);
              float roof = smoothstep(589.0,590.0,city.y);
              float base = 1.0-smoothstep(812.0,830.0,city.y);
              gl_FragColor.a *= 1.0-left*right*roof*base*smoothstep(240.0,300.0,vFogDepth);
            #endif`);
        };
        mat.customProgramCacheKey = () => 'skyline-tower-occlusion-v1';
        return mat;
      }
      function box(w, h, d, x, y, z, mat, parent = scene) {
        const mesh = new THREE.Mesh(cube, mat); mesh.scale.set(w, h, d);
        mesh.position.set(x, y, z); parent.add(mesh); return mesh;
      }
      function texture(path, required = false) {
        const map = new THREE.TextureLoader().load(path, () => { if (!disposed) renderer.render(scene, camera); },
          undefined, () => { if (!disposed && required) onfallback(); });
        map.colorSpace = THREE.SRGBColorSpace;
        map.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); textures.push(map); return map;
      }
      let seed = 43;
      const random = () => { seed = seed * 16807 % 2147483647; return seed / 2147483647; };
      const edge = fadeIntoSkyline(material('#a1acaf')), white = fadeIntoSkyline(material('#d9d0b5'));
      const red = fadeIntoSkyline(material('#fb5745'));

      // All road furniture shares one profile. The near road stays level under the tyres.
      function ribbon(left, right, elevation, mat, profile = roadProfile, vertical = false) {
        const positions = [], uv = [], indices = [], count = 720;
        for (let i = 0; i <= count; i++) {
          // Denser samples near the rider and bend; fewer at sub-pixel distances.
          const distance = Math.pow(i / count, 1.7) * ROAD_LENGTH;
          const z = ROAD_NEAR - distance, p = profile(z);
          if (vertical) positions.push(p.x + left, p.y + elevation, z, p.x + left, p.y + right, z);
          else positions.push(p.x + left, p.y + elevation, z, p.x + right, p.y + elevation, z);
          uv.push(0, distance / ROAD_LENGTH, 1, distance / ROAD_LENGTH);
          if (i < count) { const a = i * 2; indices.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
        }
        const geo = new THREE.BufferGeometry();
        geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(indices);
        geo.computeVertexNormals(); geometries.push(geo);
        roadRibbons.push({ geo, left, right, elevation, profile, vertical, count });
        const mesh = new THREE.Mesh(geo, mat); mesh.frustumCulled = false; scene.add(mesh); return mesh;
      }
      const surface = document.createElement('canvas'); surface.width = 512; surface.height = 1024;
      const pen = surface.getContext('2d');
      pen.fillStyle = '#42535e'; pen.fillRect(0, 0, 512, 1024);
      for (let i = 0; i < 42000; i++) {
        pen.fillStyle = random() > .5 ? '#b2bdc224' : '#172e4140';
        pen.fillRect(random() * 512, random() * 1024, .5 + random(), 2 + random() * 9);
      }
      for (let i = 0; i < 600; i++) {
        pen.fillStyle = i % 4 ? '#b8cbd718' : '#e7b77e35';
        pen.fillRect(random() * 512, random() * 1024, .5 + random() * 2, 10 + random() * 120);
      }
      const asphalt = new THREE.CanvasTexture(surface); textures.push(asphalt);
      asphalt.colorSpace = THREE.SRGBColorSpace; asphalt.wrapS = asphalt.wrapT = THREE.RepeatWrapping;
      const asphaltRepeatsPerMetre=18/258;
      asphalt.repeat.set(2, ROAD_LENGTH*asphaltRepeatsPerMetre); asphalt.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
      const roadTravel={value:0};
      const roadMaterial=fadeIntoSkyline(material('#ffffff', { map: asphalt, side: THREE.DoubleSide }));
      const addDistanceFade=roadMaterial.onBeforeCompile;
      roadMaterial.onBeforeCompile=shader=>{
        addDistanceFade(shader);
        shader.uniforms.roadTravel=roadTravel;
        shader.uniforms.roadLength={value:ROAD_LENGTH};
        shader.uniforms.laneInk={value:new THREE.Color('#d9d0b5')};
        shader.vertexShader='varying vec2 roadUv;\n'+shader.vertexShader;
        shader.vertexShader=shader.vertexShader.replace('#include <uv_vertex>','#include <uv_vertex>\nroadUv=uv;');
        shader.fragmentShader='varying vec2 roadUv;uniform float roadTravel;uniform float roadLength;uniform vec3 laneInk;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
          float roadX=(roadUv.x-.5)*14.0;
          float along=roadUv.y*roadLength+roadTravel;
          float edgeAA=max(fwidth(roadX),.008);
          float lane=1.0-smoothstep(.045,.045+edgeAA,abs(abs(roadX)-2.3));
          float phase=mod(along,5.3);
          float endAA=min(fwidth(along),1.2);
          float dash=smoothstep(0.0,endAA+.01,phase)*(1.0-smoothstep(2.9-endAA,2.9,phase));
          diffuseColor.rgb=mix(diffuseColor.rgb,laneInk,lane*dash);
        `);
      };
      roadMaterial.customProgramCacheKey=()=> 'continuous-road-markings-tower-v2';
      ribbon(-7, 7, 0, roadMaterial);
      for (const side of [-1, 1]) {
        ribbon(side * 7, .55, 0, fadeIntoSkyline(material('#465661', { side: THREE.DoubleSide })), roadProfile, true);
        ribbon(side * 7 - .10, side * 7 + .10, .55, edge);
        ribbon(side * 7 - .06, side * 7 + .06, 1.02, edge);
        ribbon(side * 6.58 - .055, side * 6.58 + .055, .015, white);
        ribbon(side * 6.98 - .025, side * 6.98 + .025, .58, red);
      }
      const moving = [];
      function position(item) {
        const p = roadProfile(item.z); item.mesh.position.set(p.x + item.x, p.y + item.y, item.z);
        if (item.align) {
          const ahead = roadProfile(item.z - 1);
          item.mesh.rotation.x = Math.atan2(ahead.y - p.y, 1);
          item.mesh.rotation.y = -Math.atan2(ahead.x - p.x, 1);
        }
      }
      function track(mesh, x, y, z, speed = 1, align = false) {
        const item = { mesh, x, y, z, speed, align }; moving.push(item); position(item); return mesh;
      }
      // Lane paint is sampled on the entire road, so it cannot stop at the
      // former mesh boundary or float off the distant curve.

      // First riding pass: painted skyline only. No recycled buildings, traffic,
      // signs or lamp posts competing with the tyre/road motion.
      const streakMat = material('#efbea0', { transparent: true, opacity: .24, blending: THREE.AdditiveBlending, depthWrite: false });
      for (let i = 0; i < 80; i++)
        track(box(.015 + random() * .035, .007, 1 + random() * 6, 0, 0, 0, streakMat), (i % 2 ? 1 : -1) * (3.4 + random() * 3.3), .032, 14 - random() * 255, 1, true);
      const reflectionMat = material('#e9b775', { transparent:true, opacity:.16, blending:THREE.AdditiveBlending, depthWrite:false });
      for(let i=0;i<24;i++) {
        const x=(i%2?1:-1)*(5.5+random()*.8);
        for(let j=0;j<4;j++) track(box(.08+random()*.16,.006,1+random()*3,0,0,0,reflectionMat),x+j*.11,.035,14-i*11+j*.4,1,true);
      }

      const riderMap = texture('/images/ride-rider-courier.png', true);
      const compactRiderMap = texture('/images/ride-rider-courier-rear.png', true);
      const riderMaterial = new THREE.ShaderMaterial({
        uniforms: {
          map: { value: riderMap }, travel: { value: 0 }, wheelAngle: { value: 0 }, frontWheelAngle: { value: 0 }, vibration: { value: 0 }, compact: { value: 0 },
          tyreCenter: { value: new THREE.Vector2(.315,.744) }, tyreRadius: { value: new THREE.Vector2(.128,.224) }
        }, transparent: true, depthWrite: false,
        vertexShader: `varying vec2 vUv;uniform float travel;uniform float vibration;
          void main(){vUv=uv;vec3 p=position;
            float hair=smoothstep(.77,.91,uv.y)*(1.0-smoothstep(.42,.68,uv.x));
            p.x+=hair*sin(travel*.6+uv.x*17.0)*.010;
            p.y+=smoothstep(.60,.80,uv.y)*vibration;
            gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
        fragmentShader: `uniform sampler2D map;uniform float wheelAngle;uniform float frontWheelAngle;uniform float compact;
          uniform vec2 tyreCenter;uniform vec2 tyreRadius;varying vec2 vUv;
          void main(){vec4 ink=texture2D(map,vUv);if(ink.a<.02)discard;
            vec2 p=vec2(vUv.x,1.0-vUv.y);
            vec2 tyre=(p-tyreCenter)/tyreRadius;
            float rubberMask=1.0-smoothstep(.72,1.0,length(tyre));
            // The visible rear surface rolls upward as the bike travels away.
            // Angle is distance/radius, shared with the asphalt and lane markings.
            float cylinderAngle=asin(clamp(tyre.y,-.99,.99));
            float phase=fract((cylinderAngle+wheelAngle)/6.2831853);
            float sourceY=.66+phase*.17;
            float otherPhase=fract(phase+.5);
            float seamWeight=pow(sin(phase*3.14159265),2.0);
            vec3 rolling=mix(texture2D(map,vec2(p.x,1.0-(.66+otherPhase*.17))).rgb,
              texture2D(map,vec2(p.x,1.0-sourceY)).rgb,seamWeight);
            float groove=1.0-smoothstep(.02,.055,abs(fract(phase*7.0+abs(tyre.x)*.19)-.5));
            ink.rgb=mix(ink.rgb,rolling,rubberMask*.60);
            ink.rgb*=1.0-rubberMask*groove*.14;
            // Animate only the rim's annulus; the axle and swingarm stay fixed.
            vec2 rim=(p-vec2(.466,.742))/vec2(.051,.153);
            float radius=length(rim);
            float ring=smoothstep(.60,.72,radius)*(1.0-smoothstep(.92,1.0,radius));
            float spokes=pow(max(0.0,cos((atan(rim.y,rim.x)+wheelAngle)*6.0)),10.0);
            ink.rgb=mix(ink.rgb,ink.rgb*.68+vec3(.15)*spokes,ring*(1.0-compact)*.55);
            // Only the exposed front-wheel crescent moves. The fairing, fork
            // and axle remain untouched; its smaller image is perspective,
            // not a physically tiny wheel that should spin several times faster.
            vec2 front=(p-vec2(.807,.480))/vec2(.035,.091);
            float frontRadius=length(front);
            float exposed=smoothstep(.802,.815,p.x)*(1.0-compact);
            float frontRing=smoothstep(.51,.64,frontRadius)*(1.0-smoothstep(.88,.98,frontRadius))*exposed;
            float frontSpokes=pow(max(0.0,cos((atan(front.y,front.x)+frontWheelAngle)*6.0)),8.0);
            ink.rgb=mix(ink.rgb,ink.rgb*.55+vec3(.19,.16,.12)*frontSpokes,frontRing*.75);
            float frontRubber=smoothstep(.84,.91,frontRadius)*(1.0-smoothstep(.98,1.04,frontRadius))*exposed;
            float frontTread=pow(max(0.0,cos((atan(front.y,front.x)+frontWheelAngle)*13.0)),6.0);
            ink.rgb*=1.0-frontRubber*frontTread*.28;
            gl_FragColor=ink;
            #include <colorspace_fragment>
          }`
      }); materials.push(riderMaterial);
      const riderGeometry = new THREE.PlaneGeometry(3.3, 4.95, 40, 50); geometries.push(riderGeometry);
      const rider = new THREE.Mesh(riderGeometry, riderMaterial); rider.renderOrder = 3; scene.add(rider);
      const shadowGeometry = new THREE.PlaneGeometry(1, 1); geometries.push(shadowGeometry);
      function shadow(opacity, color = '#030506') {
        const mat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { opacity: { value: opacity }, tint:{value:new THREE.Color(color)} },
          vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
          fragmentShader: 'varying vec2 vUv;uniform float opacity;uniform vec3 tint;void main(){float r=length((vUv-.5)*2.0);gl_FragColor=vec4(tint,(1.0-smoothstep(.08,1.0,r))*opacity);}'
        }); materials.push(mat); const mesh = new THREE.Mesh(shadowGeometry, mat);
        mesh.rotation.x = -Math.PI / 2; mesh.renderOrder = 2; scene.add(mesh); return mesh;
      }
      const rearContact = shadow(.92), frontContact = shadow(.75), bodyShadow = shadow(.50), tailReflection=shadow(.22,'#e64635');
      const ray = new THREE.Raycaster(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), -.012);
      function contact(u, v) {
        const point = new THREE.Vector3((u - .5) * 3.3, (.5 - v) * 4.95, 0);
        rider.localToWorld(point); point.project(camera); ray.setFromCamera(new THREE.Vector2(point.x, point.y), camera);
        return ray.ray.intersectPlane(ground, new THREE.Vector3());
      }
      function placeRider(w) {
        const compact = w <= 800;
        rider.scale.setScalar(compact ? 1.05 : 1.18);
        const rearUV=compact?{u:.5,v:.99}:{u:.35,v:.974}, frontUV={u:.81,v:.568};
        const x=compact?camera.position.x:alignedRiderX(camera.position.x,camera.position.y,3.3,4.95,rider.scale.x,rearUV,frontUV);
        riderMaterial.uniforms.map.value=compact?compactRiderMap:riderMap;
        riderMaterial.uniforms.compact.value=compact?1:0;
        riderMaterial.uniforms.tyreCenter.value.set(compact?.50:.315,compact?.755:.744);
        riderMaterial.uniforms.tyreRadius.value.set(compact?.14:.128,compact?.238:.224);
        rider.position.set(x, 4.95 * (rearUV.v-.5) * rider.scale.y, -1.5);
        rider.updateMatrixWorld(true); camera.updateMatrixWorld(true);
        const rear = contact(rearUV.u, rearUV.v), front = compact?null:contact(frontUV.u, frontUV.v);
        frontContact.visible=!compact;
        if (rear) {
          rearContact.position.copy(rear); rearContact.scale.set(.95, 1.3, 1);
          bodyShadow.position.copy(rear);
          if(front) bodyShadow.position.lerp(front,.40); else bodyShadow.position.z-=1.0;
          bodyShadow.position.y=.009;
          bodyShadow.scale.set(1.45,front?rear.distanceTo(front)+1.0:3.3,1);
          tailReflection.position.copy(rear);tailReflection.position.z+=1.0;tailReflection.position.y=.013;
          tailReflection.scale.set(.65,3.4,1);
        }
        if (front) { frontContact.position.copy(front); frontContact.scale.set(.55, .7, 1); }
      }
      function resize() {
        const w = host.clientWidth, h = host.clientHeight;
        if (!w || !h) return;
        roadViewport.width=w; roadViewport.height=h;
        for (const { geo, left, right, elevation, profile, vertical, count } of roadRibbons) {
          const positions=geo.attributes.position;
          for (let i=0;i<=count;i++) {
            const z=ROAD_NEAR-Math.pow(i/count,1.7)*ROAD_LENGTH, p=profile(z);
            positions.setXYZ(i*2,p.x+left,p.y+elevation,z);
            positions.setXYZ(i*2+1,p.x+(vertical?left:right),p.y+(vertical?right:elevation),z);
          }
          positions.needsUpdate=true;
        }
        moving.forEach(position);
        camera.position.x=w<=800?0:3.35;
        camera.lookAt(camera.position.x,1.7,-100);
        renderer.setSize(w, h); camera.aspect = w / h;
        // Match the shared skyline CSS: desktop width-fit, mobile height-fit.
        const skyWidth = w <= 800 ? h * 1672 / 941 : w;
        const skyHeight = w <= 800 ? h : w * 941 / 1672;
        skylineViewport.value.set(w, h);
        skylineImage.value.set((w-skyWidth)/2, 0, skyWidth, skyHeight);
        renderer.getDrawingBufferSize(skylinePixels.value);
        camera.setViewOffset(w, h, w > 800 ? w * .075 : 0, 0, w, h); camera.updateProjectionMatrix();
        placeRider(w); renderer.render(scene, camera);
      }
      const observer = new ResizeObserver(resize); observer.observe(host); resize();
      let last = 0, frame = 0, wasPaused = false;
      let motion = { speed: 12, distance: 0, step: 0 };
      function tick(now) {
        if (disposed) return;
        const dt = Math.min((now - last) / 1000, .04); last = now;
        if (!document.hidden) {
          if (!paused) {
            motion = advanceRide(motion, dt, { slow });
            moving.forEach(item => { item.z = loopRoadPosition(item.z, motion.step * item.speed, -240, 18); position(item); });
            // Ribbon UV increases toward the horizon, unlike the original plane.
            asphalt.offset.y = motion.distance * asphaltRepeatsPerMetre;
            roadTravel.value=motion.distance;
            riderMaterial.uniforms.travel.value = motion.distance;
            riderMaterial.uniforms.wheelAngle.value = wheelRotation(motion.distance,4.95*rider.scale.y*riderMaterial.uniforms.tyreRadius.value.y);
            riderMaterial.uniforms.frontWheelAngle.value = wheelRotation(motion.distance,4.95*rider.scale.y*riderMaterial.uniforms.tyreRadius.value.y*.95);
            riderMaterial.uniforms.vibration.value = riderVibration(motion.distance,motion.speed);
            streakMat.opacity = .10 + motion.speed / 12 * .18;
          }
          if (!paused || !wasPaused) renderer.render(scene, camera);
          wasPaused = paused;
        }
        frame = requestAnimationFrame(tick);
      }
      const lost = event => { event.preventDefault(); cancelAnimationFrame(frame); onfallback(); };
      renderer.domElement.addEventListener('webglcontextlost', lost); frame = requestAnimationFrame(tick);
      cleanup = () => {
        cancelAnimationFrame(frame); observer.disconnect(); renderer.domElement.removeEventListener('webglcontextlost', lost);
        geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose());
        renderer.dispose(); renderer.domElement.remove();
      };
    }).catch(() => { if (!disposed) onfallback(); });
    return () => { disposed = true; cleanup(); };
  });
</script>

<div class="canvas" bind:this={host}></div>
<style>.canvas{position:absolute;inset:0;pointer-events:none}.canvas :global(canvas){display:block;width:100%;height:100%}</style>
