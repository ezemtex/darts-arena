/* Local, procedural 3D replay: steel tip, machined barrel, shaft and four flights. */
let stopCinema=()=>{};
const replayFallback=replayHTML;
replayHTML=function(){stopCinema();if(!bestTurn)return replayFallback();queueMicrotask(()=>startCinema(document.getElementById('cinema'),bestTurn));return '<h2>Miglior turno · '+bestTurn.total+' punti</h2><p>'+esc(bestTurn.player)+'</p><div id="cinema" aria-label="Replay tridimensionale del turno migliore"></div><p id="cinema-caption" aria-live="polite">Pronti al lancio</p><div class="replay-hits">'+bestTurn.hits.map((h,i)=>'<span style="--dart-color:'+['#edca7c','#70c9e7','#ed7fa3'][i]+'">'+hitLabel(h)+' · '+h.value+'</span>').join('')+'</div><p class="profile-note">'+bestTurn.hits.map(h=>h.value).join(' + ')+' = '+bestTurn.total+' punti · Ricostruzione dei settori colpiti'+(bestTurn.hits.length<3?' · Turno chiuso con '+bestTurn.hits.length+' freccette':'')+'</p>'};
const cinemaStyle=document.createElement('style');cinemaStyle.textContent='#cinema{height:clamp(320px,52vh,570px);position:relative;border:1px solid #435044;border-radius:18px;overflow:hidden;background:#101713}#cinema canvas{display:block;width:100%;height:100%}#cinema-caption{color:#edca7c;min-height:24px;font-size:14px}';document.head.append(cinemaStyle);
function startCinema(host,record){
 if(!host)return;stopCinema();let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'})}catch(e){host.innerHTML='<p class="profile-note">La vista 3D non è disponibile su questo dispositivo. Il risultato del turno è riportato qui sotto.</p>';return}
 const T=THREE,scene=new T.Scene(),camera=new T.PerspectiveCamera(42,1,.01,80);scene.background=new T.Color('#101914');scene.fog=new T.Fog('#101914',14,40);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;host.append(renderer.domElement);
 scene.add(new T.HemisphereLight(0xfff4df,0x665b4b,1.2));const key=new T.DirectionalLight(0xffe9c4,2.4);key.position.set(-3,5,6);scene.add(key);const fill=new T.DirectionalLight(0xc5e4ff,1.2);fill.position.set(4,2,-3);scene.add(fill);
 // Softbox reflections give the machined metal a real surrounding environment.
 const studio=new T.Scene();studio.background=new T.Color('#747c80');for(const [x,y,z,w,h] of [[-4,2,0,3,7],[4,1,1,2,6],[0,5,0,6,3]]){const light=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:0xffffff,side:T.DoubleSide}));light.position.set(x,y,z);light.lookAt(0,0,0);studio.add(light)}const pmrem=new T.PMREMGenerator(renderer),environment=pmrem.fromScene(studio);scene.environment=environment.texture;pmrem.dispose();studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose()});
 const mat=(color,metalness=0,roughness=.65)=>new T.MeshStandardMaterial({color,metalness,roughness});const steel=mat('#c7d7db',.78,.23),dark=mat('#202b31',.65,.28),gold=mat('#d5a74c',.7,.25),orange=mat('#da6c25',0,.92);
 function mesh(geometry,material,parent=scene){const m=new T.Mesh(geometry,material);parent.add(m);return m}
 function box(w,h,d,x,y,z,material,parent=scene){const m=mesh(new T.BoxGeometry(w,h,d),material,parent);m.position.set(x,y,z);return m}
 // Room reconstructed from the supplied photo; no people or personal items are copied.
 box(30,22,.15,0,0,-.4,mat('#e5ddc9'));box(30,.15,35,0,-7.3,9,mat('#665340'));
 const artCanvas=document.createElement('canvas');artCanvas.width=512;artCanvas.height=720;const art=artCanvas.getContext('2d');art.fillStyle='#eee7cf';art.fillRect(0,0,512,720);art.fillStyle='#e9cd51';art.fillRect(35,30,442,495);let seed=41;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};for(let i=0;i<90;i++){art.strokeStyle=['#88877999','#cec6a888','#4d514c66'][i%3];art.lineWidth=3+random()*22;art.beginPath();art.moveTo(50+random()*360,110+random()*330);art.lineTo(60+random()*390,110+random()*350);art.stroke()}art.strokeStyle='#65645a';art.lineWidth=1;for(let i=0;i<6;i++){art.beginPath();art.moveTo(45+i*60,615);art.bezierCurveTo(60+i*60,565,100+i*60,665,95+i*60,600);art.stroke()}const artTexture=new T.CanvasTexture(artCanvas);artTexture.colorSpace=T.SRGBColorSpace;
 box(4.9,7,.12,0,-.55,-.23,mat('#444740'));const print=mesh(new T.PlaneGeometry(4.4,6.5),new T.MeshStandardMaterial({map:artTexture,roughness:.9}));print.position.set(0,-.55,-.15);
 const clothCanvas=document.createElement('canvas');clothCanvas.width=clothCanvas.height=128;const cloth=clothCanvas.getContext('2d');cloth.fillStyle='#b9b9b9';cloth.fillRect(0,0,128,128);for(let i=0;i<128;i+=2){cloth.strokeStyle=i%4?'#8b8b8b':'#dddddd';cloth.beginPath();cloth.moveTo(i,0);cloth.lineTo(i,128);cloth.moveTo(0,i);cloth.lineTo(128,i);cloth.stroke()}const fabric=new T.CanvasTexture(clothCanvas);fabric.wrapS=fabric.wrapT=T.RepeatWrapping;fabric.repeat.set(8,8);orange.color.set('#bb4c19');orange.bumpMap=fabric;orange.bumpScale=.025;
 function cushion(w,h,d,x,y,z,material,parent){const shape=new T.Shape(),r=.12;shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const geo=new T.ExtrudeGeometry(shape,{depth:d,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:.08,bevelThickness:.08});geo.translate(0,0,-d/2);const m=mesh(geo,material,parent);m.position.set(x,y,z);return m}
 const sofa=new T.Group();scene.add(sofa);sofa.position.set(.4,-6.6,1.7);cushion(8,.65,2.3,0,0,0,orange,sofa);for(const x of [-2,2]){cushion(3.8,1.8,.45,x,1.25,-.8,orange,sofa);cushion(3.8,.35,1.9,x,.5,.2,orange,sofa)}for(const x of [-4.1,4.1])cushion(.45,1.2,2.5,x,.5,0,orange,sofa);
 // Brass floor lamp with a cream fabric shade and curved supports.
 const brass=mat('#aa8647',.83,.22),lamp=new T.Group();scene.add(lamp);lamp.position.set(7,-7,0);const pole=mesh(new T.CylinderGeometry(.045,.065,7.4,24),brass,lamp);pole.position.y=3.7;const base=mesh(new T.CylinderGeometry(.5,.65,.12,40),brass,lamp);base.position.y=.05;const shade=mesh(new T.CylinderGeometry(.95,1.25,1.5,48,1,true),new T.MeshStandardMaterial({color:'#d9c49f',side:T.DoubleSide,roughness:1}),lamp);shade.position.y=7.8;for(const x of [-.5,.5]){const curve=new T.CatmullRomCurve3([new T.Vector3(0,5.7,0),new T.Vector3(x,5.9,0),new T.Vector3(x,6.8,0)]);mesh(new T.TubeGeometry(curve,20,.025,8,false),brass,lamp)}
 // Canvas texture contains conventional board numbering and ring radii.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const ctx=canvas.getContext('2d'),C=512,S=3.35;
 ctx.fillStyle='#111713';ctx.fillRect(0,0,1024,1024);
