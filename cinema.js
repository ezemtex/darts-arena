/* Local, procedural 3D replay: steel tip, machined barrel, shaft and four flights. */
let stopCinema=()=>{};
const replayFallback=replayHTML;
replayHTML=function(){stopCinema();if(!bestTurn)return replayFallback();queueMicrotask(()=>startCinema(document.getElementById('cinema'),bestTurn));return '<h2>Miglior turno · '+bestTurn.total+' punti</h2><p>'+esc(bestTurn.player)+'</p><div id="cinema" aria-label="Replay tridimensionale del turno migliore"></div><p id="cinema-caption" aria-live="polite">Pronti al lancio</p><div class="replay-hits">'+bestTurn.hits.map((h,i)=>'<span style="--dart-color:'+['#edca7c','#70c9e7','#ed7fa3'][i]+'">'+hitLabel(h)+' · '+h.value+'</span>').join('')+'</div><p class="profile-note">'+bestTurn.hits.map(h=>h.value).join(' + ')+' = '+bestTurn.total+' punti · Ricostruzione dei settori colpiti'+(bestTurn.hits.length<3?' · Turno chiuso con '+bestTurn.hits.length+' freccette':'')+'</p>'};
const cinemaStyle=document.createElement('style');cinemaStyle.textContent='#cinema{height:clamp(320px,52vh,570px);position:relative;border:1px solid #435044;border-radius:18px;overflow:hidden;background:#101713}#cinema canvas{display:block;width:100%;height:100%}#cinema-caption{color:#edca7c;min-height:24px;font-size:14px}';document.head.append(cinemaStyle);
function startCinema(host,record){
 if(!host)return;stopCinema();let renderer;
 try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'low-power'})}catch(e){host.innerHTML='<p class="profile-note">La vista 3D non è disponibile su questo dispositivo. Il risultato del turno è riportato qui sotto.</p>';return}
 const T=THREE,scene=new T.Scene(),camera=new T.PerspectiveCamera(42,1,.01,80);scene.background=new T.Color('#101914');scene.fog=new T.Fog('#101914',14,40);renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;host.append(renderer.domElement);
 scene.add(new T.HemisphereLight(0xe4f3ff,0x42512d,2));const key=new T.DirectionalLight(0xffe4b0,3.5);key.position.set(-3,5,6);scene.add(key);const fill=new T.DirectionalLight(0x96dfff,2);fill.position.set(4,2,-3);scene.add(fill);
 const mat=(color,metalness=0,roughness=.65)=>new T.MeshStandardMaterial({color,metalness,roughness});const steel=mat('#c7d7db',.78,.23),dark=mat('#202b31',.65,.28),gold=mat('#d5a74c',.7,.25),orange=mat('#da6c25',0,.92);
 function mesh(geometry,material,parent=scene){const m=new T.Mesh(geometry,material);parent.add(m);return m}
 function box(w,h,d,x,y,z,material,parent=scene){const m=mesh(new T.BoxGeometry(w,h,d),material,parent);m.position.set(x,y,z);return m}
 // A quiet lounge, with an orange sofa below and to the right of the board.
 box(20,12,.15,0,0,-.22,mat('#1b2923'));box(20,.15,30,0,-2.1,8,mat('#30352c'));
 const sofa=new T.Group();scene.add(sofa);sofa.position.set(2,-1.6,.7);
 box(2.8,.38,1.15,0,0,0,orange,sofa);box(2.8,.85,.25,0,.55,-.48,orange,sofa);
 for(const x of [-.88,0,.88]){const cushion=mesh(new T.BoxGeometry(.84,.18,.94,2,2,2),mat('#ec8036'),sofa);cushion.position.set(x,.26,.06);box(.8,.55,.16,x,.6,-.3,mat('#d56a29'),sofa)}
 for(const x of [-1.43,1.43])box(.22,.68,1.2,x,.25,0,orange,sofa);
 for(const x of [-1.1,1.1])for(const z of [-.35,.35])box(.1,.3,.1,x,-.3,z,dark,sofa);
 // Canvas texture contains conventional board numbering and ring radii.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const ctx=canvas.getContext('2d'),C=512,S=3.35;
 ctx.fillStyle='#111713';ctx.fillRect(0,0,1024,1024);
 sectors.forEach((n,i)=>{const a=(i-.5)*Math.PI/10-Math.PI/2,b=(i+.5)*Math.PI/10-Math.PI/2;[[12,70],[70,77],[77,115],[115,123]].forEach(([r,R],j)=>{ctx.beginPath();ctx.arc(C,C,R*S,a,b);ctx.arc(C,C,r*S,b,a,true);ctx.closePath();ctx.fillStyle=j%2?(i%2?'#208553':'#be3040'):(i%2?'#e5d5b1':'#181e1a');ctx.fill();ctx.strokeStyle='#b4b7a7';ctx.lineWidth=1.5;ctx.stroke()});const [x,y]=point(137,i*Math.PI/10);ctx.fillStyle='#f2eddd';ctx.font='44px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(n,C+(x-150)*S,C+(y-150)*S)});
 for(const [r,color] of [[12,'#208553'],[5,'#be3040']]){ctx.beginPath();ctx.arc(C,C,r*S,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();ctx.stroke()}
 const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
 const board=mesh(new T.CylinderGeometry(1.45,1.45,.14,96),dark);board.rotation.x=Math.PI/2;board.position.z=-.07;
 mesh(new T.CircleGeometry(1.45,96),new T.MeshStandardMaterial({map:texture,roughness:.95})).position.z=.006;
 const rim=mesh(new T.TorusGeometry(1.45,.018,8,96),steel);rim.position.z=.015;
 function dart(index){const g=new T.Group();scene.add(g);const color=[0xe8b94e,0x39b6d4,0xdf5c85][index];
 // All lengths are measured from the point, toward the rear (+Z).
 function cylinder(r1,r2,length,z,material){const o=mesh(new T.CylinderGeometry(r2,r1,length,24),material,g);o.rotation.x=Math.PI/2;o.position.z=z;return o}
 cylinder(.001,.014,.24,.12,steel);cylinder(.025,.033,.07,.275,steel);cylinder(.034,.034,.28,.45,dark);cylinder(.033,.022,.08,.63,steel);
 for(let i=0;i<16;i++){const ring=mesh(new T.TorusGeometry(.034,.0035,6,24),i%4===0?gold:steel,g);ring.position.z=.32+i*.018}
 cylinder(.013,.011,.22,.77,steel);cylinder(.018,.018,.025,.89,gold);
 const shape=new T.Shape();shape.moveTo(0,.82);shape.lineTo(.12,.92);shape.lineTo(.105,1.1);shape.lineTo(.025,1.16);shape.lineTo(0,1.1);shape.closePath();
 const flightGeo=new T.ShapeGeometry(shape);flightGeo.rotateX(Math.PI/2);
 for(let j=0;j<4;j++){const flight=mesh(flightGeo,new T.MeshStandardMaterial({color,metalness:.3,roughness:.35,side:T.DoubleSide}),g);flight.rotation.z=j*Math.PI/2;const stripe=mesh(new T.BoxGeometry(.003,.002,.16),gold,g);stripe.position.set(Math.cos(j*Math.PI/2)*.07,Math.sin(j*Math.PI/2)*.07,1.01)}
 g.userData.index=index;return g}
 const darts=record.hits.map((h,i)=>{const g=dart(i);const [x,y]=hitPoint(h,i);g.userData.hit=h;g.userData.target=new T.Vector3((x-150)*S/512*1.45,(150-y)*S/512*1.45,.015);g.userData.start=new T.Vector3((i-1)*.48,(i-1)*.22,7+i*.25);g.position.copy(g.userData.start);return g});
 const caption=document.getElementById('cinema-caption');let raf=0,disposed=false,start=performance.now();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const clamp=x=>Math.max(0,Math.min(1,x)),ease=x=>{x=clamp(x);return x*x*(3-2*x)};
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
 const observer=new ResizeObserver(resize);observer.observe(host);resize();
 function dispose(){if(disposed)return;disposed=true;cancelAnimationFrame(raf);observer.disconnect();scene.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose())}});texture.dispose();renderer.dispose();renderer.forceContextLoss()}
 stopCinema=dispose;
 function render(seconds){const t=reduced?13:seconds;
 darts.forEach((g,i)=>{const p=ease((t-4.7-i*.3)/3.4),h=g.userData.hit;g.position.lerpVectors(g.userData.start,g.userData.target,p);g.rotation.set(0,0,0);g.visible=t>1.4||i===0;g.children.forEach((child,j)=>child.visible=t>1.4||j===0);
 if(h.n===0){const end=new T.Vector3(1.4+i*.33,-1.23,1);g.position.lerpVectors(g.userData.start,end,p);g.position.y+=Math.sin(p*Math.PI)*.7;g.rotation.x=-p*Math.PI/2;g.rotation.z=p*.45;if(p>=1)g.position.y+=Math.sin((t-8.7)*14)*.025*Math.max(0,1-(t-8.7))}
 else if(p<1){g.position.y+=Math.sin(p*Math.PI)*.08;g.rotation.z=Math.sin(t*3+i)*.025*(1-p)}
 });
 const lead=darts[0]?.position||new T.Vector3(0,0,7);
 if(t<1.4){camera.fov=28;camera.position.copy(lead).add(new T.Vector3(.055,.015,-.15));camera.lookAt(lead.clone().add(new T.Vector3(0,0,.09)))}
 else if(t<4.7){const u=ease((t-1.4)/3.3),angle=u*Math.PI;const radius=.15+3.2*u;camera.fov=28+14*u;camera.position.set(lead.x+Math.sin(angle)*radius+.055*(1-u),lead.y+.015+.7*u,lead.z-Math.cos(angle)*radius);camera.lookAt(lead.clone().add(new T.Vector3(0,0,.09)).lerp(new T.Vector3(0,0,7.3),u))}
 else {const u=ease((t-4.7)/5.5);camera.fov=42;camera.position.set(-.48*(1-u)+1.7*u,.495+.55*u,10.35*(1-u)+5.7*u);camera.lookAt(record.hits.some(h=>h.n===0)? .8:0,record.hits.some(h=>h.n===0)?-.35:0,7.3*(1-u))}
 camera.updateProjectionMatrix();caption.textContent=t<1.4?'La punta. Il momento prima del lancio.':t<4.7?'Il turno di '+record.player:t<8.9?'Verso il bersaglio…':record.hits.map(h=>h.value).join(' + ')+' = '+record.total+' punti'+(record.hits.some(h=>h.n===0)?' · Miss sul divano!':'');
 host.dataset.phase=t<1.4?'tip':t<4.7?'orbit':t<8.9?'flight':'result';renderer.render(scene,camera)}
 function tick(now){if(!host.isConnected){dispose();return}render((now-start)/1000);if(!disposed)raf=requestAnimationFrame(tick)}
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();dispose();host.innerHTML='<p class="profile-note">Replay interrotto. Premi Rivedi il tiro per riprovare.</p>'},{once:true});
 raf=requestAnimationFrame(tick);
}
if(winner>=0)finishScreen();
