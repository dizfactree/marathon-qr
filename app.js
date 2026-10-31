"use strict";
const $=id=>document.getElementById(id);let activeSvg='';
function svgQR(data){const qr=new QRCodeEngine(0,1);qr.addData(data);qr.make();const n=qr.getModuleCount(),pad=4,size=n+pad*2;let path='';for(let y=0;y<n;y++)for(let x=0;x<n;x++)if(qr.isDark(y,x))path+=`M${x+pad} ${y+pad}h1v1h-1z`;return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="white"/><path fill="#111" d="${path}"/></svg>`;}
function switchView(isQR){$('input-view').hidden=isQR;$('qr-view').hidden=!isQR;document.querySelector('[data-step="1"]').classList.toggle('active',!isQR);document.querySelector('[data-step="2"]').classList.toggle('active',isQR);window.scrollTo(0,0)}
function numeric(id){const el=$(id);el.addEventListener('input',()=>{el.value=el.value.replace(/\D/g,'').slice(0,2)});}
for(const id of ['hours','minutes','seconds'])numeric(id);
$('entry').addEventListener('submit',e=>{e.preventDefault();$('error').textContent='';try{
  const name=$('name').value.normalize('NFC').trim();const vals=['hours','minutes','seconds'].map(id=>$(id).value);
  if(vals.some(v=>!/^\d{1,2}$/.test(v)))throw Error('시간, 분, 초를 모두 입력해 주세요.');
  const time=vals.map(x=>x.padStart(2,'0')).join(':');const encoded=GarminCodec.encode(name,time);
  const decoded=GarminCodec.decode(encoded);if(decoded.name!==name||decoded.time!==time)throw Error('QR 데이터 검증에 실패했습니다.');
  activeSvg=svgQR(encoded);$('qr').innerHTML=activeSvg;document.querySelector('.result-name').textContent=name;document.querySelector('.result-time').textContent=time;switchView(true);
 }catch(err){$('error').textContent=err.message||'입력 정보를 확인해 주세요.';}});
$('edit').addEventListener('click',()=>switchView(false));
$('download').addEventListener('click',()=>{if(!activeSvg)return;const blob=new Blob([activeSvg],{type:'image/svg+xml;charset=utf-8'}),url=URL.createObjectURL(blob),img=new Image();img.onload=()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=900;const c=canvas.getContext('2d');c.fillStyle='white';c.fillRect(0,0,900,900);c.drawImage(img,0,0,900,900);URL.revokeObjectURL(url);canvas.toBlob(blob=>{if(!blob){alert('이미지 저장에 실패했습니다.');return;}const link=document.createElement('a'),temp=URL.createObjectURL(blob);link.href=temp;link.download='GARMIN_RUN_QR.png';document.body.appendChild(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(temp),2000)},'image/png')};img.onerror=()=>{URL.revokeObjectURL(url);alert('이미지 저장에 실패했습니다.')};img.src=url;});
