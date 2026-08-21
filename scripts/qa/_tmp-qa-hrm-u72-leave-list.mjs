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
await page.goto(`${PORTAL}/hr/attendance?portal=1&tenantId=xevn&companyId=main`,{waitUntil:"networkidle2",timeout:90000});
await sleep(3500);
// Open requests dropdown then Nghỉ phép
await page.evaluate(()=>{
  const tabs=[...document.querySelectorAll("button,[role=tab]")];
  const req=tabs.find(b=>/Yêu cầu|Requests/i.test((b.textContent||"").trim()) && (b.textContent||"").length<40);
  req?.click();
});
await sleep(800);
await page.evaluate(()=>{
  const items=[...document.querySelectorAll("button,a,[role=menuitem],div")];
  const leave=items.find(b=>(b.textContent||"").trim()==="Nghỉ phép");
  leave?.click();
});
await sleep(2500);
// Click TabsTrigger requests
await page.evaluate(()=>{
  const byVal=document.querySelector('[role=tab][value=requests], button[value=requests]');
  if(byVal){byVal.click(); return;}
  const byText=[...document.querySelectorAll("[role=tab],button")].find(b=>/Danh sách yêu cầu|Request list/i.test((b.textContent||"").trim()));
  byText?.click();
});
await sleep(3000);
const out=await page.evaluate(()=>{
  const text=el=>(el?.textContent||"").replace(/\s+/g," ").trim();
  const isVisible=el=>{const st=getComputedStyle(el); if(st.display==="none"||st.visibility==="hidden"||st.opacity==="0")return false; const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
  const active=[...document.querySelectorAll("[role=tab][data-state=active]")].map(t=>text(t)).slice(0,10);
  const tables=[...document.querySelectorAll("table")].filter(isVisible).map(table=>({
    headers:[...table.querySelectorAll("th")].map(th=>text(th)),
    rows:[...table.querySelectorAll("tbody tr")].slice(0,8).map(tr=>[...tr.querySelectorAll("td")].map(td=>text(td)).slice(0,8))
  }));
  const leaveTable=tables.find(t=>t.headers.some(h=>/Loại nghỉ|leave/i.test(h))||t.headers.includes("Loại nghỉ")||t.headers.some(h=>/Loại/i.test(h)&&t.headers.some(x=>/Nhân|Employee/i.test(x))));
  const typeIdx=leaveTable?leaveTable.headers.findIndex(h=>/Loại/i.test(h)):-1;
  const types=leaveTable&&typeIdx>=0?leaveTable.rows.map(r=>r[typeIdx]).filter(Boolean):[];
  const rawVisible=[...document.querySelectorAll("td,span,badge")].filter(isVisible).map(n=>text(n)).filter(t=>/^(annual|sick|unpaid|LVT_\d+)$/i.test(t)).slice(0,20);
  // open first eye if any
  return {active,tables:tables.slice(0,3),types,rawVisible,url:location.href};
});
// Click eye on first row
await page.evaluate(()=>{
  const btn=[...document.querySelectorAll("button")].find(b=>b.querySelector("svg") && b.closest("tr"));
  btn?.click();
});
await sleep(1500);
const detail=await page.evaluate(()=>{
  const text=el=>(el?.textContent||"").replace(/\s+/g," ").trim();
  const isVisible=el=>{const st=getComputedStyle(el); if(st.display==="none"||st.visibility==="hidden")return false; const r=el.getBoundingClientRect(); return r.width>0&&r.height>0;};
  const dialog=document.querySelector('[role=dialog], .fixed');
  const body=text(dialog||document.body).slice(0,500);
  const rawVisible=[...document.querySelectorAll("td,span,p,div,badge")].filter(isVisible).map(n=>text(n)).filter(t=>/^(annual|sick|unpaid|LVT_\d+)$/i.test(t)).slice(0,15);
  const hasVi=/Phép năm|Nghỉ phép|Nghỉ ốm|Ốm|Nghỉ không/i.test(body);
  return {rawVisible,hasVi,body};
});
const result={list:out,detail,at:new Date().toISOString()};
writeFileSync("docs/qa/evidence/_tmp-qa-hrm-u72-leave-list-runtime.json",JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
await browser.close();
