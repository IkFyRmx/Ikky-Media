(() => {
  const cfg = window.IKKY_CONFIG || {};
  const configured = cfg.SUPABASE_URL && !cfg.SUPABASE_URL.includes("YOUR-PROJECT")
    && cfg.SUPABASE_ANON_KEY && !cfg.SUPABASE_ANON_KEY.includes("YOUR_");
  const client = configured && window.supabase ? window.supabase.createClient(cfg.SUPABASE_URL, cfg.SUPABASE_ANON_KEY) : null;
  const $ = id => document.getElementById(id);
  let allArticles = [], currentCategory = "Semua", selectedImageUrl = "";
  const placeholder = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450"><rect width="100%" height="100%" fill="#e4ebf3"/><text x="50%" y="52%" text-anchor="middle" font-family="Arial" font-size="46" font-weight="bold" fill="#6680a1">IKKY MEDIA</text></svg>');
  const escapeHtml = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const dateText = d => new Date(d).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});
  const toast = msg => { $("toast").textContent=msg; $("toast").classList.remove("hidden"); setTimeout(()=>$("toast").classList.add("hidden"),3000); };
  const modal = (id,show) => $(id).classList.toggle("hidden",!show);
  $("today").textContent = new Date().toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
  $("year").textContent = new Date().getFullYear();

  function renderArticles() {
    const items = allArticles.filter(a => currentCategory==="Semua" || a.category===currentCategory);
    $("articleGrid").innerHTML = items.map(a => `
      <article class="article-card" data-article="${escapeHtml(a.id)}">
        <div class="card-image">${a.image_url ? `<img src="${escapeHtml(a.image_url)}" alt="${escapeHtml(a.title)}" loading="lazy">` : `<div class="card-placeholder">IM.</div>`}</div>
        <div class="card-copy"><div class="card-meta"><b>${escapeHtml(a.category)}</b><span>•</span><span>${dateText(a.published_at || a.created_at)}</span></div>
        <h3>${escapeHtml(a.title)}</h3><p>${escapeHtml(a.excerpt || "")}</p><span class="read-more">BACA SELENGKAPNYA →</span></div>
      </article>`).join("");
    $("emptyState").classList.toggle("hidden",items.length!==0);
    $("articleGrid").classList.toggle("hidden",items.length===0);
    document.querySelectorAll(".article-card").forEach(card=>card.addEventListener("click",()=>openArticle(card.dataset.article)));
  }
  async function loadPublic() {
    if(!client){$("articleGrid").innerHTML='<div class="loading">Website siap. Hubungkan Supabase melalui config.js dan schema.sql untuk menampilkan artikel.</div>';return;}
    const {data,error}=await client.from("articles").select("*").eq("status","published").order("published_at",{ascending:false});
    if(error){$("articleGrid").innerHTML='<div class="loading">Belum bisa memuat artikel. Periksa konfigurasi Supabase.</div>';console.error(error);return;}
    allArticles=data||[];renderArticles();
  }
  function openArticle(id) {
    const a=allArticles.find(x=>String(x.id)===String(id)); if(!a)return;
    $("readerContent").innerHTML=`<div class="eyebrow">${escapeHtml(a.category)}</div><h1>${escapeHtml(a.title)}</h1><div class="reader-meta">Oleh ${escapeHtml(a.author||"Redaksi Ikky Media")} · ${dateText(a.published_at||a.created_at)}</div>${a.image_url?`<img src="${escapeHtml(a.image_url)}" alt="${escapeHtml(a.title)}">`:""}<div class="reader-body">${escapeHtml(a.body)}</div>`;
    modal("articleModal",true);history.replaceState(null,"",`#artikel-${encodeURIComponent(a.slug||a.id)}`);
  }
  $("filters").addEventListener("click",e=>{const b=e.target.closest("[data-category]");if(!b)return;currentCategory=b.dataset.category;document.querySelectorAll(".filter").forEach(x=>x.classList.toggle("active",x===b));renderArticles();});
  $("adminOpen").onclick=()=>{modal("adminModal",true);refreshAuth();};
  $("menuBtn").onclick=()=>$("mainNav").classList.toggle("open");
  document.querySelectorAll("[data-close]").forEach(el=>el.addEventListener("click",()=>modal(el.dataset.close,false)));
  document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>switchTab(b.dataset.tab));
  function switchTab(tab){document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));$("editorTab").classList.toggle("hidden",tab!=="editor");$("manageTab").classList.toggle("hidden",tab!=="manage");if(tab==="manage")loadAdminArticles();}
  async function refreshAuth(){
    if(!client){$("loginBox").classList.remove("hidden");$("dashboard").classList.add("hidden");$("loginBox").querySelector(".form-note").textContent="Konfigurasi Supabase belum diisi. Ikuti README.md terlebih dahulu.";return;}
    const {data}=await client.auth.getSession();
    if(data.session && data.session.user.email===cfg.ADMIN_EMAIL){showDashboard(data.session.user.email);}
    else{$("loginBox").classList.remove("hidden");$("dashboard").classList.add("hidden");}
  }
  function showDashboard(email){$("loginBox").classList.add("hidden");$("dashboard").classList.remove("hidden");$("adminIdentity").textContent="Login sebagai "+email;switchTab("editor");}
  $("loginBtn").onclick=async()=>{
    const email=$("loginEmail").value.trim(),password=$("loginPassword").value;
    if(!email||!password){toast("Isi email dan password.");return;}
    if(email.toLowerCase()!==String(cfg.ADMIN_EMAIL).toLowerCase()){toast("Email ini bukan email admin yang diatur.");return;}
    const {data,error}=await client.auth.signInWithPassword({email,password});
    if(error){toast("Login gagal: "+error.message);return;} showDashboard(data.user.email);toast("Berhasil masuk.");
  };
  $("logoutBtn").onclick=async()=>{await client.auth.signOut();$("dashboard").classList.add("hidden");$("loginBox").classList.remove("hidden");toast("Kamu sudah keluar.");};
  $("articleImage").onchange=()=>{
    const f=$("articleImage").files[0];if(!f)return;
    if(!["image/jpeg","image/png","image/webp"].includes(f.type)){toast("Gunakan JPG, PNG, atau WebP.");return;}
    if(f.size>5*1024*1024){toast("Ukuran foto maksimal 5 MB.");$("articleImage").value="";return;}
    const url=URL.createObjectURL(f);$("imagePreview").innerHTML=`<img src="${url}" alt="Preview foto">`; $("imagePreview").classList.remove("hidden");
  };
  function resetForm(){
    $("articleForm").reset();$("articleId").value="";$("articleAuthor").value="Redaksi Ikky Media";$("imagePreview").classList.add("hidden");selectedImageUrl="";$("cancelEdit").classList.add("hidden");$("saveBtn").innerHTML='Simpan artikel <span>→</span>';$("formMessage").textContent="";
  }
  $("cancelEdit").onclick=resetForm;
  $("articleForm").onsubmit=async e=>{
    e.preventDefault();if(!client)return;
    const id=$("articleId").value, file=$("articleImage").files[0];let imageUrl=selectedImageUrl;
    $("saveBtn").disabled=true;$("formMessage").textContent="Menyimpan artikel...";
    try{
      if(file){
        const ext=file.name.split(".").pop().toLowerCase(),path=`${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const {error:upErr}=await client.storage.from(cfg.STORAGE_BUCKET).upload(path,file,{upsert:false,contentType:file.type});
        if(upErr)throw upErr;
        const {data}=client.storage.from(cfg.STORAGE_BUCKET).getPublicUrl(path);imageUrl=data.publicUrl;
      }
      const status=$("articleStatus").value,title=$("articleTitle").value.trim();
      const slug=title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")+"-"+Date.now().toString().slice(-5);
      const payload={title,slug,category:$("articleCategory").value,author:$("articleAuthor").value.trim()||"Redaksi Ikky Media",excerpt:$("articleExcerpt").value.trim(),body:$("articleBody").value.trim(),image_url:imageUrl,status,published_at:status==="published"?new Date().toISOString():null};
      let result=id?await client.from("articles").update(payload).eq("id",id):await client.from("articles").insert(payload);
      if(result.error)throw result.error;
      $("formMessage").textContent="Artikel berhasil disimpan.";resetForm();await loadPublic();toast("Artikel berhasil disimpan.");
    }catch(err){$("formMessage").textContent="Gagal: "+err.message;console.error(err);}
    finally{$("saveBtn").disabled=false;}
  };
  async function loadAdminArticles(){
    const {data,error}=await client.from("articles").select("*").order("created_at",{ascending:false});
    if(error){$("adminArticles").textContent="Gagal memuat artikel: "+error.message;return;}
    $("adminArticles").innerHTML=(data||[]).map(a=>`<div class="admin-item"><div><strong>${escapeHtml(a.title)}</strong><small>${escapeHtml(a.category)} · ${a.status==="published"?"Terbit":"Draft"} · ${dateText(a.created_at)}</small></div><div class="admin-item-actions"><button data-edit="${a.id}">Edit</button><button class="delete" data-delete="${a.id}">Hapus</button></div></div>`).join("")||'<p class="form-note">Belum ada artikel.</p>';
    $("adminArticles").querySelectorAll("[data-edit]").forEach(b=>b.onclick=()=>editArticle(b.dataset.edit));
    $("adminArticles").querySelectorAll("[data-delete]").forEach(b=>b.onclick=()=>deleteArticle(b.dataset.delete));
  }
  async function editArticle(id){
    const {data,error}=await client.from("articles").select("*").eq("id",id).single();if(error){toast(error.message);return;}
    $("articleId").value=data.id;$("articleTitle").value=data.title;$("articleCategory").value=data.category;$("articleAuthor").value=data.author||"";$("articleExcerpt").value=data.excerpt||"";$("articleBody").value=data.body;$("articleStatus").value=data.status;selectedImageUrl=data.image_url||"";
    $("imagePreview").innerHTML=data.image_url?`<img src="${escapeHtml(data.image_url)}" alt="Foto saat ini">`:"";$("imagePreview").classList.toggle("hidden",!data.image_url);$("cancelEdit").classList.remove("hidden");$("saveBtn").innerHTML='Perbarui artikel <span>→</span>';switchTab("editor");
  }
  async function deleteArticle(id){
    if(!confirm("Hapus artikel ini? Tindakan ini tidak bisa dibatalkan."))return;
    const {error}=await client.from("articles").delete().eq("id",id);if(error){toast("Gagal menghapus: "+error.message);return;}toast("Artikel dihapus.");await loadAdminArticles();await loadPublic();
  }
  loadPublic();
})();