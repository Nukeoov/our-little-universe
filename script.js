'use strict';
const SITE_PATH = 'data/site.json';
let siteData;
const $ = (id) => document.getElementById(id);
const escapeHTML = (value) => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const imageSafe = (path) => /^(?!\/)(?!.*\.\.)(?:assets\/)[a-zA-Z0-9_./-]+$/.test(path) ? path : 'assets/memory-01.svg';
const dateDisplay = (s) => { const d = new Date(`${s}T12:00:00`); return Number.isNaN(d.getTime()) ? s : new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric'}).format(d); };
async function loadSite() {
  try { const r = await fetch(`${SITE_PATH}?v=${Date.now()}`,{cache:'no-store'}); if(!r.ok) throw Error('Không tải được data/site.json'); siteData=await r.json(); render(); }
  catch(e) { console.error(e); $('timelineList').textContent='Không thể tải dữ liệu. Hãy mở bằng Live Server hoặc GitHub Pages (không mở file:// trực tiếp).'; }
}
function render() {
  $('personOneName').textContent=siteData.personOne.name; $('personTwoName').textContent=siteData.personTwo.name;
  $('personOneLocation').textContent=siteData.personOne.location; $('personTwoLocation').textContent=siteData.personTwo.location;
  $('personOneImg').src=imageSafe(siteData.personOne.photo); $('personTwoImg').src=imageSafe(siteData.personTwo.photo);
  $('loveNote').textContent=siteData.loveNote;
  const memories=[...(siteData.memories||[])].sort((a,b)=>a.date.localeCompare(b.date));
  $('timelineList').innerHTML=memories.length?memories.map(m=>`<article class="timeline-entry"><div class="memory-image"><img loading="lazy" src="${imageSafe(m.image)}" alt="${escapeHTML(m.place)}"></div><div class="memory-copy"><div class="memory-date">♡ ${escapeHTML(dateDisplay(m.date))}</div><h3 class="memory-place">📍 ${escapeHTML(m.place)}</h3><p>${escapeHTML(m.caption)}</p></div></article>`).join(''):'<p style="text-align:center">Chưa có kỷ niệm nào. Nhấn + để thêm nhé ♡</p>';
  // Six staggered polaroids per seamless loop, randomized from saved memories.
  // The duplicate loop is identical so the marquee never jumps at its boundary.
  const track = $('photoTrack');
  if (memories.length) {
    const shuffle = (array) => {
      const copy = [...array];
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
      }
      return copy;
    };
    const pool = shuffle(memories);
    const selected = [];
    for (let i = 0; i < 6; i++) {
      if (i > 0 && i % pool.length === 0) pool.splice(0, pool.length, ...shuffle(memories));
      selected.push(pool[i % pool.length]);
    }
    const tilts = [-5, 3, -3, 5, -4, 2];
    const cards = selected.map((m, i) => `
      <figure class="polaroid ${i % 2 === 0 ? 'up' : 'down'}" style="--tilt:${tilts[i]}deg">
        <img loading="lazy" src="${imageSafe(m.image)}" alt="${escapeHTML(m.place)}">
        <figcaption>♡ ${escapeHTML(m.place)}</figcaption>
      </figure>`).join('');
    track.innerHTML = `<div class="gallery-loop">${cards}</div><div class="gallery-loop" aria-hidden="true">${cards}</div>`;
  } else {
    track.innerHTML = '';
  }
  tick();
}
function tick() {
  const start = siteData?.startDate;
  if (!start) {
    $('countYears').textContent = '0';
    $('countDays').textContent = '—';
    ['countHours','countMinutes','countSeconds'].forEach(id => $(id).textContent = '00');
    $('sinceLabel').textContent = 'Chọn ngày bắt đầu yêu trong phần chỉnh sửa ♡';
    return;
  }

  const began = new Date(`${start}T00:00:00`);
  if (Number.isNaN(began.getTime())) return;
  const now = new Date();
  let years = Math.max(0, now.getFullYear() - began.getFullYear());

  // Calendar anniversaries, not a fixed 365-day estimate.
  // Feb 29 anniversaries fall on Mar 1 in non-leap years.
  const anniversary = (numberOfYears) => new Date(
    began.getFullYear() + numberOfYears,
    began.getMonth(),
    began.getDate()
  );
  while (years > 0 && anniversary(years) > now) years--;
  while (anniversary(years + 1) <= now) years++;

  let remaining = Math.max(0, now.getTime() - anniversary(years).getTime());
  const days = Math.floor(remaining / 86400000);
  remaining %= 86400000;
  const hours = Math.floor(remaining / 3600000);
  remaining %= 3600000;
  const minutes = Math.floor(remaining / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  $('countYears').textContent = years;
  $('countDays').textContent = days;
  $('countHours').textContent = String(hours).padStart(2, '0');
  $('countMinutes').textContent = String(minutes).padStart(2, '0');
  $('countSeconds').textContent = String(seconds).padStart(2, '0');
  $('sinceLabel').textContent = `since ${dateDisplay(start)} ♡`;
}
setInterval(tick,1000);
$('openAdmin').onclick=()=>{$('toolChooser').hidden=!$('toolChooser').hidden};
$('chooseMemory').onclick=()=>{$('toolChooser').hidden=true;$('editorDialog').showModal();};
$('addMemory').onclick=()=>{$('editorDialog').showModal();};
$('chooseSettings').onclick=()=>{$('toolChooser').hidden=true;const p=siteData;$('settingOneName').value=p.personOne.name;$('settingTwoName').value=p.personTwo.name;$('settingOnePlace').value=p.personOne.location;$('settingTwoPlace').value=p.personTwo.location;$('settingStartDate').value=p.startDate||'';$('settingNote').value=p.loveNote;$('settingsDialog').showModal();};
$('closeEditor').onclick=()=>$('editorDialog').close();$('closeSettings').onclick=()=>$('settingsDialog').close();
$('memoryImage').onchange=()=>{const f=$('memoryImage').files[0];const old=$('imagePreview').dataset.objectUrl;if(old)URL.revokeObjectURL(old);if(!f){$('imagePreview').hidden=true;return;}const url=URL.createObjectURL(f);$('imagePreview').src=url;$('imagePreview').dataset.objectUrl=url;$('imagePreview').hidden=false;};
function validateGithub(owner,repo,branch,token){if(!/^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(owner)||!/^[\w.-]+$/.test(repo)||!branch||/[?#[\s]/.test(branch))throw Error('Username, repo hoặc branch không hợp lệ.');if(!token.startsWith('github_pat_')&&!token.startsWith('ghp_'))throw Error('Hãy nhập GitHub Personal Access Token hợp lệ.');}
async function ghRequest(owner,repo,token,path,method='GET',body){const [filePath,query] = path.split('?');const url=`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${filePath.split('/').map(encodeURIComponent).join('/')}${query?'?'+query:''}`;const response=await fetch(url,{method,headers:{'Accept':'application/vnd.github+json','Authorization':`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});let value;try{value=await response.json()}catch{value={}}if(!response.ok)throw Error(`GitHub ${response.status}: ${value.message||'Request failed'}${response.status===404?' (kiểm tra tên repo, branch và quyền token)':''}`);return value;}
async function getSha(owner,repo,branch,token,path){try{const r=await ghRequest(owner,repo,token,`${path}?ref=${encodeURIComponent(branch)}`);return r.sha;}catch(e){if(e.message.includes('GitHub 404:'))return undefined;throw e;}}
function base64Bytes(bytes){let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);}
function base64Text(text){return base64Bytes(new TextEncoder().encode(text));}
async function putFile(owner,repo,branch,token,path,base64,message){const sha=await getSha(owner,repo,branch,token,path);return ghRequest(owner,repo,token,path,'PUT',{message,content:base64,branch,...(sha?{sha}:{})});}
async function convertImage(file){if(!file||!file.type.startsWith('image/'))throw Error('Chọn file ảnh hợp lệ.');if(file.size>20*1024*1024)throw Error('Ảnh gốc quá lớn (tối đa 20 MB).');const bmp=await createImageBitmap(file);const scale=Math.min(1,1600/Math.max(bmp.width,bmp.height));const cv=document.createElement('canvas');cv.width=Math.round(bmp.width*scale);cv.height=Math.round(bmp.height*scale);cv.getContext('2d').drawImage(bmp,0,0,cv.width,cv.height);bmp.close?.();const blob=await new Promise(res=>cv.toBlob(res,'image/jpeg',.82));if(!blob)throw Error('Không xử lý được ảnh.');return new Uint8Array(await blob.arrayBuffer());}
function formConfig(prefix){const setting=prefix==='settings';const owner=$(setting?'settingsOwner':'githubOwner').value.trim();const repo=$(setting?'settingsRepo':'githubRepo').value.trim();const branch=$(setting?'settingsBranch':'githubBranch').value.trim();const token=$(setting?'settingsToken':'githubToken').value.trim();validateGithub(owner,repo,branch,token);return{owner,repo,branch,token};}
async function ensureFreshData({owner,repo,branch,token}){const r=await ghRequest(owner,repo,token,`${SITE_PATH}?ref=${encodeURIComponent(branch)}`);const text=decodeURIComponent(escape(atob(r.content.replace(/\s/g,''))));return JSON.parse(text);}
async function saveImage(cfg,file){const bytes=await convertImage(file);const name=`assets/photo-${Date.now()}-${Math.random().toString(36).slice(2,8)}.jpg`;await putFile(cfg.owner,cfg.repo,cfg.branch,cfg.token,name,base64Bytes(bytes),`Add our photo: ${name}`);return name;}
function status(id,msg,error=false){$(id).textContent=msg;$(id).style.color=error?'#bf466d':'#668b76';}
$('editorForm').onsubmit=async(e)=>{e.preventDefault();const btn=$('saveMemory');btn.disabled=true;try{const cfg=formConfig('memory');status('editorMessage','Uploading photo to GitHub...');const image=await saveImage(cfg,$('memoryImage').files[0]);status('editorMessage','Saving timeline entry...');const fresh=await ensureFreshData(cfg);fresh.memories??=[];fresh.memories.push({id:`memory-${Date.now()}`,date:$('memoryDate').value,place:$('memoryPlace').value.trim(),caption:$('memoryCaption').value.trim(),image});await putFile(cfg.owner,cfg.repo,cfg.branch,cfg.token,SITE_PATH,base64Text(JSON.stringify(fresh,null,2)+'\n'),'Add a memory to our timeline');siteData=fresh;render();status('editorMessage','✓ Đã lưu lên GitHub! GitHub Pages sẽ tự deploy sau một lúc.');$('memoryImage').value='';$('memoryDate').value='';$('memoryPlace').value='';$('memoryCaption').value='';$('githubToken').value='';}catch(e){status('editorMessage',e.message,true)}finally{btn.disabled=false;}};
$('settingsForm').onsubmit=async(e)=>{e.preventDefault();const btn=$('saveSettings');btn.disabled=true;try{const cfg=formConfig('settings');status('settingsMessage','Đang lưu thiết lập...');const fresh=await ensureFreshData(cfg);fresh.personOne.name=$('settingOneName').value.trim();fresh.personTwo.name=$('settingTwoName').value.trim();fresh.personOne.location=$('settingOnePlace').value.trim();fresh.personTwo.location=$('settingTwoPlace').value.trim();fresh.startDate=$('settingStartDate').value;fresh.loveNote=$('settingNote').value.trim();if($('settingOnePhoto').files[0]){status('settingsMessage','Uploading your photo...');fresh.personOne.photo=await saveImage(cfg,$('settingOnePhoto').files[0]);}if($('settingTwoPhoto').files[0]){status('settingsMessage','Uploading her photo...');fresh.personTwo.photo=await saveImage(cfg,$('settingTwoPhoto').files[0]);}await putFile(cfg.owner,cfg.repo,cfg.branch,cfg.token,SITE_PATH,base64Text(JSON.stringify(fresh,null,2)+'\n'),'Update our love story');siteData=fresh;render();status('settingsMessage','✓ Đã cập nhật GitHub! Trang public sẽ đổi sau khi deploy.');$('settingsToken').value='';}catch(e){status('settingsMessage',e.message,true)}finally{btn.disabled=false;}};
loadSite();
