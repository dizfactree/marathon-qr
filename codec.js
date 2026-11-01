"use strict";
// Recovered from AKA_Marathon_QR_Progress.md, protocol v1 (not copied original source).
window.GarminCodec={
 encode(name,time){
  name=name.normalize('NFC').trim();
  if(/[\u0000-\u001F\u007F-\u009F\u2028\u2029]/u.test(name))throw Error('줄바꿈과 제어문자는 사용할 수 없습니다.');
  // Allow ordinary punctuation and symbols; exclude graphical emoji sequences.
  if(/[\p{Emoji_Presentation}\uFE0F\u200D\u20E3]/u.test(name)) {
    throw Error('그림 이모지는 사용할 수 없습니다. 일반 특수문자를 사용해 주세요.');
  }
  const allowed = /^[\p{Script=Hangul}A-Za-z0-9\p{P}\p{S} ]+$/u;
  if (!allowed.test(name)) {
    throw Error('이름은 한글, 영문, 숫자와 일반 특수문자로 입력해 주세요.');
  }
  const points=Array.from(name);
  if(points.length<1||points.length>24)throw Error('이름은 1~24자로 입력해 주세요.');
  const match=/^(\d{2}):(\d{2}):(\d{2})$/.exec(time);
  if(!match)throw Error('완주 기록을 확인해 주세요.');
  const [h,m,s]=match.slice(1).map(Number);
  if(h>99||m>59||s>59||h+m+s===0)throw Error('완주 기록을 확인해 주세요.');
  const body='21801'+String(points.length).padStart(2,'0')+match[1]+match[2]+match[3]+points.map(x=>String(x.codePointAt(0)).padStart(7,'0')).join('');
  let remainder=0;for(const digit of body)remainder=(remainder*10+Number(digit))%97;
  return body+String(remainder).padStart(2,'0');
 },
 decode(data){
  if(!/^\d+$/.test(data)||!data.startsWith('21801'))throw Error('QR 형식 오류');
  const n=Number(data.slice(5,7));if(n<1||n>24||data.length!==15+n*7)throw Error('QR 길이 오류');
  let remainder=0;for(const digit of data.slice(0,-2))remainder=(remainder*10+Number(digit))%97;
  if(remainder!==Number(data.slice(-2)))throw Error('QR 확인값 오류');
  const tm=data.slice(7,13),h=Number(tm.slice(0,2)),m=Number(tm.slice(2,4)),s=Number(tm.slice(4,6));
  if(m>59||s>59||h+m+s===0)throw Error('기록 오류');
  let name='';for(let i=0;i<n;i++){const p=Number(data.slice(13+i*7,20+i*7));if(p>0x10FFFF||(p>=0xD800&&p<=0xDFFF))throw Error('이름 문자 오류');name+=String.fromCodePoint(p);}
  if(/[\u0000-\u001F\u007F-\u009F\u2028\u2029]/u.test(name))throw Error('이름 제어문자 오류');
  return {name,time:tm.slice(0,2)+':'+tm.slice(2,4)+':'+tm.slice(4,6)};
 }
};
