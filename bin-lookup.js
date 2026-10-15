exports.handler = async (event) => {
  const headers = {"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"};
  const reply=(statusCode,body)=>({statusCode,headers,body:JSON.stringify(body)});
  if(event.httpMethod!=="POST") return reply(405,{ok:false,error:"POST only"});
  let input; try{input=JSON.parse(event.body||"{}")}catch{return reply(400,{ok:false,error:"Invalid JSON"})}
  const bin=String(input.bin||"").trim();
  if(!/^\d{6,8}$/.test(bin)) return reply(400,{ok:false,error:"Only 6–8 digit BIN/IIN prefixes are accepted"});
  try{
    const res=await fetch("https://lookup.binlist.net/"+encodeURIComponent(bin),{headers:{"Accept-Version":"3","Accept":"application/json"}});
    if(res.status===404) return reply(200,{ok:true,country:"Unknown",bank:"Unknown",network:"Unknown",type:"Unknown",level:"Unknown"});
    if(!res.ok) return reply(502,{ok:false,error:"BIN provider returned HTTP "+res.status});
    const d=await res.json(),c=d.country||{},b=d.bank||{};
    return reply(200,{ok:true,country:c.name||c.alpha2||"Unknown",bank:b.name||"Unknown",network:d.scheme||"Unknown",type:d.type||"Unknown",level:d.brand||"Unknown"});
  }catch{return reply(502,{ok:false,error:"Could not reach BIN lookup provider"});}
};