sectors.forEach((n,i)=>{const a=(i-.5)*Math.PI/10-Math.PI/2,b=(i+.5)*Math.PI/10-Math.PI/2;[[12,70],[70,77],[77,115],[115,123]].forEach(([r,R],j)=>{ctx.beginPath();ctx.arc(C,C,R*S,a,b);ctx.arc(C,C,r*S,b,a,true);ctx.closePath();ctx.fillStyle=j%2?(i%2?'#d6ccb5':'#8b3932'):(i%2?'#d7ceba':'#23536d');ctx.fill();ctx.strokeStyle='#b4b7a7';ctx.lineWidth=1.5;ctx.stroke()});const [x,y]=point(137,i*Math.PI/10);ctx.fillStyle='#f2eddd';ctx.font='44px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n,C+(x-150)*S,C+(y-150)*S)});
 for(const [r,color] of [[12,'#208553'],[5,'#be3040']]){ctx.beginPath();ctx.arc(C,C,r*S,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.stroke()}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const board=mesh(new T.CylinderGeometry(1.45,1.45,.14,96),dark);board.rotation.x=Math.PI/2;board.position.z=-.07;
 mesh(new T.CircleGeometry(1.45,96),new T.MeshStandardMaterial({map:texture,roughness:.95})).position.z=.006;
 const rim=mesh(new T.TorusGeometry(1.45,.018,8,96),steel);rim.position.z=.015;
 function dart(index){const g=new T.Group();scene.add(g);const color=[0xe8b94e,0x39b6d4,0xdf5c85][index];
 // All lengths are measured from the point, toward the rear (+Z).
 function cylinder(r1,r2,length,z,material){const o=mesh(new T.CylinderGeometry(r2,r1,length,24),material,g);o.rotation.x=Math.PI/2;o.position.z=z;return o}
 cylinder(.0002,.008,.24,.12,steel);const profile=[[.008,.24],[.02,.255],[.029,.29],[.033,.34],[.033,.53],[.027,.60],[.014,.65]].map(([r,z])=>new T.Vector2(r,z));const barrel=mesh(new T.LatheGeometry(profile,64),steel,g);barrel.rotation.x=Math.PI/2;
 for(let i=0;i<22;i++){const ring=mesh(new T.TorusGeometry(i<3?.029+i*.0013:i>18?.03-(i-18)*.001:.033,.0025,8,40),i%6===0?gold:dark,g);ring.position.z=.29+i*.014}
 cylinder(.012,.009,.22,.76,dark);for(const z of [.66,.68,.86])cylinder(.014,.014,.009,z,steel);cylinder(.012,.012,.04,.89,gold);
 const shape=new T.Shape();shape.moveTo(0,.86);shape.lineTo(.09,.92);shape.quadraticCurveTo(.115,.94,.108,.98);shape.lineTo(.09,1.10);shape.quadraticCurveTo(.08,1.14,.055,1.14);shape.lineTo(.005,1.11);shape.closePath();
 const flightGeo=new T.ShapeGeometry(shape);flightGeo.rotateX(Math.PI/2);
 for(let j=0;j<4;j++){const flight=mesh(flightGeo,new T.MeshPhysicalMaterial({color,metalness:.15,roughness:.3,clearcoat:.85,clearcoatRoughness:.2,side:T.DoubleSide}),g);flight.rotation.z=j*Math.PI/2;const edging=mesh(new T.BoxGeometry(.055,.0015,.012),dark,g);edging.position.set(Math.cos(j*Math.PI/2)*.056,Math.sin(j*Math.PI/2)*.056,1.04);edging.rotation.z=j*Math.PI/2;for(let k=0;k<7;k++){const line=mesh(new T.BoxGeometry(.05,.001,.0015),steel,g);line.position.set(Math.cos(j*Math.PI/2)*.052,Math.sin(j*Math.PI/2)*.052,.96+k*.012);line.rotation.z=j*Math.PI/2}}
 g.userData.index=index;return g}
 const darts=record.hits.map((h,i)=>{const g=dart(i);const [x,y]=hitPoint(h,i);g.userData.hit=h;g.userData.target=new T.Vector3((x-150)*S/512*1.45,(150-y)*S/512*1.45,.015);g.userData.start=new T.Vector3((i-1)*.48,(i-1)*.22,7+i*.25);g.position.copy(g.userData.start);return g});
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-12,right:12,top:12,bottom:-12,near:.1,far:40});key.shadow.bias=-.0004;scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true}});
 const caption=document.getElementById('cinema-caption');let raf=0,disposed=false,start=performance.now();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);observer.disconnect();scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose())}});texture.dispose();artTexture.dispose();fabric.dispose();environment.dispose();renderer.dispose();renderer.forceContextLoss()}
 stopCinema=dispose;
 function render(seconds){const t=reduced?13:seconds;
 darts.forEach((g,i)=>{const p=clamp((t-.25-i*.16)/5.8),h=g.userData.hit;g.position.lerpVectors(g.userData.start,g.userData.target,p);g.rotation.set(0,0,0);g.visible=t>.65||i===0;g.children.forEach((child,j)=>child.visible=t>.65||j===0);
 if(h.n===0){const fall=ease((p-.6)/.4),end=new T.Vector3(-1+i*.65,-5.92,2.2);g.position.lerpVectors(g.userData.start,new T.Vector3(end.x,0,end.z),p);g.position.y-=5.92*fall;g.rotation.x=-fall*Math.PI/2;g.rotation.z=fall*.25;if(p>=1)g.position.y+=Math.sin((t-6.4)*14)*.025*Math.max(0,1-(t-6.4))}
 else if(p<1){g.position.y+=Math.sin(p*Math.PI)*.08;g.rotation.z=Math.sin(t*3+i)*.025*(1-p)}
 });
 const lead=darts[0]?.position||new T.Vector3(0,0,7);
 if(t<.65){camera.fov=28;camera.position.copy(lead).add(new T.Vector3(.04,.015,-.14));camera.lookAt(lead.clone().add(new T.Vector3(0,0,.09)))}
 else if(t<3.8){const u=ease((t-.65)/3.15),angle=u*Math.PI;const radius=.14+2.8*u;camera.fov=28+14*u;camera.position.set(lead.x+Math.sin(angle)*radius+.04*(1-u),lead.y+.015+.65*u,lead.z-Math.cos(angle)*radius);camera.lookAt(lead.clone().add(new T.Vector3(0,0,.09+.3*u)))}
 else {const u=ease((t-3.8)/4.1);camera.fov=42;camera.position.copy(lead).add(new T.Vector3(0,.665,2.94)).lerp(new T.Vector3(4,0,15.5),u);camera.lookAt(lead.clone().add(new T.Vector3(0,0,.39)).lerp(new T.Vector3(1,-2.1,0),u))}
 camera.updateProjectionMatrix();caption.textContent=t<.65?'La punta. Si parte.':t<3.8?'In volo · '+record.player:t<6.5?'Verso il bersaglio…':record.hits.map(h=>h.value).join(' + ')+' = '+record.total+' punti'+(record.hits.some(h=>h.n===0)?' · Miss sul divano!':'');
 host.dataset.phase=t<.65?'tip':t<3.8?'orbit':t<6.5?'flight':'result';host.dataset.leadZ=lead.z.toFixed(3);renderer.render(scene,camera)}
 function tick(now){if(!host.isConnected){dispose();return}render((now-start)/1000);if(!disposed)raf=requestAnimationFrame(tick)}
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();dispose();host.innerHTML='<p class="profile-note">Replay interrotto. Premi Rivedi il tiro per riprovare.</p>'},{once:true});
 raf=requestAnimationFrame(tick);
}
if(winner>=0)finishScreen();
