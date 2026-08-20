import puppeteer from "puppeteer";
import { writeFileSync } from "node:fs";
const PORTAL="http://127.0.0.1:5173";
const XBOS="http://127.0.0.1:28002";
const CHROME=process.env.PUPPETEER_EXECUTABLE_PATH||"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const login=await(await fetch(`${XBOS}/api/xbos/auth/login`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:"ceo@xe.vn",password:"Xevn@2026"})})).json();
const data=login?.data??login; const token=data.accessToken||data.access_token;
const browser=await puppeteer.launch({headless:true,executablePath:CHROME,args:["--no-sandbox","--disable-dev-shm-usage"],defaultViewport:{width:1440,height:900}});
const page=await browser.newPage();
await page.evaluateOnNewDocument((s)=>{for(const store of [localStorage,sessionStorage]){store.setItem("xevn.portal.accessToken",s.token);store.setItem("xevn.portal.tokenExpiresAt",String(s.expiresAt));store.setItem("xevn.portal.user",JSON.stringify(s.user));store.setItem("xevn.portal.tenantId","xevn");store.setItem("xevn.portal.companyId","main");}},{token,expiresAt:Date.now()+8e6,user:data.user||{userId:"ceo@xe.vn",email:"ceo@xe.vn",roles:["group_ceo"]}});
const out={};
const empId="ff16d855-41e4-4390-8381-9ec56262848c";
await page.goto(`${PORTAL}/hr/employees/${empId}?portal=1&tenantId=xevn&companyId=main`,{waitUntil:"networkidle2",timeout:90000});
await sleep(3000);
out.profile=await page.evaluate(()=>{
  const body=(document.body?.innerText||"").replace(/\s+/g," ");
  const grab=(lab)=>{const i=body.indexOf(lab); return i>=0?body.slice(i,i+90):null;};
  return {
    gender: grab("Giới tính"),
    job: grab("Chức"),
    dept: grab("Phòng"),
    empType: grab("Loại hình"),
    workLoc: grab("Địa điểm")||grab("Nơi làm"),
    hasMale:/\bmale\b/i.test(body),
    hasJobKey:/LEGAL_SPECIALIST|job_title_key/i.test(body),
    hasNam:/\bNam\b/.test(body),
    url:location.href,
    slice:body.slice(0,500)
  };
});
// Leave: hover/click Requests menu carefully
await page.goto(`${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`,{waitUntil:"networkidle2",timeout:90000});
await sleep(3000);
// Click the requests tab with dropdown
const reqHandle = await page.evaluateHandle(() => {
  return [...document.querySelectorAll("button")].find(b => /Yêu cầu/.test(b.textContent||"") && (b.textContent||"").length < 50) || null;
});
if (reqHandle) {
  const box = await reqHandle.asElement()?.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
    await sleep(400);
    await page.mouse.click(box.x + box.width/2, box.y + box.height/2);
  }
}
await sleep(600);
// click Nghỉ phép in menu
await page.evaluate(() => {
  const el = [...document.querySelectorAll("button,a,div,span")].find(b => (b.textContent||"").trim() === "Nghỉ phép" && b.getBoundingClientRect().height > 0);
  el?.dispatchEvent(new MouseEvent("click",{bubbles:true}));
});
await sleep(2500);
// Force select requests tab via Radix
const clicked = await page.evaluate(() => {
  const triggers = [...document.querySelectorAll("[role=tab]")];
  const t = triggers.find(x => /Danh sách|request/i.test(x.textContent||"") || x.getAttribute("value")==="requests");
  if (!t) return {ok:false, tabs: triggers.map(x=>({text:(x.textContent||"").trim().slice(0,40), value:x.getAttribute("value"), state:x.getAttribute("data-state")}))};
  t.click();
  return {ok:true, text:(t.textContent||"").trim(), value:t.getAttribute("value")};
});
out.leaveClick = clicked;
await sleep(3000);
out.leave = await page.evaluate(() => {
  const text = el => (el?.textContent||"").replace(/\s+/g," ").trim();
  const isVisible = el => { const st=getComputedStyle(el); if(st.display==="none"||st.visibility==="hidden") return false; const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
  const active = [...document.querySelectorAll("[role=tab][data-state=active]")].map(t=>text(t)).slice(0,8);
  const tables = [...document.querySelectorAll("table")].filter(isVisible).map(table => ({
    headers: [...table.querySelectorAll("th")].map(th=>text(th)),
    rows: [...table.querySelectorAll("tbody tr")].slice(0,6).map(tr => [...tr.querySelectorAll("td")].map(td=>text(td)).slice(0,8))
  }));
  const rawVisible = [...document.querySelectorAll("td,span,badge")].filter(isVisible).map(n=>text(n)).filter(t=>/^(annual|sick|unpaid|LVT_\d+)$/i.test(t)).slice(0,20);
  const viTypes = [...document.querySelectorAll("td span, td badge, td")].filter(isVisible).map(n=>text(n)).filter(t=>/Phép năm|Nghỉ ốm|Ốm|Nghỉ phép|không lương/i.test(t)).slice(0,15);
  return {active, tables: tables.slice(0,2), rawVisible, viTypes, url: location.href};
});
// Recruitment
await page.goto(`${PORTAL}/hr/recruitment?portal=1&tenantId=xevn&companyId=main`,{waitUntil:"networkidle2",timeout:90000});
await sleep(3500);
out.recruitment = await page.evaluate(() => {
  const text = el => (el?.textContent||"").replace(/\s+/g," ").trim();
  const tables = [...document.querySelectorAll("table")].map(table => ({
    headers: [...table.querySelectorAll("th")].map(th=>text(th)),
    rows: [...table.querySelectorAll("tbody tr")].slice(0,5).map(tr => [...tr.querySelectorAll("td")].map(td=>text(td)).slice(0,6))
  }));
  const body = text(document.body);
  return {
    tables: tables.slice(0,2),
    hasFullTimeRaw: /full[_-]?time/i.test(body),
    hasToan: /Toàn thời gian/.test(body),
    hasSlug: /\btrsport\b/i.test(body),
    hasSingle: /\bsingle\b/i.test(body),
    url: location.href
  };
});
// Settings master
await page.goto(`${PORTAL}/hr/settings?portal=1&tenantId=xevn&companyId=main`,{waitUntil:"networkidle2",timeout:90000});
await sleep(2500);
await page.evaluate(() => {
  const el = [...document.querySelectorAll("button,a,[role=tab]")].find(b => /Master data|Danh mục dùng chung|Danh mục/i.test(b.textContent||""));
  el?.click();
});
await sleep(2000);
out.settings = await page.evaluate(() => {
  const text = el => (el?.textContent||"").replace(/\s+/g," ").trim();
  const isVisible = el => { const st=getComputedStyle(el); if(st.display==="none"||st.visibility==="hidden") return false; const r=el.getBoundingClientRect(); return r.width>0&&r.height>0; };
  const rawVisible = [...document.querySelectorAll("td,span,badge")].filter(isVisible).map(n=>text(n)).filter(t=>/^(active|draft)$/i.test(t)).slice(0,15);
  const vi = [...document.querySelectorAll("td,span,badge")].filter(isVisible).map(n=>text(n)).filter(t=>/Đang dùng|Nháp/.test(t)).slice(0,15);
  const headers = [...document.querySelectorAll("table th")].map(th=>text(th)).slice(0,12);
  return {rawVisible, vi, headers, url: location.href, slice: text(document.body).slice(0,350)};
});
writeFileSync("docs/qa/evidence/_tmp-qa-hrm-u72-spot2-runtime.json", JSON.stringify(out,null,2));
console.log(JSON.stringify(out,null,2));
await browser.close();
